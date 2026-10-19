/**
 * Draft persistence for onboarding forms.
 *
 * SECURITY: drafts contain personal information but NEVER passwords, tokens or
 * file contents. `sessionStorage` is used (per-tab, cleared when the tab closes)
 * rather than `localStorage`, and `toStorage` strips any key in `SENSITIVE_KEYS`
 * before writing as defence in depth.
 *
 * Replace this module's read/write calls with API calls when the backend
 * supports draft saving; the calling components do not change.
 */

const JOB_SEEKER_KEY = "kazihub.draft.job-seeker";
const EMPLOYER_KEY = "kazihub.draft.employer";
const ACCOUNT_TYPE_KEY = "kazihub.registration.accountType";
const REGISTRATION_KEY = "kazihub.registration.details";

/** Keys that must never be persisted, in any draft, under any circumstance. */
const SENSITIVE_KEYS = new Set([
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "session",
  "file",
  "fileContents",
  "fileBuffer",
]);

/** Recursively remove sensitive keys before anything is written to storage. */
function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (!SENSITIVE_KEYS.has(key)) out[key] = sanitize(val);
    }
    return out;
  }
  return value;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Merge onto the fallback so a schema change in a later release cannot
    // crash a step that reads a missing field.
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(sanitize(value)));
  } catch {
    // Quota exceeded or storage blocked — the in-memory draft still works.
  }
}

/* ------------------------------------------------------------------ */
/* Account type chosen at registration                                 */
/* ------------------------------------------------------------------ */

export function saveAccountType(type: "job-seeker" | "employer"): void {
  writeJson(ACCOUNT_TYPE_KEY, { type });
}

export function clearAccountType(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACCOUNT_TYPE_KEY);
  } catch {
    // Storage can be blocked; the current page state can still be reset.
  }
}

export function readAccountType(): "job-seeker" | "employer" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ACCOUNT_TYPE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { type?: string };
    return parsed.type === "employer" ? "employer" : parsed.type === "job-seeker" ? "job-seeker" : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Registration details (no backend: kept for this session only)       */
/* ------------------------------------------------------------------ */

export interface StoredRegistrationDetails {
  firstName: string;
  lastName: string;
  email: string;
  accountType: "job-seeker" | "employer";
}

/**
 * Name + email typed at registration. NEVER includes a password — the
 * registration form does not pass one here. Stored in sessionStorage only,
 * so the dashboard can greet a real registered user without inventing one.
 */
export function saveRegistrationDetails(details: StoredRegistrationDetails): void {
  writeJson(REGISTRATION_KEY, details);
}

export function readRegistrationDetails(): StoredRegistrationDetails | null {
  try {
    const raw = window.sessionStorage.getItem(REGISTRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRegistrationDetails;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Job seeker draft                                                    */
/* ------------------------------------------------------------------ */

export function readJobSeekerDraft<T>(fallback: T): T {
  return readJson(JOB_SEEKER_KEY, fallback);
}

export function writeJobSeekerDraft(draft: unknown): void {
  writeJson(JOB_SEEKER_KEY, draft);
}

/* ------------------------------------------------------------------ */
/* Employer draft                                                      */
/* ------------------------------------------------------------------ */

export function readEmployerDraft<T>(fallback: T): T {
  return readJson(EMPLOYER_KEY, fallback);
}

export function writeEmployerDraft(draft: unknown): void {
  writeJson(EMPLOYER_KEY, draft);
}

/* ------------------------------------------------------------------ */
/* Housekeeping                                                        */
/* ------------------------------------------------------------------ */

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(JOB_SEEKER_KEY);
    window.sessionStorage.removeItem(EMPLOYER_KEY);
    window.sessionStorage.removeItem(ACCOUNT_TYPE_KEY);
    window.sessionStorage.removeItem(REGISTRATION_KEY);
  } catch {
    // ignore
  }
}
