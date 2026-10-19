/**
 * Status models for accounts, profiles, verification and listings.
 *
 * These are deliberately SEPARATE concepts (see spec part C): an account can
 * be active while the profile is incomplete, and an employer can have a
 * complete company profile while still awaiting verification. The UI must
 * never collapse them into a single field, and `verified` can only ever
 * arrive from an authoritative backend response.
 *
 * These types are also the frontend contract for the future API — each status
 * maps to a backend field of the same name.
 */

export type AccountType = "job-seeker" | "employer";

/** Lifecycle of the account itself — independent of profile or verification. */
export type AccountStatus = "active" | "email-verification-pending" | "suspended";

/** Completeness of profile data the user has ACTUALLY SAVED. */
export type ProfileStatus = "incomplete" | "in-progress" | "complete";

/**
 * Identity (job seeker) or organization (employer) verification.
 * `verified` is only ever set from the backend — the frontend never
 * approves verification on its own.
 */
export type VerificationStatus =
  | "not-started"
  | "submitted"
  | "pending-review"
  | "action-required"
  | "verified"
  | "rejected";

/** Job listing workflow. A draft is never presented as live. */
export type JobListingStatus =
  | "draft"
  | "pending-review"
  | "published"
  | "paused"
  | "closed"
  | "rejected";

/** Application lifecycle — shown only when real application data exists. */
export type ApplicationStatus =
  | "submitted"
  | "under-review"
  | "shortlisted"
  | "interview"
  | "closed";

/** Colour tone for badges. Status is always accompanied by text + icon. */
export type StatusTone = "neutral" | "info" | "warning" | "success" | "error";

export const accountStatusLabels: Record<AccountStatus, string> = {
  active: "Active",
  "email-verification-pending": "Email verification pending",
  suspended: "Suspended",
};

export const profileStatusLabels: Record<ProfileStatus, string> = {
  incomplete: "Incomplete",
  "in-progress": "In progress",
  complete: "Complete",
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  "not-started": "Not started",
  submitted: "Submitted",
  "pending-review": "Pending review",
  "action-required": "Action required",
  verified: "Verified",
  rejected: "Rejected",
};

export const jobListingStatusLabels: Record<JobListingStatus, string> = {
  draft: "Draft",
  "pending-review": "Pending review",
  published: "Published",
  paused: "Paused",
  closed: "Closed",
  rejected: "Rejected",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  closed: "Closed",
};

export const accountStatusTones: Record<AccountStatus, StatusTone> = {
  active: "success",
  "email-verification-pending": "warning",
  suspended: "error",
};

export const verificationStatusTones: Record<VerificationStatus, StatusTone> = {
  "not-started": "neutral",
  submitted: "info",
  "pending-review": "warning",
  "action-required": "warning",
  verified: "success",
  rejected: "error",
};

export const jobListingStatusTones: Record<JobListingStatus, StatusTone> = {
  draft: "neutral",
  "pending-review": "warning",
  published: "success",
  paused: "warning",
  closed: "neutral",
  rejected: "error",
};

export const applicationStatusTones: Record<ApplicationStatus, StatusTone> = {
  submitted: "info",
  "under-review": "warning",
  shortlisted: "success",
  interview: "success",
  closed: "neutral",
};
