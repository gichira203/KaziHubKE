const { randomBytes, timingSafeEqual } = require("node:crypto");

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
const callbackUrl = (provider) => `${process.env.API_PUBLIC_URL || "http://localhost:4000"}/api/v1/auth/oauth/${provider}/callback`;
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
  const body = await response.json();
  if (!response.ok) throw new Error("OAuth provider request failed");
  return body;
}

function registerOAuthRoutes(app) {
  app.get("/api/v1/auth/oauth/:provider", (req, res) => {
    const provider = providers[req.params.provider];
    const id = provider?.clientId();
    if (!provider || !id || !provider.secret()) return res.status(503).json({ error: { code: "OAUTH_NOT_CONFIGURED", message: "This sign-in provider is not configured on the server." } });
    clean(pendingStates);
    const state = randomBytes(32).toString("base64url");
    pendingStates.set(state, { provider: req.params.provider, createdAt: Date.now() });
    res.cookie("oauth_state", encode({ state, provider: req.params.provider }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 10 * 60 * 1000, path: "/api/v1/auth/oauth",
    });
    const url = new URL(provider.authorize);
    url.search = new URLSearchParams({ client_id: id, redirect_uri: callbackUrl(req.params.provider), response_type: "code", scope: provider.scopes, state }).toString();
    if (req.params.provider === "google") url.searchParams.set("include_granted_scopes", "true");
    res.redirect(url.toString());
  });

  app.get("/api/v1/auth/oauth/:provider/callback", async (req, res) => {
    const providerName = req.params.provider;
    const provider = providers[providerName];
    const cookieValue = req.headers.cookie?.split(";").map((v) => v.trim()).find((v) => v.startsWith("oauth_state="))?.slice("oauth_state=".length);
    let cookie;
    try { cookie = decode(decodeURIComponent(cookieValue || "")); } catch { cookie = null; }
    const saved = pendingStates.get(req.query.state);
    pendingStates.delete(req.query.state);
    res.clearCookie("oauth_state", { path: "/api/v1/auth/oauth" });
    if (!provider || req.query.error || !saved || !cookie || cookie.provider !== providerName || saved.provider !== providerName || !safeEqual(saved.state, req.query.state) || !safeEqual(cookie.state, req.query.state)) {
      return res.redirect(`${webUrl()}/login?oauth_error=cancelled`);
    }
    try {
      const token = await getJson(provider.token, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: provider.clientId(), client_secret: provider.secret(), code: req.query.code, redirect_uri: callbackUrl(providerName), grant_type: "authorization_code" }),
      });
      const profileUrl = providerName === "facebook" ? new URL(provider.profile) : new URL(provider.profile);
      if (providerName === "facebook") profileUrl.searchParams.set("access_token", token.access_token);
      const profile = await getJson(profileUrl, providerName === "google" ? { headers: { authorization: `Bearer ${token.access_token}` } } : undefined);
      if (!profile.email) return res.redirect(`${webUrl()}/login?oauth_error=email`);
      clean(loginCodes);
      const code = randomBytes(32).toString("base64url");
      loginCodes.set(code, { provider: providerName, id: profile.sub || profile.id, email: profile.email, firstName: profile.given_name || profile.first_name || profile.name?.split(" ")[0] || "", lastName: profile.family_name || profile.last_name || profile.name?.split(" ").slice(1).join(" ") || "", createdAt: Date.now() });
      res.redirect(`${webUrl()}/auth/callback#code=${encodeURIComponent(code)}`);
    } catch (error) {
      req.log?.warn({ err: error, provider: providerName }, "OAuth callback failed");
      res.redirect(`${webUrl()}/login?oauth_error=provider`);
    }
  });

  app.post("/api/v1/auth/oauth/exchange", (req, res) => {
    const { code } = req.body || {};
    const identity = typeof code === "string" ? loginCodes.get(code) : null;
    if (!identity || Date.now() - identity.createdAt > 5 * 60 * 1000) return res.status(401).json({ error: { code: "OAUTH_CODE_INVALID", message: "Sign-in link expired. Please try again." } });
    loginCodes.delete(code);
    res.setHeader("Cache-Control", "no-store");
    res.json({ user: { provider: identity.provider, providerId: identity.id, email: identity.email, firstName: identity.firstName, lastName: identity.lastName } });
  });
}

module.exports = registerOAuthRoutes;
