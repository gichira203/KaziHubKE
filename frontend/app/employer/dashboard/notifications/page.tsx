"use client";

/**
 * Notifications (employer) — generated from real account state:
 * email verification, company setup and verification reminders.
 */
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";
import EmptyState from "@/components/dashboard/EmptyState";
import PageLoading from "@/components/dashboard/PageLoading";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

export default function EmployerNotificationsPage() {
  const [overview, setOverview] = useState<EmployerOverview | null>(null);

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview) return <PageLoading label="Loading notifications…" />;

  const { notifications } = overview;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Notifications</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Reminders derived from your account state: email verification, company setup, verification
          and application updates. {dashboardDisclaimers.notifications}
        </p>

        <div className="mt-4">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nothing needs your attention."
              description="Verification updates, application alerts and listing reminders appear here when they apply to your account."
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

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Alert preferences</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Application and candidate alert preferences become available when your account can receive
          them — after verification and your first published listing.
        </p>
      </section>
    </div>
  );
}
