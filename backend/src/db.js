/**
 * Database access for the KaziHub API.
 *
 * Production uses PostgreSQL through `DATABASE_URL` (a standard connection
 * string). Local development and tests use PGlite — a real PostgreSQL build
 * compiled to WebAssembly — persisted under `backend/data/pglite`. Both expose
 * the same small surface: `query`, `transaction`, `close`.
 *
 * There is deliberately no ORM: the schema lives in `backend/migrations` and
 * every query is plain SQL, so deployments can be audited and migrated with
 * `npm run db:migrate`.
 */

const path = require("node:path");

let driverPromise = null;

function sslConfig(connectionString) {
  if (process.env.PGSSL === "disable") return false;
  if (process.env.PGSSL === "require") return { rejectUnauthorized: false };
  try {
    const url = new URL(connectionString);
    const mode = url.searchParams.get("sslmode");
    if (mode === "disable") return false;
    if (mode === "require" || mode === "verify-ca" || mode === "verify-full") {
      return { rejectUnauthorized: mode !== "verify-full" };
    }
    // Render's internal database URLs do not use TLS; external ones do.
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return { rejectUnauthorized: false };
    }
  } catch {
    // Fall through to no TLS for malformed local URLs.
  }
  return false;
}

async function createPostgresDriver(connectionString) {
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: sslConfig(connectionString),
  });

  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", error);
  });

  return {
    kind: "postgres",
    async query(text, params = []) {
      const result = await pool.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount ?? 0 };
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn({
          query: (text, params = []) => client.query(text, params),
          exec: (sql) => client.query(sql),
        });
        await client.query("COMMIT");
        return result;
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // The original error is more useful than a rollback failure.
        }
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}

async function createPgliteDriver() {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir =
    process.env.PGLITE_DATA_DIR || path.join(__dirname, "..", "data", "pglite");
  const database = await PGlite.create(dataDir);

  return {
    kind: "pglite",
    async query(text, params = []) {
      const result = await database.query(text, params);
      return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
    },
    async transaction(fn) {
      return database.transaction(async (tx) =>
        fn({
          query: (text, params = []) => tx.query(text, params),
          exec: (sql) => tx.exec(sql),
        }),
      );
    },
    async close() {
      await database.close();
    },
  };
}

async function getDriver() {
  if (!driverPromise) {
    driverPromise = (async () => {
      const connectionString = process.env.DATABASE_URL?.trim();
      if (connectionString) return createPostgresDriver(connectionString);

      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "DATABASE_URL is required in production. Provision PostgreSQL and set DATABASE_URL before starting the API.",
        );
      }

      console.warn(
        "DATABASE_URL is not set; using local PGlite data at backend/data/pglite.",
      );
      return createPgliteDriver();
    })();
  }
  return driverPromise;
}

async function query(text, params) {
  const driver = await getDriver();
  return driver.query(text, params);
}

async function transaction(fn) {
  const driver = await getDriver();
  return driver.transaction(fn);
}

async function databaseKind() {
  return (await getDriver()).kind;
}

async function closeDb() {
  if (!driverPromise) return;
  const driver = await driverPromise;
  await driver.close();
  driverPromise = null;
}

module.exports = { query, transaction, databaseKind, closeDb };
