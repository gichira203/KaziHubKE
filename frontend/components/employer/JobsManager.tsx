"use client";

/**
 * JobsManager — Manage Jobs content. Lists the employer's real drafts with
 * workflow statuses; a new employer sees the empty state. Nothing is shown
 * as published unless the backend confirms publication.
 */
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import RecentJobListings from "@/components/employer/RecentJobListings";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import type { JobDraft } from "@/lib/job-drafts";
import { getEmployerOverview } from "@/lib/dashboard-service";

type JobsManagerProps = {
  initialQuery: string;
};

export default function JobsManager({ initialQuery }: JobsManagerProps) {
  const [drafts, setDrafts] = useState<JobDraft[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((overview) => {
      if (active) setDrafts(overview.drafts);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "Could not load your listings.");
      setDrafts([]);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!drafts) return <PageLoading label="Loading your job listings…" />;

  const lower = initialQuery.trim().toLowerCase();
  const filtered = lower
    ? drafts.filter((draft) =>
        `${draft.title} ${draft.category} ${draft.location}`.toLowerCase().includes(lower),
      )
    : drafts;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">My job listings</h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted">
              Drafts you prepare here are private until they are verified and published. Publishing
              status only comes from the backend.
              {lower ? ` Filtered by "${initialQuery}".` : ""}
            </p>
          </div>
          <a
            href="/employer/dashboard/jobs/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-[13.5px] font-semibold text-white no-underline shadow-sm transition hover:bg-brand-dark"
          >
            <PlusCircle size={15} aria-hidden="true" />
            Post a Job
          </a>
          <a href="/employer/dashboard/tasks/new" className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand px-4 text-[13.5px] font-semibold text-brand no-underline">Create Online Task</a>
        </div>

        <div className="mt-4">
          <RecentJobListings drafts={filtered} />
        </div>
      </section>

      {error && <StatusMessage type="error"><strong>Live job listings could not be loaded.</strong><p>{error}</p></StatusMessage>}
    </div>
  );
}
