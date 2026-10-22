import { readRegistrationDetails, saveRegistrationDetails } from "./draft-storage";
import { createSession } from "./session";

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
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  cvParse: "/cvs/parse",
  cvUpload: "/cvs/upload",
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

/**
 * Email + password login. Until the API is configured, the email must match
 * an account registered in this browser tab. Passwords are never persisted;
 * local preview sign-in therefore cannot validate the password.
 */
export async function submitLogin(_credentials: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthResult<{ redirectTo: string }>> {
  if (isBackendConfigured()) {
    return { ok: false, code: "not-configured", error: `Connect the login API at ${apiEndpoints.login} to enable server authentication.` };
  }
  if (process.env.NODE_ENV === "production") {
    return { ok: false, code: "not-configured", error: "Sign-in is unavailable until the production authentication API is configured." };
  }
  const registration = readRegistrationDetails();
  if (!registration || registration.email.toLowerCase() !== _credentials.email.trim().toLowerCase()) {
    return { ok: false, code: "invalid-credentials", error: "No local account matches this email. Register first in this browser." };
  }
  const session = createSession(registration.accountType);
  return { ok: true, data: { redirectTo: session.accountType === "employer" ? "/employer/dashboard" : "/dashboard" } };
}

/** Email registration. Local preview stores identity details, never passwords. */
export async function submitRegistration(credentials: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: string;
}): Promise<AuthResult<{ verificationRequired: boolean }>> {
  if (isBackendConfigured()) {
    return { ok: false, code: "not-configured", error: `Connect the registration API at ${apiEndpoints.register} to enable server accounts.` };
  }
  if (process.env.NODE_ENV === "production") {
    return { ok: false, code: "not-configured", error: "Registration is unavailable until the production authentication API is configured." };
  }
  saveRegistrationDetails({
    firstName: credentials.firstName.trim(),
    lastName: credentials.lastName.trim(),
    email: credentials.email.trim().toLowerCase(),
    accountType: credentials.accountType as "job-seeker" | "employer",
  });
  const accountType = credentials.accountType as "job-seeker" | "employer";
  createSession(accountType);
  return { ok: true, data: { verificationRequired: false } };
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
