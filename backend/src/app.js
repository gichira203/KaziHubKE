const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const { randomUUID } = require("node:crypto");

const { query, databaseKind } = require("./db");
const { registerAuthRoutes } = require("./auth");
const { registerProfileRoutes } = require("./profiles");
const { registerJobRoutes } = require("./jobs");
const { registerDashboardRoutes } = require("./dashboard");
const { registerTaskRoutes } = require("./tasks");
const { registerNotificationRoutes } = require("./notifications");
const { adminRouter } = require("./admin");
const registerOAuthRoutes = require("./oauth");

const app = express();

app.disable("x-powered-by");
// Hosts such as Render terminate TLS at a proxy. Trust its forwarding headers
// once so rate limiting and secure cookies see the real client protocol.
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});
app.use(
  pinoHttp({
    genReqId: (req) => req.requestId,
    redact: ["req.headers.authorization", "req.headers.cookie"],
  }),
);

const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const error = new Error("Origin is not allowed by CORS");
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

registerOAuthRoutes(app);
registerAuthRoutes(app);
registerProfileRoutes(app);
registerJobRoutes(app);
registerDashboardRoutes(app);
registerTaskRoutes(app);
registerNotificationRoutes(app);
app.use("/api/v1/admin", adminRouter);

app.get("/api/v1/health", async (req, res) => {
  try {
    await query("SELECT 1");
    return res.json({
      status: "ok",
      service: "kazihub-api",
      database: await databaseKind(),
      authStore: "database",
      integrations: {
        oauth:
          Boolean(process.env.GOOGLE_CLIENT_ID || process.env.FACEBOOK_APP_ID)
            ? "configured"
            : "not-configured",
        email: "not-configured",
      },
    });
  } catch (error) {
    req.log?.error({ err: error }, "Database health check failed");
    return res.status(503).json({
      status: "unavailable",
      service: "kazihub-api",
      database: "unreachable",
      authStore: "database",
    });
  }
});

app.get("/api/v1", (_req, res) => {
  res.json({
    name: "kazihub-api",
    version: "v1",
    endpoints: [
      "/api/v1/health",
      "/api/v1/auth/register",
      "/api/v1/auth/login",
      "/api/v1/auth/logout",
      "/api/v1/auth/me",
      "/api/v1/auth/oauth/:provider",
      "/api/v1/profile",
      "/api/v1/jobs",
      "/api/v1/jobs/meta",
      "/api/v1/applications",
      "/api/v1/saved-jobs",
      "/api/v1/employer/jobs",
      "/api/v1/employer/applications",
      "/api/v1/candidates",
      "/api/v1/dashboard/job-seeker",
      "/api/v1/dashboard/employer",
      "/api/v1/tasks",
      "/api/v1/task-submissions",
      "/api/v1/notifications",
      "/api/v1/admin/overview",
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", requestId: req.requestId },
  });
});

app.use((error, req, res, _next) => {
  req.log?.error({ err: error, requestId: req.requestId }, "Request failed");
  const status =
    (error.statusCode && error.statusCode < 500 ? error.statusCode : null) ||
    (error.status && error.status < 500 ? error.status : null) ||
    500;
  res.status(status).json({
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message:
        status === 500
          ? "An unexpected error occurred"
          : error.type === "entity.parse.failed"
            ? "Request body is not valid JSON"
            : error.message,
      requestId: req.requestId,
    },
  });
});

module.exports = app;
