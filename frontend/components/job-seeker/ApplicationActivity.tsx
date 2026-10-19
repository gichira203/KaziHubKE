/**
 * ApplicationActivity — "My Applications".
 *
 * A newly registered account has applied for nothing, so this shows the
 * honest empty state with the next action. Real statuses (Submitted, Under
 * Review, Shortlisted, Interview, Closed) only ever appear with real
 * application data from the backend.
 */
import { ClipboardList } from "lucide-react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import { applicationStatusLegend } from "@/data/mock-dashboard";

export default function ApplicationActivity() {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
          <ClipboardList size={17} aria-hidden="true" />
        </span>
        <h2 className="text-[15px] font-bold tracking-tight text-ink">My Applications</h2>
      </div>

      <EmptyState
        icon={ClipboardList}
        title="You haven't applied for any opportunities yet."
        description="Once you apply, every application appears here with its live status. You can browse and apply before completing every optional profile field."
        action={
          <Button href="/dashboard/opportunities">
            Find Opportunities
          </Button>
        }
      />

      <details className="mt-3">
        <summary className="cursor-pointer text-[12px] font-semibold text-muted">
          What application statuses mean
        </summary>
        <ul className="mt-2 flex flex-col gap-1">
          {applicationStatusLegend.map((entry) => (
            <li key={entry.status} className="text-[12px] leading-relaxed text-muted">
              <strong className="font-semibold text-ink">{entry.status.replace("-", " ")}:</strong>{" "}
              {entry.description}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
