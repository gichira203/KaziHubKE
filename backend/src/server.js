require("dotenv").config();

const app = require("./app");

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, () => {
  console.log(`KaziHub API listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
