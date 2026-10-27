const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("node:crypto");
const { z } = require("zod");

const { query, transaction } = require("./db");
const {
  COOKIE_NAME,
  audit,
  clearCookieOptions,
  cookieOptions,
  findUserByEmail,
  publicUser,
  redirectFor,
  requireAuth,
  route,
  sendError,
  sessionSecret,
  signSession,
  validationMessage,
} = require("./lib");

/**
 * Email/password authentication backed by PostgreSQL.
 *
 * Passwords are bcrypt hashes; sessions are signed JWTs in an httpOnly cookie.
 * Account lockout is persisted with the account, so it survives restarts and
 * works across multiple API instances.
 */

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

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

function isUniqueViolation(error) {
  return (
    error?.code === "23505" ||
    /duplicate key value|unique constraint/i.test(String(error?.message || ""))
  );
}

async function createProfileFor(userId, accountType) {
  if (accountType === "employer") {
    await query("INSERT INTO employer_profiles (user_id) VALUES ($1)", [userId]);
  } else {
    await query("INSERT INTO job_seeker_profiles (user_id) VALUES ($1)", [userId]);
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

  app.post(
    "/api/v1/auth/register",
    route(async (req, res) => {
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
      const id = randomUUID();

      try {
        await transaction(async (tx) => {
          await tx.query(
            `INSERT INTO users
               (id, email, password_hash, first_name, last_name, account_type, role)
             VALUES ($1, $2, $3, $4, $5, $6, 'user')`,
            [id, email, passwordHash, firstName, lastName, accountType],
          );
          if (accountType === "employer") {
            await tx.query("INSERT INTO employer_profiles (user_id) VALUES ($1)", [id]);
          } else {
            await tx.query("INSERT INTO job_seeker_profiles (user_id) VALUES ($1)", [id]);
          }
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          return sendError(
            res,
            409,
            "EMAIL_TAKEN",
            "An account with this email already exists. Log in instead.",
          );
        }
        throw error;
      }

      const created = await findUserByEmail(email);
      res.cookie(COOKIE_NAME, signSession(created, false), cookieOptions(false));
      res.setHeader("Cache-Control", "no-store");
      await audit(created.id, "account.registered", "user", created.id);
      return res.status(201).json({
        user: publicUser(created),
        redirectTo: redirectFor(created.account_type),
        verificationRequired: !created.email_verified,
        // No mail provider is connected, so verification email delivery is
        // reported honestly instead of being claimed.
        emailDelivery: "not-configured",
      });
    }),
  );

  app.post(
    "/api/v1/auth/login",
    route(async (req, res) => {
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
      const user = await findUserByEmail(email);

      if (!user) {
        // Compare against a dummy hash so missing accounts are not obviously
        // faster than wrong passwords.
        await bcrypt.compare(password, "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZBdQx1Qw5vQ6f6D4v6Z9Z8c5n7xG6K");
        return sendError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }

      if (user.status !== "active") {
        return sendError(res, 403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact support.");
      }

      const lockedUntil = user.locked_until ? new Date(user.locked_until).getTime() : 0;
      if (lockedUntil > Date.now()) {
        return sendError(
          res,
          423,
          "ACCOUNT_LOCKED",
          "This account is temporarily locked after several failed attempts. Try again later.",
        );
      }

      if (!user.password_hash) {
        return sendError(
          res,
          401,
          "INVALID_CREDENTIALS",
          "This account signs in with a social provider. Use that provider to continue.",
        );
      }

      const matches = await bcrypt.compare(password, user.password_hash);
      if (!matches) {
        const attempts = (user.failed_login_attempts || 0) + 1;
        const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
        await query(
          `UPDATE users
              SET failed_login_attempts = $2,
                  locked_until = $3,
                  updated_at = now()
            WHERE id = $1`,
          [
            user.id,
            shouldLock ? 0 : attempts,
            shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
          ],
        );
        if (shouldLock) {
          return sendError(
            res,
            423,
            "ACCOUNT_LOCKED",
            "This account is temporarily locked after several failed attempts. Try again later.",
          );
        }
        return sendError(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }

      await query(
        `UPDATE users
            SET failed_login_attempts = 0,
                locked_until = NULL,
                last_login_at = now(),
                updated_at = now()
          WHERE id = $1`,
        [user.id],
      );

      res.cookie(COOKIE_NAME, signSession(user, rememberMe), cookieOptions(rememberMe));
      res.setHeader("Cache-Control", "no-store");
      return res.json({
        user: publicUser(user),
        redirectTo: redirectFor(user.account_type),
      });
    }),
  );

  app.post("/api/v1/auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, clearCookieOptions());
    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  });

  app.get(
    "/api/v1/auth/me",
    requireAuth,
    route(async (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      return res.json({ user: publicUser(req.user) });
    }),
  );

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
      message:
        "If an account exists for this address, reset instructions will be sent once email delivery is configured.",
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

module.exports = { registerAuthRoutes, createProfileFor };
