/**
 * Profile completion — computed from ACTUALLY SAVED data only.
 *
 * A section is complete when the underlying saved field is filled. Opening a
 * section, starting a form or hovering a button never counts as complete.
 * Steps stay independent of verification status: completing your profile does
 * not mean you are verified.
 */

import type { AccountSession } from "./session";
import { readJobSeekerDraft, readEmployerDraft } from "./draft-storage";
import {
  emptyJobSeekerDraft,
  emptyEmployerDraft,
  type EmployerDraft,
  type JobSeekerDraft,
} from "./onboarding-types";
import type { ProfileStatus } from "./account-types";

export type StepState = "done" | "todo" | "not-required";

export interface CompletionStep {
  id: string;
  label: string;
  /** Why the step matters — shown under every checklist row. */
  why: string;
  state: StepState;
  actionLabel: string;
  actionHref: string;
  optional?: boolean;
}

export interface CompletionResult {
  steps: CompletionStep[];
  doneCount: number;
  /** Steps that count toward the percentage (excludes "not required"). */
  requiredCount: number;
  percent: number;
  status: ProfileStatus;
}

function summarize(steps: CompletionStep[]): CompletionResult {
  const required = steps.filter((step) => step.state !== "not-required");
  const done = required.filter((step) => step.state === "done").length;
  const percent = required.length === 0 ? 0 : Math.round((done / required.length) * 100);
  const status: ProfileStatus =
    percent === 100 ? "complete" : percent > 0 || done > 0 ? "in-progress" : "incomplete";
  return { steps, doneCount: done, requiredCount: required.length, percent, status };
}

/* ------------------------------------------------------------------ */
/* Job seeker                                                          */
/* ------------------------------------------------------------------ */

function jobSeekerSteps(draft: JobSeekerDraft, session: AccountSession): CompletionStep[] {
  const { personal, employment, education, experience, skills, cv, notifications } = draft;

  const hasSkills =
    skills.technicalSkills.length > 0 ||
    skills.professionalSkills.length > 0 ||
    skills.certifications.length > 0;

  const hasExperience = experience.length > 0 || draft.noExperience;

  const hasCv = Boolean(cv.upload) || cv.professionalSummary.trim().length > 0;

  return [
    {
      id: "verify-email",
      label: "Verify your email",
      why: "A verified email secures your account and lets us send application updates, reminders and job alerts.",
      state: session.emailVerified ? "done" : "todo",
      actionLabel: "Verify Email",
      actionHref: "/verify-email",
    },
    {
      id: "personal-info",
      label: "Add your personal information",
      why: "Your name and headline are what employers see first — and they pre-fill your applications.",
      state: personal.firstName && personal.lastName && personal.headline ? "done" : "todo",
      actionLabel: "Add Personal Info",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "job-categories",
      label: "Select your preferred job categories",
      why: "We match you with jobs, internships, attachments and online tasks that fit what you are looking for.",
      state: employment.employmentTypes.length > 0 ? "done" : "todo",
      actionLabel: "Select Categories",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "education",
      label: "Add your education details",
      why: "Many opportunities list minimum qualifications — adding yours means you qualify automatically.",
      state: education.length > 0 ? "done" : "todo",
      actionLabel: "Add Education",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "skills",
      label: "Add your skills and certifications",
      why: "Skills power your matches, your profile ranking and the suggestions we show you.",
      state: hasSkills ? "done" : "todo",
      actionLabel: "Add Skills",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "experience",
      label: "Add work experience (or mark that you are seeking your first job)",
      why: "Show employers what you have done — or let them know you are starting out. Both are welcome.",
      state: hasExperience ? "done" : "todo",
      actionLabel: "Add Experience",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "cv",
      label: "Upload an existing CV or build one",
      why: "Most applications ask for a CV. Having one ready makes applying to anything faster.",
      state: hasCv ? "done" : "todo",
      actionLabel: hasCv ? "Manage CV" : "Upload CV",
      actionHref: "/dashboard/cv",
    },
    {
      id: "preferences",
      label: "Review your profile visibility and job alert preferences",
      why: "Control who can see your profile and how often we email you about matching opportunities.",
      state: notifications.jobAlertEmails ? "done" : "todo",
      actionLabel: "Review Preferences",
      actionHref: "/onboarding/job-seeker",
    },
    {
      id: "identity-verification",
      label: "Complete identity verification, if required",
      why: "Some opportunities require verified identity. KaziHub KE will tell you before it is needed — it is NOT required to start using your dashboard.",
      state: "not-required",
      actionLabel: "Learn What Verification Involves",
      actionHref: "/dashboard/verification",
      optional: true,
    },
  ];
}

export function getJobSeekerCompletion(
  session: AccountSession,
  savedDraft?: JobSeekerDraft,
): CompletionResult {
  const draft = savedDraft ?? readJobSeekerDraft(emptyJobSeekerDraft());
  return summarize(jobSeekerSteps(draft, session));
}

/* ------------------------------------------------------------------ */
/* Employer                                                            */
/* ------------------------------------------------------------------ */

function employerSteps(
  draft: EmployerDraft,
  session: AccountSession,
  jobDraftCount: number,
): CompletionStep[] {
  const { company, recruitment } = draft;

  const hasCompanyInfo = Boolean(company.organizationType) && Boolean(company.companySize);
  const hasLocationIndustry = Boolean(company.industry) && Boolean(company.county) && Boolean(company.city);
  const hasContact = Boolean(recruitment.contactName) && Boolean(recruitment.contactEmail);
  const verificationSubmitted = session.verificationStatus !== "not-started";
  const publicProfileReady =
    Boolean(company.companyName) && Boolean(company.description.trim()) && Boolean(company.industry);

  return [
    {
      id: "verify-email",
      label: "Verify the registered email",
      why: "A verified work email confirms the account is real and lets us send application and verification updates.",
      state: session.emailVerified ? "done" : "todo",
      actionLabel: "Verify Email",
      actionHref: "/verify-email",
    },
    {
      id: "organization-name",
      label: "Add the organization name",
      why: "Candidates see your organization on every listing — it is the first thing they check.",
      state: company.companyName ? "done" : "todo",
      actionLabel: "Add Company Details",
      actionHref: "/onboarding/employer",
    },
    {
      id: "company-info",
      label: "Complete company information",
      why: "Organization type and size set candidate expectations about who they would work for.",
      state: hasCompanyInfo ? "done" : "todo",
      actionLabel: "Add Company Details",
      actionHref: "/onboarding/employer",
    },
    {
      id: "description",
      label: "Add the organization description",
      why: "A clear description helps candidates decide whether your roles are right for them.",
      state: company.description.trim() ? "done" : "todo",
      actionLabel: "Add Description",
      actionHref: "/onboarding/employer",
    },
    {
      id: "location-industry",
      label: "Add location and industry",
      why: "Location and industry drive which candidates find your listings in search.",
      state: hasLocationIndustry ? "done" : "todo",
      actionLabel: "Add Location & Industry",
      actionHref: "/onboarding/employer",
    },
    {
      id: "logo",
      label: "Upload a company logo (optional)",
      why: "A logo builds trust on your public profile and in listing search results.",
      state: company.logoName ? "done" : "todo",
      actionLabel: "Upload Logo",
      actionHref: "/onboarding/employer",
      optional: true,
    },
    {
      id: "recruitment-contact",
      label: "Add recruitment contact information",
      why: "Candidates and our team need a named contact for your vacancies.",
      state: hasContact ? "done" : "todo",
      actionLabel: "Add Recruitment Contact",
      actionHref: "/onboarding/employer",
    },
    {
      id: "verification",
      label: "Submit the required verification information",
      why: "Verification lets you publish listings, receive applications and search candidates.",
      state: verificationSubmitted ? "done" : "todo",
      actionLabel: "Start Verification",
      actionHref: "/employer/dashboard/verification",
    },
    {
      id: "public-profile",
      label: "Review the company's public profile",
      why: "Check how your organization appears to candidates before anything is published.",
      state: publicProfileReady ? "done" : "todo",
      actionLabel: "Review Public Profile",
      actionHref: "/employer/dashboard/company-profile",
    },
    {
      id: "first-listing",
      label: "Prepare the first job listing",
      why: "A saved draft is ready to submit for review as soon as your account is verified.",
      state: jobDraftCount > 0 ? "done" : "todo",
      actionLabel: "Post a Job",
      actionHref: "/employer/dashboard/jobs/new",
    },
  ];
}

export function getEmployerCompletion(
  session: AccountSession,
  savedDraft?: EmployerDraft,
  savedJobCount?: number,
): CompletionResult {
  const draft = savedDraft ?? readEmployerDraft(emptyEmployerDraft());
  const jobDraftCount = savedJobCount ?? (typeof window === "undefined" ? 0 : readAllDraftCount());
  return summarize(employerSteps(draft, session, jobDraftCount));
}

/** Draft count is read lazily so this module does not import storage keys. */
function readAllDraftCount(): number {
  try {
    const raw = window.sessionStorage.getItem("kazihub.draft.job-listings");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/** Exposed for the employer dashboard's metrics card. */
export function countJobDrafts(): number {
  return readAllDraftCount();
}
