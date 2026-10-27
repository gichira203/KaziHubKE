require("dotenv").config();

const { closeDb, databaseKind } = require("./db");
const { runMigrations } = require("./migrate");

const port = Number(process.env.PORT || 4000);

async function main() {
  // Fail fast (and migrate first) so the health check only ever reports a
  // database the API can actually use.
  await runMigrations();
  const kind = await databaseKind();

  // Loaded after migrations so route modules cannot query a missing schema.
  const app = require("./app");
  const server = app.listen(port, () => {
    console.log(`KaziHub API listening on port ${port} (database: ${kind})`);
  });

  function shutdown(signal) {
    console.log(`${signal} received; closing HTTP server`);
    server.close(async () => {
      await closeDb().catch(() => {});
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch(async (error) => {
  console.error(`KaziHub API failed to start: ${error.message}`);
  await closeDb().catch(() => {});
  process.exit(1);
});
