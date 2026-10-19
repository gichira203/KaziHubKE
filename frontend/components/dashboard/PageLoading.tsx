/**
 * PageLoading — the loading state every dashboard section shows while its
 * data is fetched. Services simulate latency on purpose so these states are
 * real, not decorative.
 */
import { Loader2 } from "lucide-react";

export default function PageLoading({ label = "Loading your dashboard…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-line bg-white px-6 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={24} className="animate-spin text-brand" aria-hidden="true" />
      <p className="mt-3 text-[13px] text-muted">{label}</p>
    </div>
  );
}
