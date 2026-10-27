/**
 * Verification service.
 *
 * RULES ENFORCED HERE:
 * - The frontend NEVER marks an account verified. `verified` only ever comes
 *   from the backend. There is no code path that sets it locally.
 * - Job seekers are NOT required to submit identity documents by default.
 *   The verification requirements below are the documented policy; documents
 *   are collected only when justified for the organization type and risk
 *   level. Establish the real policy with the backend before enabling more.
 * - A submission updates a local demo status (pending-review) so every state
 *   can be seen in the UI. Every screen labels it as a local demo state —
 *   no backend review has occurred.
 */

import type { AccountSession } from "./session";
import { apiRequest } from "./api";
import type { VerificationStatus } from "./account-types";

/* ------------------------------------------------------------------ */
/* Documented verification policy                                      */
/* ------------------------------------------------------------------ */

export interface VerificationFieldSpec {
  id: string;
  label: string;
  required: boolean;
  why: string;
}

/**
 * What KaziHub KE collects for organization verification. This list is the
 * documented, configurable policy: only information necessary for the
 * selected organization type and risk level. Documents are NOT required by
 * default — the backend decides when they are.
 */
export const employerVerificationPolicy = {
  summary:
    "KaziHub KE verifies organizations so candidates know they are applying through a real employer. We collect only the information needed for your organization type — documents are requested only when required.",
  fields: [
    {
      id: "legalName",
      label: "Organization legal or registered name",
      required: true,
      why: "Matches your listing's organization against official records.",
    },
    {
      id: "organizationType",
      label: "Organization type",
      required: true,
      why: "Determines which verification checks apply to you.",
    },
    {
      id: "representativeName",
      label: "Authorized representative's name",
      required: true,
      why: "Identifies the person submitting verification on the organization's behalf.",
    },
    {
      id: "representativeRole",
      label: "Authorized representative's role",
      required: true,
      why: "Confirms the representative is authorized to act for the organization.",
    },
    {
      id: "officialEmail",
      label: "Official organization email or contact evidence",
      required: true,
      why: "A domain-matched or verifiable contact proves the organization exists.",
    },
    {
      id: "website",
      label: "Website or other organization information",
      required: false,
      why: "Helps our team confirm your organization when a website exists.",
    },
    {
      id: "registrationNumber",
      label: "Business registration number",
      required: false,
      why: "Requested for some organization types — not required by default.",
    },
    {
      id: "document",
      label: "Supporting document",
      required: false,
      why: "Only requested when necessary for your organization type and risk level.",
    },
  ] as VerificationFieldSpec[],
  documentsRequiredByDefault: false,
};

export interface EmployerVerificationSubmission {
  legalName: string;
  organizationType: string;
  representativeName: string;
  representativeRole: string;
  officialEmail: string;
  website: string;
  registrationNumber: string;
  documentName: string;
  documentKey?: string;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Job seeker                                                          */
/* ------------------------------------------------------------------ */

export interface JobSeekerVerificationView {
  status: VerificationStatus;
  /** Job seekers are not required to verify by default. */
  required: false;
  explanation: string;
}

export async function getJobSeekerVerification(
  session: AccountSession,
): Promise<JobSeekerVerificationView> {
  await wait(150);
  return {
    status: session.verificationStatus,
    required: false,
    explanation:
      "Identity verification is not required to browse or apply for most opportunities. When an opportunity requires verified identity, KaziHub KE will ask for it at that point — you will never need to upload sensitive documents just to use your dashboard.",
  };
}

/* ------------------------------------------------------------------ */
/* Employer                                                            */
/* ------------------------------------------------------------------ */

export interface SubmitVerificationResult {
  ok: boolean;
  status?: VerificationStatus;
  message: string;
}

export function validateEmployerVerification(
  submission: EmployerVerificationSubmission,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!submission.legalName.trim()) errors.legalName = "Add the organization's legal or registered name.";
  if (!submission.organizationType) errors.organizationType = "Select the organization type.";
  if (!submission.representativeName.trim()) errors.representativeName = "Add the representative's name.";
  if (!submission.representativeRole) errors.representativeRole = "Select the representative's role.";
  if (!submission.officialEmail.trim()) {
    errors.officialEmail = "Add an official email or contact evidence.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.officialEmail.trim())) {
    errors.officialEmail = "Enter a valid email address.";
  }
  return errors;
}

/**
 * Persist employer details and submit them for an administrator's review.
 * Verification itself is only granted by the backend admin decision.
 */
export async function submitEmployerVerification(
  submission: EmployerVerificationSubmission,
): Promise<SubmitVerificationResult> {
  const errors = validateEmployerVerification(submission);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Check the highlighted fields and try again." };
  }

  try {
    await apiRequest("/profile/employer", {
      method: "PUT",
      body: JSON.stringify({
        company: { companyName: submission.legalName, organizationType: submission.organizationType, website: submission.website, country: "Kenya" },
        recruitment: { contactName: submission.representativeName, contactEmail: submission.officialEmail },
        verification: submission,
      }),
    });
    const result = await apiRequest<{ verification: { status: VerificationStatus } }>("/employer/verification", {
      method: "POST",
      body: JSON.stringify({ submission }),
    });
    return { ok: true, status: result.verification.status, message: "Verification details were sent to KaziHub KE for review." };
  } catch (reason) {
    return { ok: false, message: reason instanceof Error ? reason.message : "Could not submit verification to the platform." };
  }
}
