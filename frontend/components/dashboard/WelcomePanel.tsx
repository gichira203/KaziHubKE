/**
 * WelcomePanel — the first-login greeting.
 *
 * Uses only data that actually exists: the typed first name (never an
 * invented one), the account type, and the profile completion percentage
 * calculated from saved data. Primary action is profile completion; the
 * secondary action lets a new user explore immediately.
 */
import Link from "next/link";
import { ArrowRight, Building2, Briefcase, CircleAlert, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";
import ProgressBar from "@/components/common/ProgressBar";
import { accountStatusLabels, profileStatusLabels } from "@/lib/account-types";
import type { AccountSession } from "@/lib/session";
import { accountStatus } from "@/lib/session";
import type { CompletionResult } from "@/lib/profile-service";

type WelcomePanelProps = {
  variant: "seeker" | "employer";
  session: AccountSession | null;
  completion: CompletionResult | null;
};

export default function WelcomePanel({ variant, session, completion }: WelcomePanelProps) {
  const firstName = session?.firstName?.trim();
  const status = session ? accountStatus(session) : "email-verification-pending";

  if (variant === "employer") {
    return (
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
        <div className="p-6 sm:p-7">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#CFF3DB]">
            Employer dashboard
          </p>
          <h2 className="mt-2 text-[22px] font-extrabold tracking-tight sm:text-[26px]">
            Welcome to KaziHub KE for Employers
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[#E4F6EA]">
            Set up your organization, complete verification, and prepare to connect with qualified
            candidates.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-white">
              {status === "active" ? (
                <ShieldCheck size={13} aria-hidden="true" />
              ) : (
                <CircleAlert size={13} aria-hidden="true" />
              )}
              {accountStatusLabels[status]}
            </span>
            {completion ? (
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-white">
                <Building2 size={13} aria-hidden="true" className="mr-1.5" />
                Company profile {completion.percent}% · {profileStatusLabels[completion.status]}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button href="/onboarding/employer" variant="onGreen">
              Complete Company Profile
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
            <Link
              href="/employer/dashboard/verification"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/40 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <ShieldCheck size={15} aria-hidden="true" />
              Start Verification
            </Link>
            <Link
              href="/employer/dashboard/jobs/new"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/40 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <Briefcase size={15} aria-hidden="true" />
              Post a Job
            </Link>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-[#CFEAD8]">
            Posting a job saves a draft now — publishing needs a verified organization and
            moderation. You will see the exact reason when publishing is unavailable.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
      <div className="p-6 sm:p-7">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#CFF3DB]">
          Job seeker dashboard
        </p>
        <h2 className="mt-2 text-[22px] font-extrabold tracking-tight sm:text-[26px]">
          {firstName ? `Welcome to KaziHub KE, ${firstName}!` : "Welcome to KaziHub KE!"}
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[#E4F6EA]">
          Your next opportunity starts here. Complete your profile to discover relevant jobs,
          internships, attachments, and online tasks.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-white">
            {status === "active" ? (
              <ShieldCheck size={13} aria-hidden="true" />
            ) : (
              <CircleAlert size={13} aria-hidden="true" />
            )}
            {accountStatusLabels[status]}
          </span>
          {completion ? (
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-white">
              Profile {completion.percent}% · {profileStatusLabels[completion.status]}
            </span>
          ) : null}
        </div>

        {completion ? (
          <div className="mt-4 max-w-sm">
            <ProgressBar value={completion.percent} label="Profile completion" className="bg-white/25" />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button href="/onboarding/job-seeker" variant="onGreen">
            Complete My Profile
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
          <Link
            href="/dashboard/opportunities"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/40 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Explore Opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}
