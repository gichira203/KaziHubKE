/**
 * Demo account session (client-only).
 *
 * There is no authentication backend, so this module stores a LOCAL demo
 * session in sessionStorage. The session it creates represents exactly the
 * account state the dashboards are designed for — a newly registered user:
 *
 *   - account exists (status: active)
 *   - email verification pending
 *   - profile incomplete
 *   - verification not started
 *
 * Nothing here is a real account. No passwords, tokens or documents are ever
 * stored — only the account type, the email/name typed at registration, and
 * verification status transitions initiated in this browser. When the backend
 * lands, replace the reads/writes in this module with API calls; the calling
 * components do not change.
 */

import type { AccountStatus, AccountType, VerificationStatus } from "./account-types";
import { readRegistrationDetails } from "./draft-storage";

const SESSION_KEY = "kazihub.session";

export interface VerificationEvent {
  status: VerificationStatus;
  at: string;
  note: string;
}

export interface AccountSession {
  accountType: AccountType;
  /** Typed at registration. Empty when the visitor never registered. */
  email: string;
  firstName: string;
  lastName: string;
  /** A real verification link sets this — the frontend never does. */
  emailVerified: boolean;
  createdAt: string;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt: string;
  verificationHistory: VerificationEvent[];
  /** Marks this session as a local demo — there is no server-side account. */
  localDemo: true;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full — the session stays in memory for this page.
  }
}

const now = (): string => new Date().toISOString();

export function readSession(): AccountSession | null {
  const session = readJson<AccountSession>(SESSION_KEY);
  return session && typeof session === "object" && "accountType" in session ? session : null;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Create a fresh session for a NEWLY REGISTERED account. Email starts
 * unverified, the profile is empty (nothing has been saved) and verification
 * has not started. The name/email come from the registration form when the
 * visitor actually registered — nothing is invented.
 */
export function createSession(accountType: AccountType): AccountSession {
  const details = readRegistrationDetails();
  const session: AccountSession = {
    accountType,
    email: details?.accountType === accountType ? details.email : "",
    firstName: details?.accountType === accountType ? details.firstName : "",
    lastName: details?.accountType === accountType ? details.lastName : "",
    emailVerified: false,
    createdAt: now(),
    verificationStatus: "not-started",
    verificationSubmittedAt: "",
    verificationHistory: [],
    localDemo: true,
  };
  writeJson(SESSION_KEY, session);
  return session;
}

/**
 * The session for the dashboard being visited. A session belongs to one
 * account type: a job seeker visiting the employer dashboard (or vice versa)
 * gets a fresh session of the correct type rather than the wrong one's data.
 *
 * If the visitor registered AFTER a session was first created (e.g. they
 * explored the dashboard before signing up), the registration details fill
 * in the identity fields — the session itself is never re-created, so
 * verification history and saved progress are preserved.
 */
export function getOrCreateSession(accountType: AccountType): AccountSession {
  const existing = readSession();
  if (existing && existing.accountType === accountType) {
    const details = readRegistrationDetails();
    if (details && details.accountType === accountType && !existing.firstName && details.firstName) {
      const merged: AccountSession = {
        ...existing,
        email: details.email,
        firstName: details.firstName,
        lastName: details.lastName,
      };
      writeJson(SESSION_KEY, merged);
      return merged;
    }
    return existing;
  }
  return createSession(accountType);
}

export function updateSession(patch: Partial<AccountSession>): AccountSession | null {
  const current = readSession();
  if (!current) return null;
  const updated: AccountSession = { ...current, ...patch };
  writeJson(SESSION_KEY, updated);
  return updated;
}

/** Display name — falls back to the email, never to an invented name. */
export function displayName(session: AccountSession): string {
  const name = [session.firstName, session.lastName].filter(Boolean).join(" ");
  return name || session.email;
}

/** Initials for the avatar — from the typed name, else the email. */
export function initials(session: AccountSession): string {
  if (session.firstName) {
    const first = session.firstName.trim()[0] ?? "";
    const last = session.lastName.trim()[0] ?? "";
    return (first + last).toUpperCase() || "?";
  }
  if (session.email) return session.email.trim()[0].toUpperCase();
  return "?";
}

export function accountStatus(session: AccountSession): AccountStatus {
  return session.emailVerified ? "active" : "email-verification-pending";
}
