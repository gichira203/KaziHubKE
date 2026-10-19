/**
 * Dashboard data services.
 *
 * Every function is async and returns plain data — UI components never touch
 * storage directly. With no backend these read the local session + drafts and
 * simulate network latency so the UI can show real loading states. When the
 * API lands, only the bodies of these functions change — the component
 * contracts stay identical.
 *
 * HONESTY RULES:
 * - A new account has ZERO applications, listings and candidate results.
 *   Those arrays are empty by design; the UI shows empty states, not samples.
 * - Only clearly-labelled sample data (opportunities, tasks) is returned.
 * - Notifications are DERIVED from real account state, never fabricated.
 */

import type { AccountSession } from "./session";
import { getOrCreateSession } from "./session";
import type { CompletionResult } from "./profile-service";
import { getJobSeekerCompletion, getEmployerCompletion } from "./profile-service";
import type { JobDraft } from "./job-drafts";
import { listJobDrafts } from "./job-drafts";
import type { EmployerCompany, EmployerDraft, EmployerRecruitment, EmployerVerification, JobSeekerDraft } from "./onboarding-types";
import { emptyEmployerDraft, emptyJobSeekerDraft } from "./onboarding-types";
import { readEmployerDraft, readJobSeekerDraft } from "./draft-storage";
import type { Job } from "@/data/jobs";
import type { OnlineTask } from "@/data/tasks";
import { jobs } from "@/data/jobs";
import { onlineTasks } from "@/data/tasks";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Notifications (derived from real account state)                     */
/* ------------------------------------------------------------------ */

export interface DashboardNotification {
  id: string;
  kind: "email-verification" | "profile-completion" | "cv-reminder" | "verification";
  title: string;
  body: string;
  unread: boolean;
  href: string;
}

export function deriveNotifications(
  session: AccountSession,
  completion?: CompletionResult,
): DashboardNotification[] {
  const notifications: DashboardNotification[] = [];

  if (!session.emailVerified) {
    notifications.push({
      id: "verify-email",
      kind: "email-verification",
      title: "Verify your email address",
      body: "Confirm your email to secure your account and receive application and job alert updates.",
      unread: true,
      href: "/verify-email",
    });
  }

  if (completion && completion.percent < 100) {
    notifications.push({
      id: "complete-profile",
      kind: "profile-completion",
      title: "Complete your profile",
      body: `Your profile is ${completion.percent}% complete. A complete profile gets better-matched opportunities.`,
      unread: true,
      href: session.accountType === "employer" ? "/onboarding/employer" : "/onboarding/job-seeker",
    });
  }

  if (session.accountType === "job-seeker" && completion) {
    const cvStep = completion.steps.find((step) => step.id === "cv");
    if (cvStep && cvStep.state === "todo") {
      notifications.push({
        id: "add-cv",
        kind: "cv-reminder",
        title: "Add your CV",
        body: "Most applications ask for a CV. Upload one or build it on KaziHub KE.",
        unread: true,
        href: "/dashboard/cv",
      });
    }
  }

  if (session.accountType === "employer" && session.verificationStatus === "not-started") {
    notifications.push({
      id: "start-verification",
      kind: "verification",
      title: "Start organization verification",
      body: "Verification lets you publish listings, receive applications and search candidates.",
      unread: true,
      href: "/employer/dashboard/verification",
    });
  }

  return notifications;
}

/* ------------------------------------------------------------------ */
/* Job seeker overview                                                 */
/* ------------------------------------------------------------------ */

export interface JobSeekerOverview {
  session: AccountSession;
  draft: JobSeekerDraft;
  completion: CompletionResult;
  notifications: DashboardNotification[];
  /** A new account has none — the UI shows an empty state, never samples. */
  applications: [];
  savedOpportunities: [];
  /** Clearly-labelled sample opportunities for discovery. */
  sampleJobs: Job[];
  sampleTasks: OnlineTask[];
}

export async function getJobSeekerOverview(): Promise<JobSeekerOverview> {
  await wait(350);
  const session = getOrCreateSession("job-seeker");
  const completion = getJobSeekerCompletion(session);
  return {
    session,
    draft: readJobSeekerDraft(emptyJobSeekerDraft()),
    completion,
    notifications: deriveNotifications(session, completion),
    applications: [],
    savedOpportunities: [],
    sampleJobs: jobs.slice(0, 6),
    sampleTasks: onlineTasks.slice(0, 3),
  };
}

/* ------------------------------------------------------------------ */
/* Employer overview                                                   */
/* ------------------------------------------------------------------ */

export interface EmployerMetrics {
  activeJobs: number;
  draftJobs: number;
  applicationsReceived: number;
  candidatesShortlisted: number;
}

export interface EmployerOverview {
  session: AccountSession;
  draft: EmployerDraft;
  company: EmployerCompany;
  recruitment: EmployerRecruitment;
  verification: EmployerVerification;
  completion: CompletionResult;
  notifications: DashboardNotification[];
  /** A new employer has none — empty states, never samples. */
  drafts: JobDraft[];
  metrics: EmployerMetrics;
}

export async function getEmployerOverview(): Promise<EmployerOverview> {
  await wait(350);
  const session = getOrCreateSession("employer");
  const completion = getEmployerCompletion(session);
  const draft = readEmployerDraft(emptyEmployerDraft());
  const drafts = listJobDrafts();

  return {
    session,
    draft,
    company: draft.company,
    recruitment: draft.recruitment,
    verification: draft.verification,
    completion,
    notifications: deriveNotifications(session, completion),
    drafts,
    metrics: {
      activeJobs: 0,
      draftJobs: drafts.length,
      applicationsReceived: 0,
      candidatesShortlisted: 0,
    },
  };
}
