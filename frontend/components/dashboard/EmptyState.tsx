/**
 * EmptyState — the honest placeholder every empty dashboard section uses.
 * Never fake data: the icon, title and description explain what is missing
 * and the action points at what to do next.
 */
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center ${className}`}
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-line">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="text-[15px] font-bold tracking-tight text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
