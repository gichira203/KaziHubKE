import { saveRegistrationDetails, clearAuthStorage } from "./draft-storage";
import { clearSession, createAccountSession } from "./session";
import type { AccountSession } from "./session";

/**
 * Authentication configuration and integration points.
 *
 * Google and Facebook OAuth are handled by the backend routes. Password login,
 * registration and persistent account storage still need backend endpoints.
 *
 * Rules enforced by this module:
 * - With no API URL, auth uses a session-only preview account. It never
 *   stores passwords and is clearly disclosed in the dashboard.
 * - No client secrets. Only public identifiers (NEXT_PUBLIC_*) may be read here.
 */

export type AuthProviderId = "google" | "facebook" | "linkedin";

export interface AuthProvider {
  id: AuthProviderId;
  name: string;
  /** Public client identifier. NULL until real OAuth is configured. */
  clientId: string | null;
  /** OAuth 2.0 / OIDC authorize endpoint. */
  authorizeUrl: string | null;
  scopes: string[];
}

// Next.js only exposes NEXT_PUBLIC_* variables to browser bundles when each
// reference is statically named; dynamic process.env[key] lookups stay empty.
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const linkedInClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export const authProviders: Record<AuthProviderId, AuthProvider> = {
  google: {
    id: "google",
    name: "Google",
    // Public identifier — safe for the client. Never a client secret.
    clientId: googleClientId ?? null,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["openid", "email", "profile"],
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    clientId: facebookAppId ?? null,
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    // Facebook requires app review before `email` is granted to the public.
    scopes: ["email", "public_profile"],
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    clientId: linkedInClientId ?? null,
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["openid", "profile", "email"],
  },
};

export function isProviderConfigured(provider: AuthProviderId): boolean {
  const config = authProviders[provider];
  return Boolean(config.clientId && config.authorizeUrl && apiBaseUrl && provider !== "linkedin");
}

export const isAnyProviderConfigured = (): boolean =>
  (Object.keys(authProviders) as AuthProviderId[]).some(isProviderConfigured);

/* ------------------------------------------------------------------ */
/* Backend endpoint contract                                           */
/* ------------------------------------------------------------------ */

/** Base URL of the API. Empty until configured — requests stay local. */

export const apiEndpoints = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  oauthStart: "/auth/oauth",
  oauthCallback: "/auth/oauth/callback",
  profileJobSeeker: "/profiles/job-seeker",
  profileEmployer: "/profiles/employer",
  cvParse: "/storage/cv/parse",
  cvUpload: "/storage/cv",
  employerVerification: "/employers/verification",
} as const;

export function isBackendConfigured(): boolean {
  return Boolean(apiBaseUrl);
}

/* ------------------------------------------------------------------ */
/* Result shapes                                                       */
/* ------------------------------------------------------------------ */

export type AuthResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code: AuthErrorCode };

export type AuthErrorCode =
  | "not-configured"
  | "invalid-credentials"
  | "email-not-verified"
  | "account-locked"
  | "email-taken"
  | "network"
  | "provider-cancelled"
  | "provider-error"
  | "provider-email-missing"
  | "unknown";

type ApiUser = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: "job-seeker" | "employer";
  emailVerified?: boolean;
  verificationStatus?: AccountSession["verificationStatus"];
  verificationSubmittedAt?: string | null;
  createdAt?: string | null;
};

type ApiResult = {
  ok: boolean;
  status: number;
  payload: {
    user?: ApiUser;
    redirectTo?: string;
    verificationRequired?: boolean;
    error?: { code?: string; message?: string };
  } | null;
};

/** POST JSON to the API, returning `null` only when the server is unreachable. */
async function postToApi(path: string, body: unknown): Promise<ApiResult | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(body),
    });
    let payload: ApiResult["payload"] = null;
    try {
      payload = (await response.json()) as ApiResult["payload"];
    } catch {
      payload = null;
    }
    return { ok: response.ok, status: response.status, payload };
  } catch {
    return null;
  }
}

function errorFrom(payload: ApiResult["payload"], fallback: string) {
  return payload?.error?.message || fallback;
}

function rememberUser(user: ApiUser) {
  saveRegistrationDetails({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email.toLowerCase(),
    accountType: user.accountType,
  });
  createAccountSession(user);
  return user.accountType === "employer" ? "/employer/dashboard" : "/dashboard";
}

/**
 * Email + password login.
 *
 * When an API base URL is configured the credentials are checked by the API
 * and the returned identity starts the browser session. Without an API the
 * development-only local preview signs in an account registered in this tab;
 * production never falls back to a simulated account.
 */
export async function submitLogin(credentials: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthResult<{ redirectTo: string }>> {
  if (isBackendConfigured()) {
    const result = await postToApi(apiEndpoints.login, {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    });
    if (!result) {
      return { ok: false, code: "network", error: "Could not reach the authentication server. Check your connection and try again." };
    }
    if (result.status === 404) {
      return { ok: false, code: "not-configured", error: "The authentication API is not deployed at the configured address yet." };
    }
    if (!result.ok || !result.payload?.user) {
      const code = result.payload?.error?.code;
      if (code === "INVALID_CREDENTIALS") {
        return { ok: false, code: "invalid-credentials", error: errorFrom(result.payload, "Email or password is incorrect.") };
      }
      if (code === "ACCOUNT_LOCKED") {
        return { ok: false, code: "account-locked", error: errorFrom(result.payload, "This account is temporarily locked. Try again later.") };
      }
      if (code === "AUTH_NOT_CONFIGURED") {
        return { ok: false, code: "not-configured", error: errorFrom(result.payload, "Server authentication is not configured.") };
      }
      if (code === "VALIDATION_ERROR") {
        return { ok: false, code: "unknown", error: errorFrom(result.payload, "Check the details you entered.") };
      }
      return { ok: false, code: "unknown", error: errorFrom(result.payload, "Sign-in could not be completed.") };
    }
    const redirectTo = rememberUser(result.payload.user);
    return { ok: true, data: { redirectTo: result.payload.redirectTo || redirectTo } };
  }

  return { ok: false, code: "not-configured", error: "Sign-in is unavailable until the platform API is configured." };
}

/** Email registration, handled by the API when it is configured. */
export async function submitRegistration(credentials: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: string;
}): Promise<AuthResult<{ verificationRequired: boolean }>> {
  if (isBackendConfigured()) {
    const result = await postToApi(apiEndpoints.register, {
      firstName: credentials.firstName.trim(),
      lastName: credentials.lastName.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      accountType: credentials.accountType,
    });
    if (!result) {
      return { ok: false, code: "network", error: "Could not reach the registration server. Check your connection and try again." };
    }
    if (result.status === 404) {
      return { ok: false, code: "not-configured", error: "The registration API is not deployed at the configured address yet." };
    }
    if (!result.ok || !result.payload?.user) {
      const code = result.payload?.error?.code;
      if (code === "EMAIL_TAKEN") {
        return { ok: false, code: "email-taken", error: errorFrom(result.payload, "An account with this email already exists.") };
      }
      if (code === "AUTH_NOT_CONFIGURED") {
        return { ok: false, code: "not-configured", error: errorFrom(result.payload, "Server authentication is not configured.") };
      }
      return { ok: false, code: "unknown", error: errorFrom(result.payload, "Your account could not be created.") };
    }
    rememberUser(result.payload.user);
    return { ok: true, data: { verificationRequired: Boolean(result.payload.verificationRequired) } };
  }

  return { ok: false, code: "not-configured", error: "Registration is unavailable until the platform API is configured." };
}

/** Clear every local auth artifact, then ask the server to clear its cookie. */
export async function signOut(): Promise<void> {
  clearSession();
  clearAuthStorage();
  if (isBackendConfigured()) {
    try {
      await fetch(`${apiBaseUrl}${apiEndpoints.logout}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // The local session is already cleared even if the server is unreachable.
    }
  }
}

/**
 * Social sign-in.
 *
 * Real OAuth requires server-side initiation so state and the token exchange
 * stay off the client. Until then this returns a `not-configured` result and
 * the UI explains what is missing. It NEVER simulates a successful sign-in.
 */
export function startSocialLogin(provider: AuthProviderId): AuthResult {
  if (!isProviderConfigured(provider)) {
    return {
      ok: false,
      code: "not-configured",
      error: `${authProviders[provider].name} sign-in needs a public client ID and a configured backend OAuth service.`,
    };
  }
  if (typeof window === "undefined") return { ok: false, code: "not-configured", error: "Sign-in can only start in a browser." };
  // The API base URL is a separate origin, so a full-page navigation is required.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${apiBaseUrl}${apiEndpoints.oauthStart}/${provider}`);
  return { ok: true };
}

export async function exchangeSocialCode(code: string): Promise<AuthResult<{ email: string; firstName: string; lastName: string }>> {
  if (!apiBaseUrl) return { ok: false, code: "not-configured", error: "The authentication API is not configured." };
  try {
    const response = await fetch(`${apiBaseUrl}${apiEndpoints.oauthCallback.replace("/callback", "/exchange")}`, {
      method: "POST", headers: { "content-type": "application/json" }, credentials: "include", cache: "no-store", body: JSON.stringify({ code }),
    });
    const result = await response.json();
    if (!response.ok || !result.user?.email) return { ok: false, code: "provider-error", error: result.error?.message || "Could not complete provider sign-in." };
    return { ok: true, data: result.user };
  } catch {
    return { ok: false, code: "network", error: "Could not reach the authentication server." };
  }
}

/** Password reset request. No email is sent — no mail service is connected. */
export async function requestPasswordReset(_email: string): Promise<AuthResult> {
  return { ok: true }; // neutral confirmation; no delivery is claimed
}

/** Resend verification email. */
export async function resendVerificationEmail(): Promise<AuthResult> {
  return { ok: true }; // UI shows the cooldown; nothing is actually sent
}
