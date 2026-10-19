/**
 * StatusBadge — the single way statuses are shown across both dashboards.
 *
 * Status is NEVER communicated by colour alone: every badge carries a text
 * label and an icon, so it stays readable in greyscale and for screen
 * readers.
 */
import { CheckCircle2, Circle, Clock, Info, XCircle, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";
import type { StatusTone } from "@/lib/account-types";

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-line bg-surface text-muted",
  info: "border-[#C7DBFD] bg-info-bg text-info",
  warning: "border-[#F0D98C] bg-warning-bg text-warning",
  success: "border-[#C8E6D2] bg-success-bg text-success",
  error: "border-[#F5C2C2] bg-danger-bg text-error",
};

const toneIcons: Record<StatusTone, LucideIcon> = {
  neutral: Circle,
  info: Info,
  warning: Clock,
  success: CheckCircle2,
  error: XCircle,
};

export default function StatusBadge({ label, tone, className = "" }: StatusBadgeProps) {
  const Icon = toneIcons[tone];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em]",
        toneClasses[tone],
        className,
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </span>
  );
}
