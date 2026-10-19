/**
 * EmployerMetrics — overview cards for a NEW employer account.
 *
 * Every value is zero or an explicit empty state. No fabricated application
 * counts, candidate numbers or success statistics. Company setup and
 * verification come before analytics when there is no activity.
 */
import Link from "next/link";
import { Briefcase, FileText, ShieldCheck, Users } from "lucide-react";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import StatusBadge from "@/components/common/StatusBadge";
import {
  verificationStatusLabels,
  verificationStatusTones,
  type VerificationStatus,
} from "@/lib/account-types";
import type { EmployerMetrics as Metrics } from "@/lib/dashboard-service";

type EmployerMetricsProps = {
  metrics: Metrics;
  verificationStatus: VerificationStatus;
};

export default function EmployerMetrics({ metrics, verificationStatus }: EmployerMetricsProps) {
  return (
    <section aria-labelledby="employer-metrics-title">
      <h2 id="employer-metrics-title" className="sr-only">
        Recruitment metrics
      </h2>
      <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStatCard
          icon={Briefcase}
          label="Active Jobs"
          value="0"
          note="Listings publish after verification and moderation."
        />
        <DashboardStatCard
          icon={FileText}
          label="Draft Jobs"
          value={String(metrics.draftJobs)}
          note={metrics.draftJobs === 0 ? "No drafts yet — prepare one any time." : "Saved in this session."}
        />
        <DashboardStatCard
          icon={Users}
          label="Applications Received"
          value="0"
          note="Applications appear after an eligible listing receives them."
        />
        <DashboardStatCard
          icon={ShieldCheck}
          label="Candidates Shortlisted"
          value="0"
          note="Shortlisting unlocks with candidate access."
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
        <StatusBadge
          label={`Verification: ${verificationStatusLabels[verificationStatus]}`}
          tone={verificationStatusTones[verificationStatus]}
        />
        <p className="text-[12.5px] text-muted">
          {verificationStatus === "verified"
            ? "Your organization is verified."
            : verificationStatus === "pending-review"
              ? "Awaiting review — publishing stays locked until confirmed."
              : "Start verification to publish listings and search candidates."}
        </p>
        {verificationStatus === "not-started" ? (
          <Link
            href="/employer/dashboard/verification"
            className="ml-auto text-[13px] font-bold text-brand-dark hover:underline"
          >
            Start verification →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
