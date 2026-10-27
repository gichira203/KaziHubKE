"use client";

/**
 * My Profile — account overview + the saved-data status of every profile
 * section, with links into the profile wizard. Editing happens in onboarding;
 * this page only reflects what is actually saved.
 */
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import ProgressBar from "@/components/common/ProgressBar";
import PageLoading from "@/components/dashboard/PageLoading";
import {
  accountStatusLabels,
  accountStatusTones,
  profileStatusLabels,
} from "@/lib/account-types";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import { accountStatus, displayName } from "@/lib/session";

/** Sections shown here; email verification and identity verification have their own pages. */
const PROFILE_SECTION_IDS = new Set([
  "personal-info",
  "job-categories",
  "education",
  "skills",
  "experience",
  "cv",
  "preferences",
]);

export default function ProfilePage() {
  const [overview, setOverview] = useState<JobSeekerOverview | null>(null);

  useEffect(() => {
    let active = true;
    getJobSeekerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview) return <PageLoading label="Loading your profile…" />;

  const { session, completion, draft } = overview;
  const sections = completion.steps.filter((step) => PROFILE_SECTION_IDS.has(step.id));

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[16px] font-bold text-white">
              <User size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight text-ink">
                {displayName(session) || "Your profile"}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {draft.personal.headline || "No headline yet — add one in your profile."}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {session.email || "No email is associated with this account"} ·{" "}
                {[draft.personal.county, draft.personal.town].filter(Boolean).join(", ") ||
                  "No location set"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge
              label={accountStatusLabels[accountStatus(session)]}
              tone={accountStatusTones[accountStatus(session)]}
            />
            <StatusBadge label={`Profile ${profileStatusLabels[completion.status].toLowerCase()}`} tone={completion.percent === 100 ? "success" : "warning"} />
          </div>
        </div>

        <div className="mt-4 max-w-md">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-[12.5px] font-semibold text-ink">Profile completion</p>
            <p className="text-[12.5px] font-bold text-brand-dark">{completion.percent}%</p>
          </div>
          <ProgressBar value={completion.percent} label="Profile completion" />
        </div>

        <div className="mt-4">
          <Button href="/onboarding/job-seeker">
            {completion.percent === 100 ? "Review my profile" : "Continue my profile"}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Profile sections</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Status is calculated from information you have actually saved — opening a section does not
          count as complete.
        </p>

        <ul className="mt-4 flex flex-col gap-2">
          {sections.map((section) => (
            <li
              key={section.id}
              className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3.5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-ink">{section.label}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{section.why}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <StatusBadge
                  label={section.state === "done" ? "Complete" : "Incomplete"}
                  tone={section.state === "done" ? "success" : "warning"}
                />
                <Link
                  href={section.actionHref}
                  className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
                >
                  {section.state === "done" ? "Edit" : section.actionLabel}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11.5px] leading-snug text-muted">
          Editing opens the profile wizard. Saving updates your account profile in the platform database.
        </p>
      </section>
    </div>
  );
}
