/**
 * Form validation helpers for authentication, registration and onboarding.
 *
 * FRONTEND VALIDATION ONLY. These checks improve the experience; they are not
 * a security boundary. Every rule here must be re-enforced server-side when
 * the backend is connected (see README → Backend integration).
 */

/* ------------------------------------------------------------------ */
/* Field-level rules                                                   */
/* ------------------------------------------------------------------ */

/**
 * Pragmatic email pattern: one @, a dotted domain, no spaces.
 * Deliberately lenient — the server is the authority on whether a mailbox exists.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address, e.g. name@example.com.";
  return null;
}

export function validateName(value: string, label = "name"): string | null {
  const name = value.trim();
  if (!name) return `Enter your ${label}.`;
  if (name.length < 2) return `Your ${label} looks too short.`;
  if (name.length > 60) return `Your ${label} is too long (max 60 characters).`;
  if (!/^[\p{L}\p{M}'\-. ]+$/u.test(name)) {
    return "Use letters, spaces, hyphens and apostrophes only.";
  }
  return null;
}

/**
 * Kenyan telephone numbers. Accepts local (07…/01…) and international (+254…)
 * formats; normalizes before checking so "+254 712 345 678" passes.
 */
export function validatePhone(value: string, required = true): string | null {
  const raw = value.trim();
  if (!raw) return required ? "Enter your phone number." : null;

  const compact = raw.replace(/[\s()-]/g, "");
  const local = compact.startsWith("+254")
    ? `0${compact.slice(4)}`
    : compact.startsWith("254")
      ? `0${compact.slice(3)}`
      : compact;

  if (!/^0(7|1)\d{8}$/.test(local)) {
    return "Enter a valid Kenyan number, e.g. 0712 345 678 or +254 712 345 678.";
  }
  return null;
}

/** Format a valid Kenyan number as +254 7XX XXX XXX for display. */
export function formatPhoneForDisplay(value: string): string {
  const compact = value.replace(/[\s()-]/g, "");
  const local = compact.startsWith("+254")
    ? `0${compact.slice(4)}`
    : compact.startsWith("254")
      ? `0${compact.slice(3)}`
      : compact;
  // Local form is 10 digits: leading 0, network digit, 2 digits, then 3 + 3.
  // 0712 345 678 → +254 712 345 678.
  const m = /^0(7|1)(\d{2})(\d{3})(\d{3})$/.exec(local);
  return m ? `+254 ${m[1]}${m[2]} ${m[3]} ${m[4]}` : value.trim();
}

/** Minimum password policy: 8+ chars, one letter, one number. */
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(value: string): string | null {
  if (!value) return "Choose a password.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(value)) return "Include at least one letter.";
  if (!/\d/.test(value)) return "Include at least one number.";
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return "Confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function validateYear(value: string, label = "year"): string | null {
  if (!value.trim()) return null; // optional unless the caller requires it
  if (!/^\d{4}$/.test(value.trim())) return `Enter the ${label} as a 4-digit year, e.g. 2022.`;
  const year = Number(value.trim());
  const current = new Date().getFullYear();
  if (year < 1950 || year > current + 10) {
    return `Enter a ${label} between 1950 and ${current + 10}.`;
  }
  return null;
}

export function validateUrl(value: string, label = "link"): string | null {
  const url = value.trim();
  if (!url) return null; // optional
  if (!/^https?:\/\/.+\..+/.test(url)) {
    return `Enter a full ${label} starting with https://`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Password strength                                                   */
/* ------------------------------------------------------------------ */

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrength {
  level: StrengthLevel;
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** Requirements still unmet, rendered as a checklist. */
  missing: string[];
}

export function assessPassword(value: string): PasswordStrength {
  const missing: string[] = [];
  if (value.length < PASSWORD_MIN_LENGTH) missing.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  if (!/[a-z]/.test(value)) missing.push("A lowercase letter");
  if (!/[A-Z]/.test(value)) missing.push("An uppercase letter");
  if (!/\d/.test(value)) missing.push("A number");
  if (!/[^\w\s]/.test(value)) missing.push("A symbol (e.g. ! ? #)");

  if (!value) {
    return { level: "empty", score: 0, label: "Enter a password", missing };
  }

  // Scoring: 1 point for meeting the base policy, then bonus points.
  // The floor is "fair" — a password that passes policy is never "weak".
  let score = 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1;
  // Meets every base requirement (8+, letter, number) but no bonus → fair.
  const meetsBase =
    value.length >= PASSWORD_MIN_LENGTH && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
  if (score === 1 && meetsBase) score = 2;

  const levels: Array<{ score: number; level: StrengthLevel; label: string }> = [
    { score: 0, level: "weak", label: "Weak" },
    { score: 1, level: "weak", label: "Weak" },
    { score: 2, level: "fair", label: "Fair" },
    { score: 3, level: "good", label: "Good" },
    { score: 4, level: "strong", label: "Strong" },
  ];
  const match = levels[Math.min(score, 4)];

  return { level: match.level, score: match.score as PasswordStrength["score"], label: match.label, missing };
}

/* ------------------------------------------------------------------ */
/* File upload validation                                              */
/* ------------------------------------------------------------------ */

export const CV_ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const CV_ALLOWED_EXTENSIONS = ["pdf", "docx"] as const;

/** Maximum CV size: 5 MB. Enforced again server-side after integration. */
export const CV_MAX_SIZE = 5 * 1024 * 1024;

export const LOGO_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const LOGO_MAX_SIZE = 2 * 1024 * 1024;

export const PHOTO_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const PHOTO_MAX_SIZE = 2 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateUploadFile(
  file: File,
  allowedTypes: readonly string[],
  maxSize: number,
  label: string,
): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeAllowed =
    allowedTypes.includes(file.type) || allowedTypes.some((t) => t.endsWith(extension));
  if (!typeAllowed) {
    return `Upload a ${allowedTypes
      .map((t) => t.split("/").pop()?.replace("vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"))
      .join(" or ")} file. ${file.type || "This file type"} is not supported.`;
  }
  if (file.size > maxSize) {
    return `${label} is too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(maxSize)}.`;
  }
  return null;
}
