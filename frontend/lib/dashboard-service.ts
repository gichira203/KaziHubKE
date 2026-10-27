/** Dashboard data services backed by authenticated API responses. */

import type { AccountSession } from "./session";
import { createAccountSession } from "./session";
import type { CompletionResult } from "./profile-service";
import { getJobSeekerCompletion, getEmployerCompletion } from "./profile-service";
import type { JobDraft } from "./job-drafts";
import type { EmployerCompany, EmployerDraft, EmployerRecruitment, EmployerVerification, JobSeekerDraft } from "./onboarding-types";
import { emptyEmployerDraft, emptyJobSeekerDraft } from "./onboarding-types";
import { readJobSeekerDraft, writeJobSeekerDraft } from "./draft-storage";
import { apiRequest } from "./api";
import type { Job } from "@/data/jobs";
import type { OnlineTask } from "@/data/tasks";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function employerVerificationStatus(status: AccountSession["verificationStatus"]): EmployerVerification["status"] {
  if (status === "not-started") return "not-submitted";
  if (status === "action-required") return "more-info-required";
  if (status === "submitted") return "pending-review";
  return status;
}

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
  /** Live discovery data is loaded from the API on the opportunities pages. */
  jobs: Job[];
  tasks: OnlineTask[];
}

export async function getJobSeekerOverview(): Promise<JobSeekerOverview> {
  await wait(350);
  const live = await apiRequest<{
    user: { email: string; firstName: string; lastName: string; accountType: "job-seeker"; emailVerified: boolean; verificationStatus: AccountSession["verificationStatus"]; createdAt: string };
    profile: JobSeekerDraft | null;
    recommendedJobs: Job[];
    tasks: OnlineTask[];
  }>("/dashboard/job-seeker");
  const session = createAccountSession(live.user);
  const draft = live.profile ?? readJobSeekerDraft(emptyJobSeekerDraft());
  if (live.profile) writeJobSeekerDraft(live.profile);
  const completion = getJobSeekerCompletion(session, draft);
  return {
    session,
    draft,
    completion,
    notifications: deriveNotifications(session, completion),
    applications: [],
    savedOpportunities: [],
    jobs: live.recommendedJobs,
    tasks: live.tasks,
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
  const [live, jobResult] = await Promise.all([
    apiRequest<{
      user: { email: string; firstName: string; lastName: string; accountType: "employer"; emailVerified: boolean; createdAt: string };
      company: (EmployerCompany & { logoUrl?: string; contactName?: string; contactEmail?: string; contactPhone?: string }) | null;
      verification: { status: AccountSession["verificationStatus"]; note: string; submittedAt: string | null };
      metrics: EmployerMetrics & { pendingJobs?: number };
    }>("/dashboard/employer"),
    apiRequest<{ items: (Job & { status: JobDraft["status"]; updatedAt: string })[] }>("/employer/jobs"),
  ]);
  const session = createAccountSession({ ...live.user, verificationStatus: live.verification.status, verificationSubmittedAt: live.verification.submittedAt });
  const initialDraft = emptyEmployerDraft();
  const company: EmployerCompany = {
    ...initialDraft.company,
    ...(live.company ?? {}),
    logoName: live.company?.logoUrl ?? "",
  };
  const draft: EmployerDraft = {
    ...initialDraft,
    account: { ...initialDraft.account, firstName: live.user.firstName, lastName: live.user.lastName, workEmail: live.user.email },
    company,
    recruitment: {
      ...initialDraft.recruitment,
      contactName: live.company?.contactName ?? "",
      contactEmail: live.company?.contactEmail ?? "",
      contactPhone: live.company?.contactPhone ?? "",
    },
    verification: { ...initialDraft.verification, status: employerVerificationStatus(live.verification.status), submittedAt: live.verification.submittedAt ?? "", notes: live.verification.note },
  };
  const drafts: JobDraft[] = jobResult.items.map((job) => ({
    id: job.id, title: job.title, category: job.category, description: job.description,
    responsibilities: "", qualifications: "", skills: [], location: job.location,
    arrangement: job.remote ? "remote" : "on-site", salaryRange: job.salaryRange ?? "",
    employmentType: job.employmentType, deadline: job.deadline ?? "", applicationMethod: "",
    contactName: "", contactEmail: "", contactPhone: "",
    status: job.status as JobDraft["status"], createdAt: job.postedAt, updatedAt: job.updatedAt ?? job.postedAt,
  }));
  const completion = getEmployerCompletion(session, draft, drafts.length);

  return {
    session,
    draft,
    company,
    recruitment: draft.recruitment,
    verification: draft.verification,
    completion,
    notifications: deriveNotifications(session, completion),
    drafts,
    metrics: {
      activeJobs: live.metrics.activeJobs,
      draftJobs: live.metrics.draftJobs,
      applicationsReceived: live.metrics.applicationsReceived,
      candidatesShortlisted: live.metrics.candidatesShortlisted,
    },
  };
}
