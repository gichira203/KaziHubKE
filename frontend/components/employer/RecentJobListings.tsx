/**
 * RecentJobListings — "My job listings" / Manage Jobs content.
 *
 * A new employer has none: the empty state says so and points at Post a Job.
 * Statuses come from real workflow data only (draft / pending-review here) —
 * a listing is NEVER shown as published unless the backend confirms it.
 */
import Link from "next/link";
import { Briefcase, Pencil } from "lucide-react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import { jobListingStatusLabels, jobListingStatusTones } from "@/lib/account-types";
import type { JobDraft } from "@/lib/job-drafts";

type RecentJobListingsProps = {
  drafts: JobDraft[];
};

export default function RecentJobListings({ drafts }: RecentJobListingsProps) {
  if (drafts.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="You haven't created any job listings yet."
        description="Prepare a draft listing now — you can edit it any time. Publishing requires a verified organization and platform moderation."
        action={<Button href="/employer/dashboard/jobs/new">Post a Job</Button>}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {drafts.map((draft) => (
        <li
          key={draft.id}
          className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3.5 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink">{draft.title || "Untitled draft"}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {[draft.location, draft.employmentType].filter(Boolean).join(" · ") || "No details yet"} ·
              created {new Date(draft.createdAt).toLocaleDateString("en-KE")}
            </p>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <StatusBadge
              label={jobListingStatusLabels[draft.status]}
              tone={jobListingStatusTones[draft.status]}
            />
            <Link
              href={`/employer/dashboard/jobs/new?id=${draft.id}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
            >
              <Pencil size={13} aria-hidden="true" />
              Edit Draft
            </Link>
            <Link
              href="/employer/dashboard/applications"
              className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-ink transition hover:border-brand hover:text-brand-dark"
            >
              Manage Applications
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
