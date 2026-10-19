/**
 * ProfileCompletionCard — the checklist that drives a new account's next
 * actions.
 *
 * Completion is calculated from ACTUALLY SAVED data (see profile-service):
 * opening a section never marks it done. Every step shows its status, why it
 * matters and an action button. Optional steps can be skipped and returned
 * to later.
 */
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, ListChecks, Minus } from "lucide-react";
import ProgressBar from "@/components/common/ProgressBar";
import { profileStatusLabels } from "@/lib/account-types";
import type { CompletionResult } from "@/lib/profile-service";

type ProfileCompletionCardProps = {
  completion: CompletionResult;
  title: string;
  description: string;
};

const stateStyles = {
  done: {
    icon: CheckCircle2,
    iconClass: "text-success",
    rowClass: "bg-success-bg/60",
    label: "Done",
  },
  todo: {
    icon: Circle,
    iconClass: "text-muted-soft",
    rowClass: "bg-white",
    label: "To do",
  },
  "not-required": {
    icon: Minus,
    iconClass: "text-muted-soft",
    rowClass: "bg-surface",
    label: "Not required yet",
  },
} as const;

export default function ProfileCompletionCard({
  completion,
  title,
  description,
}: ProfileCompletionCardProps) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <ListChecks size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-success-bg px-3 py-1 text-[13px] font-bold text-success">
          {completion.percent}% · {profileStatusLabels[completion.status]}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar value={completion.percent} label={`${title} progress`} />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {completion.steps.map((step) => {
          const style = stateStyles[step.state];
          const StateIcon = style.icon;
          return (
            <li
              key={step.id}
              className={`flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center ${style.rowClass}`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <StateIcon
                  size={17}
                  aria-hidden="true"
                  className={`mt-0.5 flex-shrink-0 ${style.iconClass}`}
                />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold leading-snug text-ink">
                    {step.label}
                    {step.optional ? (
                      <span className="ml-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-soft">
                        optional
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{step.why}</p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3 sm:ml-3">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-muted">
                  {style.label}
                </span>
                <Link
                  href={step.actionHref}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
                >
                  {step.actionLabel}
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11.5px] leading-snug text-muted">
        Progress is calculated from information you have actually saved — opening a step does not
        count as complete. You can skip optional sections and come back at any time.
      </p>
    </section>
  );
}
