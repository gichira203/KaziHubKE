require("dotenv").config();

const bcrypt = require("bcryptjs");
const { randomUUID } = require("node:crypto");
const { query, closeDb } = require("../src/db");
const { runMigrations } = require("../src/migrate");

/**
 * Create or promote the bootstrap administrator.
 *
 * This is the only seeded account: no jobs, reviews, candidates or statistics
 * are invented. Run it once after configuring the database:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run db:seed-admin
 */

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const firstName = (process.env.ADMIN_FIRST_NAME || "Platform").trim();
  const lastName = (process.env.ADMIN_LAST_NAME || "Administrator").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address.");
  }
  if (password.length < 10) {
    throw new Error("Set ADMIN_PASSWORD to at least 10 characters.");
  }

  await runMigrations();
  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    `SELECT id FROM users WHERE lower(email) = lower($1)`,
    [email],
  );

  if (rows[0]) {
    await query(
      `UPDATE users
          SET password_hash = $2,
              first_name = $3,
              last_name = $4,
              account_type = 'admin',
              role = 'admin',
              status = 'active',
              failed_login_attempts = 0,
              locked_until = NULL,
              updated_at = now()
        WHERE id = $1`,
      [rows[0].id, passwordHash, firstName, lastName],
    );
    console.log(`Updated administrator ${email}`);
  } else {
    await query(
      `INSERT INTO users
         (id, email, password_hash, first_name, last_name, account_type, role,
          email_verified, status)
       VALUES ($1, $2, $3, $4, $5, 'admin', 'admin', true, 'active')`,
      [randomUUID(), email, passwordHash, firstName, lastName],
    );
    console.log(`Created administrator ${email}`);
  }
}

main()
  .catch((error) => {
    console.error(`Could not create administrator: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
