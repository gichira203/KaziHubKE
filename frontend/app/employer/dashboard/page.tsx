"use client";

/**
 * Employer dashboard — the FIRST-LOGIN experience for a new employer.
 *
 * Company setup and verification come first; metrics show honest zeros. Job
 * drafts are always allowed; publishing restrictions are explained with the
 * real reason rather than a fake "live" state.
 */
import { useEffect, useState } from "react";
import WelcomePanel from "@/components/dashboard/WelcomePanel";
import EmployerSetupChecklist from "@/components/employer/EmployerSetupChecklist";
import VerificationStatusCard from "@/components/dashboard/VerificationStatusCard";
import EmployerMetrics from "@/components/employer/EmployerMetrics";
import CompanyProfileCard from "@/components/employer/CompanyProfileCard";
import RecentJobListings from "@/components/employer/RecentJobListings";
import RecentApplications from "@/components/employer/RecentApplications";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";
import { canPublishJob } from "@/lib/permissions";

export default function EmployerDashboardPage() {
  const [overview, setOverview] = useState<EmployerOverview | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((data) => {
      if (active) setOverview(data);
    }).catch((reason: unknown) => {
      if (active) setLoadError(reason instanceof Error ? reason.message : "Could not load your employer account.");
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview && loadError) return <StatusMessage type="error"><strong>Your live employer dashboard could not be loaded.</strong><p>{loadError}</p></StatusMessage>;
  if (!overview) {
    return (
      <div className="flex flex-col gap-4">
        <PageLoading />
      </div>
    );
  }

  const { session, company, completion, drafts, metrics } = overview;
  const publish = canPublishJob(session);

  return (
    <div className="flex flex-col gap-5">
      <WelcomePanel variant="employer" session={session} completion={completion} />



      <StatusMessage type={publish.allowed ? "info" : "warning"}>
        <strong>{publish.allowed ? "Job listings are reviewed before publication." : "Job publishing is locked."}</strong>
        <p>
          {publish.allowed
            ? "Approved organizations can submit vacancies for platform moderation. Candidates see them after approval and publication."
            : `${publish.reason} You can prepare company details and drafts while this is resolved.`}
        </p>
      </StatusMessage>

      <EmployerSetupChecklist completion={completion} />

      <VerificationStatusCard
        variant="employer"
        status={session.verificationStatus}
        submittedAt={session.verificationSubmittedAt || undefined}
      />

      <EmployerMetrics metrics={metrics} verificationStatus={session.verificationStatus} />

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">My job listings</h2>
        <div className="mt-3">
          <RecentJobListings drafts={drafts} />
        </div>
      </section>

      <CompanyProfileCard
        company={company}
        verificationStatus={session.verificationStatus}
        editHref="/onboarding/employer"
      />

      <RecentApplications />
    </div>
  );
}
