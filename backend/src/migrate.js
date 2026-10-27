const fs = require("node:fs/promises");
const path = require("node:path");
const { migrationQuery: query, migrationTransaction: transaction } = require("./db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

/**
 * Apply every pending SQL file in `backend/migrations` once, in name order,
 * inside a transaction. The runner is idempotent and safe to call on every
 * boot; Render runs it before the API starts accepting traffic.
 */
async function runMigrations({ log = true } = {}) {
  await query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name text PRIMARY KEY,
       applied_at timestamptz NOT NULL DEFAULT now()
     )`,
  );

  const applied = new Set(
    (await query("SELECT name FROM schema_migrations")).rows.map((row) => row.name),
  );

  let files = [];
  try {
    files = (await fs.readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith(".sql")).sort();
  } catch (error) {
    if (error.code === "ENOENT") return { applied: [] };
    throw error;
  }

  const newlyApplied = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    await transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    });
    newlyApplied.push(file);
    if (log) console.log(`Applied database migration ${file}`);
  }

  if (log && newlyApplied.length === 0) {
    console.log("Database schema is up to date");
  }
  return { applied: newlyApplied };
}

module.exports = { runMigrations };
