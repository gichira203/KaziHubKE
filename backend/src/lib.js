/**
 * Shared HTTP/auth helpers used by every API route module.
 */

const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");
const { query } = require("./db");

const COOKIE_NAME = "kazihub_session";
const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

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

function clearCookieOptions() {
  const options = cookieOptions(false);
  delete options.maxAge;
  return options;
}

function signSession(user, rememberMe = false) {
  return jwt.sign(
    { sub: user.id, type: user.account_type ?? user.accountType, role: user.role },
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

function sendError(res, status, code, message, details) {
  return res.status(status).json({
    error: { code, message, ...(details ? { details } : {}) },
  });
}

function validationMessage(result) {
  const issue = result.error.issues[0];
  return issue?.message || "Check the details you entered.";
}

function iso(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function dateOnly(value) {
  const text = iso(value);
  return text ? text.slice(0, 10) : null;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name ?? user.firstName,
    lastName: user.last_name ?? user.lastName,
    accountType: user.account_type ?? user.accountType,
    role: user.role,
    emailVerified: Boolean(user.email_verified ?? user.emailVerified),
    status: user.status,
    verificationStatus: user.verification_status ?? "not-started",
    createdAt: iso(user.created_at ?? user.createdAt),
  };
}

function redirectFor(accountType) {
  if (accountType === "employer") return "/employer/dashboard";
  if (accountType === "admin") return "/admin/dashboard";
  return "/dashboard";
}

async function findUserById(id) {
  const { rows } = await query(
    `SELECT u.*, ep.verification_status
       FROM users u
       LEFT JOIN employer_profiles ep ON ep.user_id = u.id
      WHERE u.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT u.*, ep.verification_status
       FROM users u
       LEFT JOIN employer_profiles ep ON ep.user_id = u.id
      WHERE lower(u.email) = lower($1)`,
    [email],
  );
  return rows[0] ?? null;
}

/**
 * Verify the session cookie and load the current account. Suspended or deleted
 * accounts lose access immediately, even if their JWT is still valid.
 */
async function requireAuth(req, res, next) {
  try {
    const session = readSession(req);
    if (!session) return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
    const user = await findUserById(session.sub);
    if (!user || user.status !== "active") {
      res.clearCookie(COOKIE_NAME, clearCookieOptions());
      return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
    if (req.user.role !== role) {
      return sendError(res, 403, "FORBIDDEN", "You do not have permission to do that.");
    }
    return next();
  };
}

function requireAccountType(accountType) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, "NOT_AUTHENTICATED", "Sign in to continue.");
    if (req.user.account_type !== accountType) {
      return sendError(res, 403, "FORBIDDEN", "This action is not available for your account type.");
    }
    return next();
  };
}

async function audit(actorId, action, targetType = "", targetId = "", metadata = {}) {
  await query(
    `INSERT INTO audit_log (id, actor_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [randomUUID(), actorId ?? null, action, targetType, String(targetId ?? ""), JSON.stringify(metadata)],
  );
}

/** Wrap async handlers so rejected promises reach the error middleware. */
function route(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = {
  COOKIE_NAME,
  audit,
  clearCookieOptions,
  cookieOptions,
  dateOnly,
  findUserByEmail,
  findUserById,
  iso,
  publicUser,
  readSession,
  redirectFor,
  requireAccountType,
  requireAuth,
  requireRole,
  route,
  sendError,
  sessionSecret,
  signSession,
  validationMessage,
};
