/**
 * ProgressBar — completion progress with an accessible role and value.
 * The percentage is also shown as text next to the bar wherever it is used,
 * so progress is never conveyed by colour alone.
 */
import { cx } from "@/lib/cx";

type ProgressBarProps = {
  /** 0–100 */
  value: number;
  /** Accessible name, e.g. "Profile completion". */
  label: string;
  className?: string;
};

export default function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      aria-valuetext={`${clamped}%`}
      className={cx("h-2 w-full overflow-hidden rounded-full bg-success-bg", className)}
    >
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
