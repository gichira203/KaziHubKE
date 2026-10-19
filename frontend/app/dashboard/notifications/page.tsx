"use client";

/**
 * Notifications — generated from real account state (email verification,
 * profile completion, CV, verification). No fabricated server messages.
 */
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import EmptyState from "@/components/dashboard/EmptyState";
import PageLoading from "@/components/dashboard/PageLoading";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

export default function NotificationsPage() {
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

  if (!overview) return <PageLoading label="Loading notifications…" />;

  const { notifications, draft } = overview;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Notifications</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Reminders derived from your account state: email verification, profile completion,
          opportunities, application updates, CV and verification. {dashboardDisclaimers.notifications}
        </p>

        <div className="mt-4">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nothing needs your attention."
              description="When something does — a verification step, a profile reminder or an application update — it appears here and in the bell menu."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    className="block rounded-lg border border-line bg-surface p-3.5 transition hover:border-brand hover:bg-white"
                  >
                    <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                      {notification.unread ? (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-label="Unread" />
                      ) : null}
                      {notification.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      {notification.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Job alert preferences</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Job alerts
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">
              {draft.notifications.jobAlertEmails ? "On" : "Off — not set yet"}
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Frequency
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">
              {draft.notifications.frequency}
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Preferred categories
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">
              {draft.notifications.preferredCategories.length > 0
                ? draft.notifications.preferredCategories.join(", ")
                : "None selected yet"}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <Link
            href="/onboarding/job-seeker"
            className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
          >
            Configure job alerts
          </Link>
        </div>
      </section>
    </div>
  );
}
