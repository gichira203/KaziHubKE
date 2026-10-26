const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("node:crypto");
const { promises: fs } = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

/**
 * Email/password authentication for the KaziHub API.
 *
 * Accounts are stored in a small JSON file so the API works without a database
 * during development and on single-instance hosts. The file store is serialized
 * through an in-process queue and every password is hashed with bcrypt. Set
 * `AUTH_DATA_FILE` to a path on a persistent disk in production.
 *
 * This is deliberately isolated: when the PostgreSQL/Prisma phase lands, only
 * the read/write helpers below need to be replaced with database queries.
 */

const COOKIE_NAME = "kazihub_session";
const DATA_FILE =
  process.env.AUTH_DATA_FILE || path.join(__dirname, "..", "data", "users.json");
const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "First name is too short.").max(60),
  lastName: z.string().trim().min(2, "Last name is too short.").max(60),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(emailRule, "Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Password is too long.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/\d/, "Include at least one number."),
  accountType: z.enum(["job-seeker", "employer"]),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).regex(emailRule, "Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(128),
  rememberMe: z.boolean().optional().default(false),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).regex(emailRule, "Enter a valid email address."),
});

let storeQueue = Promise.resolve();

async function readUsers() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.users) ? parsed : { users: [] };
  } catch (error) {
    if (error && error.code === "ENOENT") return { users: [] };
    throw error;
  }
}

async function writeUsers(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const temp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  await fs.rename(temp, DATA_FILE);
}

/** Serialize mutations so two concurrent registrations cannot overwrite each other. */
function mutateUsers(mutator) {
  const run = storeQueue.then(async () => {
    const data = await readUsers();
    const result = await mutator(data.users);
    await writeUsers(data);
    return result;
  });
  storeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    accountType: user.accountType,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
  };
}

function redirectFor(accountType) {
  return accountType === "employer" ? "/employer/dashboard" : "/dashboard";
}

function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") return null;
  // Local development only. Production must provide SESSION_SECRET.
  return "kazihub-development-only-session-secret";
}

function cookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // The web app and API are different sites in production, so the cookie
    // must be allowed on cross-site requests (fetch with credentials).
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: rememberMe ? REMEMBER_DURATION_MS : SESSION_DURATION_MS,
    path: "/",
  };
}

function sendError(res, status, code, message, details) {
  return res.status(status).json({
    error: { code, message, ...(details ? { details } : {}) },
  });
}

function validationMessage(result) {
  const issue = result.error.issues[0];
  return issue?.message || "Check the details you entered.";
}

function signSession(user, rememberMe = false) {
  return jwt.sign(
    { sub: user.id, type: user.accountType },
    sessionSecret(),
    { expiresIn: rememberMe ? "30d" : "1d" },
  );
}

function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, sessionSecret());
  } catch {
    return null;
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." },
  },
});

function registerAuthRoutes(app) {
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/register", authLimiter);

  app.post("/api/v1/auth/register", async (req, res, next) => {
    try {
      if (!sessionSecret()) {
        return sendError(
          res,
          503,
          "AUTH_NOT_CONFIGURED",
          "Account sessions are not configured on the server. Set SESSION_SECRET.",
        );
      }

      const parsed = registerSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return sendError(res, 400, "VALIDATION_ERROR", validationMessage(parsed), parsed.error.issues);
      }

      const { firstName, lastName, email, password, accountType } = parsed.data;
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const created = await mutateUsers((users) => {
        if (users.some((user) => user.email === email)) return null;
        const user = {
          id: randomUUID(),
          firstName,
          lastName,
          email,
          passwordHash,
          accountType,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        };
        users.push(user);
        return user;
      });

      if (!created) {
        return sendError(
          res,
          409,
          "EMAIL_TAKEN",
          "An account with this email already exists. Log in instead.",
        );
      }

      res.cookie(COOKIE_NAME, signSession(created, false), cookieOptions(false));
      res.setHeader("Cache-Control", "no-store");
      return res.status(201).json({
        user: publicUser(created),
        redirectTo: redirectFor(created.accountType),
        verificationRequired: !created.emailVerified,
        // No mail provider is connected, so verification email delivery is
        // reported honestly instead of being claimed.
        emailDelivery: "not-configured",
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/v1/auth/login", async (req, res, next) => {
    try {
      if (!sessionSecret()) {
        return sendError(
          res,
          503,
          "AUTH_NOT_CONFIGURED",
          "Account sessions are not configured on the server. Set SESSION_SECRET.",
        );
      }

      const parsed = loginSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return sendError(res, 400, "VALIDATION_ERROR", validationMessage(parsed));
      }

      const { email, password, rememberMe } = parsed.data;
      const users = await readUsers();
      const user = users.users.find((candidate) => candidate.email === email);

      if (!user) {
        // Compare against a dummy hash so missing accounts are not obviously
        // faster than wrong passwords.
        await bcrypt.compare(password, "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZBdQx1Qw5vQ6f6D4v6Z9Z8c5n7xG6K");
        return sendError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }

      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
      if (lockedUntil > Date.now()) {
        return sendError(
          res,
          423,
          "ACCOUNT_LOCKED",
          "This account is temporarily locked after several failed attempts. Try again later.",
        );
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      if (!matches) {
        const updated = await mutateUsers((list) => {
          const target = list.find((candidate) => candidate.id === user.id);
          if (!target) return null;
          target.failedLoginAttempts = (target.failedLoginAttempts || 0) + 1;
          if (target.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            target.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
            target.failedLoginAttempts = 0;
          }
          return target;
        });
        if (updated?.lockedUntil && new Date(updated.lockedUntil).getTime() > Date.now()) {
          return sendError(
            res,
            423,
            "ACCOUNT_LOCKED",
            "This account is temporarily locked after several failed attempts. Try again later.",
          );
        }
        return sendError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }

      await mutateUsers((list) => {
        const target = list.find((candidate) => candidate.id === user.id);
        if (target) {
          target.failedLoginAttempts = 0;
          target.lockedUntil = null;
          target.lastLoginAt = new Date().toISOString();
        }
        return target;
      });

      res.cookie(COOKIE_NAME, signSession(user, rememberMe), cookieOptions(rememberMe));
      res.setHeader("Cache-Control", "no-store");
      return res.json({
        user: publicUser(user),
        redirectTo: redirectFor(user.accountType),
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/v1/auth/logout", (req, res) => {
    const options = cookieOptions(false);
    delete options.maxAge;
    res.clearCookie(COOKIE_NAME, options);
    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  });

  app.get("/api/v1/auth/me", async (req, res, next) => {
    try {
      const session = readSession(req);
      if (!session) return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
      const users = await readUsers();
      const user = users.users.find((candidate) => candidate.id === session.sub);
      if (!user) return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
      res.setHeader("Cache-Control", "no-store");
      return res.json({ user: publicUser(user) });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Password recovery requires an email provider. There is no mail service in
   * this build, so the endpoint validates the request and returns the same
   * neutral answer for every address without claiming an email was sent.
   */
  app.post("/api/v1/auth/forgot-password", (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return sendError(res, 400, "VALIDATION_ERROR", validationMessage(parsed));
    }
    res.setHeader("Cache-Control", "no-store");
    return res.json({
      ok: true,
      delivery: "not-configured",
      message: "If an account exists for this address, reset instructions will be sent once email delivery is configured.",
    });
  });

  app.post("/api/v1/auth/reset-password", (_req, res) => {
    return sendError(
      res,
      503,
      "EMAIL_NOT_CONFIGURED",
      "Password reset is unavailable because no email provider is connected.",
    );
  });

  app.post("/api/v1/auth/verify-email", (_req, res) => {
    return sendError(
      res,
      503,
      "EMAIL_NOT_CONFIGURED",
      "Email verification is unavailable because no email provider is connected.",
    );
  });

  app.post("/api/v1/auth/resend-verification", (_req, res) => {
    return sendError(
      res,
      503,
      "EMAIL_NOT_CONFIGURED",
      "Email verification is unavailable because no email provider is connected.",
    );
  });
}

module.exports = { registerAuthRoutes, COOKIE_NAME, DATA_FILE };
