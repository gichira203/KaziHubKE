import { readRegistrationDetails, saveRegistrationDetails } from "./draft-storage";
import { createSession } from "./session";

/**
 * Authentication configuration and integration points.
 *
 * STATUS: no backend or OAuth provider is connected yet. Every auth action in
 * the UI routes through this module, so when the backend lands the only change
 * needed is inside `submitLogin`, `submitRegistration` and the provider
 * handlers — no page or component edits.
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

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

export const authProviders: Record<AuthProviderId, AuthProvider> = {
  google: {
    id: "google",
    name: "Google",
    // Public identifier — safe for the client. Never a client secret.
    clientId: env("NEXT_PUBLIC_GOOGLE_CLIENT_ID") ?? null,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["openid", "email", "profile"],
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    clientId: env("NEXT_PUBLIC_FACEBOOK_APP_ID") ?? null,
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    // Facebook requires app review before `email` is granted to the public.
    scopes: ["email", "public_profile"],
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    clientId: env("NEXT_PUBLIC_LINKEDIN_CLIENT_ID") ?? null,
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["openid", "profile", "email"],
  },
};

export function isProviderConfigured(provider: AuthProviderId): boolean {
  const config = authProviders[provider];
  return Boolean(config.clientId && config.authorizeUrl);
}

export const isAnyProviderConfigured = (): boolean =>
  (Object.keys(authProviders) as AuthProviderId[]).some(isProviderConfigured);

/* ------------------------------------------------------------------ */
/* Backend endpoint contract                                           */
/* ------------------------------------------------------------------ */

/** Base URL of the future API. Empty until configured — requests stay local. */
export const apiBaseUrl: string = env("NEXT_PUBLIC_API_BASE_URL") ?? "";

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
      error: `${authProviders[provider].name} sign-in is not configured yet. Add the public client ID (NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID) and connect the OAuth callback to the backend.`,
    };
  }
  return {
    ok: false,
    code: "not-configured",
    error: `${authProviders[provider].name} sign-in needs a server-side redirect. Connect ${apiEndpoints.oauthStart} to start the flow.`,
  };
}

/** Password reset request. No email is sent — no mail service is connected. */
export async function requestPasswordReset(_email: string): Promise<AuthResult> {
  return { ok: true }; // neutral confirmation; no delivery is claimed
}

/** Resend verification email. */
export async function resendVerificationEmail(): Promise<AuthResult> {
  return { ok: true }; // UI shows the cooldown; nothing is actually sent
}
