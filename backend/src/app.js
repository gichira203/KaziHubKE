const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const { randomUUID } = require("node:crypto");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});
app.use(pinoHttp({
  genReqId: (req) => req.requestId,
  redact: ["req.headers.authorization", "req.headers.cookie"],
}));

const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

require("./oauth")(app);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "kazihub-api",
    database: "not-connected",
    integrations: "not-configured",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", requestId: req.requestId },
  });
});

app.use((error, req, res, _next) => {
  req.log?.error({ err: error, requestId: req.requestId }, "Request failed");
  const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
  res.status(status).json({
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message: status === 500 ? "An unexpected error occurred" : error.message,
      requestId: req.requestId,
    },
  });
});

module.exports = app;
