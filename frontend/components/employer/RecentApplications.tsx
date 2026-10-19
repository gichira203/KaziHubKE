/**
 * RecentApplications — the employer applications section.
 *
 * New employer, no applications: an honest explanation of when applications
 * appear, not fabricated applicants. Candidate CVs and contact details are
 * only ever shown to authorized, verified employers — the privacy note says
 * so.
 */
import Link from "next/link";
import { Users } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

export default function RecentApplications() {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
          <Users size={17} aria-hidden="true" />
        </span>
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Applications</h2>
      </div>

      <EmptyState
        icon={Users}
        title="No applications yet."
        description="Applications appear here after an eligible, published job listing receives them. Your drafts are private until they are verified and published."
      />

      <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-snug text-muted">
        Candidate CVs and contact details are only visible to authorized employers, and only for
        candidates whose visibility settings allow it.{" "}
        <Link href="/employer/dashboard/jobs" className="font-semibold text-brand-dark hover:underline">
          Manage your listings →
        </Link>
      </p>
    </section>
  );
}
