/**
 * Frontend permission checks.
 *
 * These improve navigation and messaging ONLY — the backend is what actually
 * enforces authorization. Nothing a user can click here grants a privileged
 * permission: publishing, candidate search and document access all require
 * backend confirmation.
 */

import type { AccountSession } from "./session";
import type { VerificationStatus } from "./account-types";

export interface PermissionResult {
  allowed: boolean;
  /** Shown next to a locked action when `allowed` is false. */
  reason?: string;
}

const verifiedStatuses: VerificationStatus[] = ["verified"];

const isVerified = (session: AccountSession | null): boolean =>
  Boolean(session && verifiedStatuses.includes(session.verificationStatus));

const isEmployer = (session: AccountSession | null): boolean =>
  Boolean(session && session.accountType === "employer");

/** Drafts are always allowed — they are private to the employer. */
export function canCreateJobDraft(session: AccountSession | null): PermissionResult {
  if (!isEmployer(session)) {
    return { allowed: false, reason: "Only employer accounts can prepare job listings." };
  }
  return { allowed: true };
}

/**
 * Publishing needs a verified organization AND platform moderation. The
 * frontend never publishes on its own.
 */
export function canPublishJob(session: AccountSession | null): PermissionResult {
  if (!isEmployer(session)) {
    return { allowed: false, reason: "Only employer accounts can publish job listings." };
  }
  if (!isVerified(session)) {
    return {
      allowed: false,
      reason:
        "Publishing requires a verified organization account and platform moderation. You can still prepare and save drafts now.",
    };
  }
  return { allowed: true };
}

/** Candidate search unlocks after verification — it protects candidate privacy. */
export function canSearchCandidates(session: AccountSession | null): PermissionResult {
  if (!isEmployer(session)) {
    return { allowed: false, reason: "Candidate search is available to employer accounts." };
  }
  if (!isVerified(session)) {
    return {
      allowed: false,
      reason:
        "Candidate search unlocks after your organization is verified. This protects candidates' privacy and consent settings.",
    };
  }
  return { allowed: true };
}

/** Employers can always open their own (empty) applications inbox. */
export function canViewApplications(session: AccountSession | null): PermissionResult {
  if (!isEmployer(session)) {
    return { allowed: false, reason: "Applications are visible to employer accounts." };
  }
  return { allowed: true };
}

/** Verification can be submitted (or resubmitted) unless it is already in review. */
export function canSubmitVerification(session: AccountSession | null): PermissionResult {
  if (!isEmployer(session)) {
    return { allowed: false, reason: "Organization verification is available to employer accounts." };
  }
  if (session?.verificationStatus === "pending-review") {
    return {
      allowed: false,
      reason: "Your verification is already submitted and awaiting review.",
    };
  }
  return { allowed: true };
}
