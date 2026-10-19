/**
 * DashboardStatCard — a single metric tile.
 *
 * Only shows values supported by real data. For a new account the values are
 * zero or an explicit note — never a fabricated count.
 */
import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
};

export default function DashboardStatCard({ icon: Icon, label, value, note }: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
          <Icon size={17} aria-hidden="true" />
        </span>
        <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      {note ? <p className="mt-1 text-[12px] leading-snug text-muted">{note}</p> : null}
    </div>
  );
}
