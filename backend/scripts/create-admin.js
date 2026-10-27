const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { randomUUID } = require("node:crypto");
const { transaction, closeDb } = require("../src/db");
const { runMigrations } = require("../src/migrate");

/**
 * Create or promote the bootstrap administrator.
 *
 * This is the only seeded account: no jobs, reviews, candidates or statistics
 * are invented. Run it once after configuring the database:
 *
 *   ADMIN_EMAIL=admin-username ADMIN_PASSWORD='...' npm run db:seed-admin
 */

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const firstName = (process.env.ADMIN_FIRST_NAME || "Platform").trim();
  const lastName = (process.env.ADMIN_LAST_NAME || "Administrator").trim();

  if (!email || !/^[a-z0-9][a-z0-9._@+-]{2,253}$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address or username.");
  }
  if (password.length < 10) {
    throw new Error("Set ADMIN_PASSWORD to at least 10 characters.");
  }

  await runMigrations();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await transaction(async (tx) => {
    const { rows } = await tx.query(
      `SELECT id FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    const id = rows[0]?.id || randomUUID();

    if (rows[0]) {
      await tx.query(
        `UPDATE users
            SET password_hash = $2,
                first_name = $3,
                last_name = $4,
                account_type = 'admin',
                role = 'admin',
                status = 'active',
                email_verified = true,
                failed_login_attempts = 0,
                locked_until = NULL,
                updated_at = now()
          WHERE id = $1`,
        [id, passwordHash, firstName, lastName],
      );
    } else {
      await tx.query(
        `INSERT INTO users
           (id, email, password_hash, first_name, last_name, account_type, role,
            email_verified, status)
         VALUES ($1, $2, $3, $4, $5, 'admin', 'admin', true, 'active')`,
        [id, email, passwordHash, firstName, lastName],
      );
    }

    // Keep existing account records and history, but remove administrator
    // access from every account except the configured bootstrap account.
    const demoted = await tx.query(
      `UPDATE users
          SET role = 'user', account_type = 'job-seeker', updated_at = now()
        WHERE role = 'admin' AND id <> $1
        RETURNING id`,
      [id],
    );
    for (const row of demoted.rows) {
      await tx.query(
        `INSERT INTO job_seeker_profiles (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [row.id],
      );
    }

    return { existed: Boolean(rows[0]), demoted: demoted.rowCount };
  });

  console.log(`${result.existed ? "Updated" : "Created"} administrator ${email}`);
  console.log(`Removed administrator access from ${result.demoted} other account(s).`);
}

main()
  .catch((error) => {
    console.error(`Could not create administrator: ${error?.stack || error?.message || String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
