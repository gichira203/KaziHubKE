const { randomBytes, randomUUID, timingSafeEqual } = require("node:crypto");
const { transaction } = require("./db");
const {
  COOKIE_NAME,
  audit,
  cookieOptions,
  findUserByEmail,
  publicUser,
  redirectFor,
  sessionSecret,
  signSession,
} = require("./lib");

const pendingStates = new Map();
const loginCodes = new Map();
const providers = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    secret: () => process.env.GOOGLE_CLIENT_SECRET,
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    profile: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: "openid email profile",
  },
  facebook: {
    clientId: () => process.env.FACEBOOK_APP_ID,
    secret: () => process.env.FACEBOOK_CLIENT_SECRET,
    authorize: "https://www.facebook.com/v19.0/dialog/oauth",
    token: "https://graph.facebook.com/v19.0/oauth/access_token",
    profile: "https://graph.facebook.com/me?fields=id,name,email,first_name,last_name",
    scopes: "email,public_profile",
  },
};

const webUrl = () => (process.env.WEB_URL || "http://localhost:3000").replace(/\/$/, "");
const callbackUrl = (provider) =>
  `${process.env.API_PUBLIC_URL || "http://localhost:4000"}/api/v1/auth/oauth/${provider}/callback`;
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

function safeEqual(a, b) {
  const left = Buffer.from(a || "");
  const right = Buffer.from(b || "");
  return left.length === right.length && timingSafeEqual(left, right);
}

function clean(map) {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, item] of map) if (item.createdAt < cutoff) map.delete(key);
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`OAuth provider returned an unreadable response (${response.status})`);
  }
  if (!response.ok) {
    const reason =
      body.error_description || body.error?.message || body.error || "OAuth provider request failed";
    throw new Error(String(reason));
  }
  return body;
}

function accountTypeFrom(req) {
  const value = req.query.account_type || req.query.accountType;
  return value === "employer" ? "employer" : "job-seeker";
}

async function findOrCreateOAuthUser(identity, accountType) {
  const existing = await findUserByEmail(identity.email);
  if (existing) {
    if (existing.status !== "active") {
      const error = new Error("This account is suspended.");
      error.code = "ACCOUNT_SUSPENDED";
      throw error;
    }
    // Link the provider on first social sign-in, or refresh the subject if the
    // provider reissued it. Password accounts keep their password hash.
    await transaction(async (tx) => {
      await tx.query(
        `UPDATE users
            SET oauth_provider = $2,
                oauth_subject = $3,
                email_verified = true,
                last_login_at = now(),
                updated_at = now()
          WHERE id = $1`,
        [existing.id, identity.provider, identity.subject],
      );
    });
    return { ...existing, oauth_provider: identity.provider, oauth_subject: identity.subject };
  }

  const id = randomUUID();
  await transaction(async (tx) => {
    await tx.query(
      `INSERT INTO users
         (id, email, password_hash, first_name, last_name, account_type, role,
          email_verified, status, oauth_provider, oauth_subject, last_login_at)
       VALUES ($1, $2, NULL, $3, $4, $5, 'user', true, 'active', $6, $7, now())`,
      [
        id,
        identity.email,
        identity.firstName || "KaziHub",
        identity.lastName || "Member",
        accountType,
        identity.provider,
        identity.subject,
      ],
    );
    if (accountType === "employer") {
      await tx.query("INSERT INTO employer_profiles (user_id) VALUES ($1)", [id]);
    } else {
      await tx.query("INSERT INTO job_seeker_profiles (user_id) VALUES ($1)", [id]);
    }
  });
  return findUserByEmail(identity.email);
}

function registerOAuthRoutes(app) {
  app.get("/api/v1/auth/oauth/:provider", (req, res) => {
    const providerName = req.params.provider;
    const provider = providers[providerName];
    const id = provider?.clientId();
    if (!provider || !id || !provider.secret()) {
      res.setHeader("Cache-Control", "no-store");
      return res.redirect(`${webUrl()}/login?oauth_error=not_configured`);
    }
    if (!sessionSecret()) {
      res.setHeader("Cache-Control", "no-store");
      return res.redirect(`${webUrl()}/login?oauth_error=not_configured`);
    }
    clean(pendingStates);
    const state = randomBytes(32).toString("base64url");
    const accountType = accountTypeFrom(req);
    pendingStates.set(state, { provider: providerName, accountType, createdAt: Date.now() });
    res.cookie("oauth_state", encode({ state, provider: providerName, accountType }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/api/v1/auth/oauth",
    });
    const url = new URL(provider.authorize);
    url.search = new URLSearchParams({
      client_id: id,
      redirect_uri: callbackUrl(providerName),
      response_type: "code",
      scope: provider.scopes,
      state,
    }).toString();
    if (providerName === "google") url.searchParams.set("include_granted_scopes", "true");
    res.setHeader("Cache-Control", "no-store");
    return res.redirect(url.toString());
  });

  app.get("/api/v1/auth/oauth/:provider/callback", async (req, res) => {
    const providerName = req.params.provider;
    const provider = providers[providerName];
    const queryState = typeof req.query.state === "string" ? req.query.state : "";
    const queryCode = typeof req.query.code === "string" ? req.query.code : "";
    const rawCookie = req.cookies?.oauth_state;
    let cookie;
    try {
      cookie = rawCookie ? decode(rawCookie) : null;
    } catch {
      cookie = null;
    }
    const saved = pendingStates.get(queryState);
    pendingStates.delete(queryState);
    res.clearCookie("oauth_state", { path: "/api/v1/auth/oauth" });
    if (
      !provider ||
      req.query.error ||
      !queryCode ||
      !saved ||
      !cookie ||
      cookie.provider !== providerName ||
      saved.provider !== providerName ||
      !safeEqual(saved.state, queryState) ||
      !safeEqual(cookie.state, queryState)
    ) {
      return res.redirect(`${webUrl()}/login?oauth_error=cancelled`);
    }
    try {
      const token = await getJson(provider.token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: provider.clientId(),
          client_secret: provider.secret(),
          code: queryCode,
          redirect_uri: callbackUrl(providerName),
          grant_type: "authorization_code",
        }),
      });
      if (!token?.access_token) throw new Error("OAuth provider did not return an access token");
      const profileUrl = new URL(provider.profile);
      if (providerName === "facebook") profileUrl.searchParams.set("access_token", token.access_token);
      const profile = await getJson(
        profileUrl,
        providerName === "google"
          ? { headers: { authorization: `Bearer ${token.access_token}` } }
          : undefined,
      );
      if (!profile.email) return res.redirect(`${webUrl()}/login?oauth_error=email`);
      clean(loginCodes);
      const code = randomBytes(32).toString("base64url");
      loginCodes.set(code, {
        provider: providerName,
        subject: String(profile.sub || profile.id || ""),
        email: String(profile.email).toLowerCase(),
        firstName: profile.given_name || profile.first_name || profile.name?.split(" ")[0] || "",
        lastName:
          profile.family_name ||
          profile.last_name ||
          profile.name?.split(" ").slice(1).join(" ") ||
          "",
        accountType: saved.accountType || cookie.accountType || "job-seeker",
        createdAt: Date.now(),
      });
      res.setHeader("Cache-Control", "no-store");
      return res.redirect(`${webUrl()}/auth/callback#code=${encodeURIComponent(code)}`);
    } catch (error) {
      req.log?.warn({ err: error, provider: providerName }, "OAuth callback failed");
      return res.redirect(`${webUrl()}/login?oauth_error=provider`);
    }
  });

  app.post("/api/v1/auth/oauth/exchange", async (req, res) => {
    const { code } = req.body || {};
    const identity = typeof code === "string" ? loginCodes.get(code) : null;
    if (!identity || Date.now() - identity.createdAt > 5 * 60 * 1000) {
      return res
        .status(401)
        .json({ error: { code: "OAUTH_CODE_INVALID", message: "Sign-in link expired. Please try again." } });
    }
    loginCodes.delete(code);

    if (!sessionSecret()) {
      return res.status(503).json({
        error: {
          code: "AUTH_NOT_CONFIGURED",
          message: "Account sessions are not configured on the server. Set SESSION_SECRET.",
        },
      });
    }

    try {
      const user = await findOrCreateOAuthUser(identity, identity.accountType);
      if (!user) throw new Error("Account could not be loaded after sign-in");
      res.setHeader("Cache-Control", "no-store");
      res.cookie(COOKIE_NAME, signSession(user, false), cookieOptions(false));
      await audit(user.id, "account.oauth-login", "user", user.id, { provider: identity.provider });
      return res.json({ user: publicUser(user), redirectTo: redirectFor(user.account_type) });
    } catch (error) {
      if (error.code === "ACCOUNT_SUSPENDED") {
        return res
          .status(403)
          .json({ error: { code: "ACCOUNT_SUSPENDED", message: "This account is suspended. Contact support." } });
      }
      req.log?.error({ err: error }, "OAuth exchange failed");
      return res
        .status(500)
        .json({ error: { code: "OAUTH_FAILED", message: "Sign-in could not be completed. Please try again." } });
    }
  });
}

module.exports = registerOAuthRoutes;
