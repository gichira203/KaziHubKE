"use client";

/**
 * Verification (job seeker) — the verification policy, explained.
 *
 * Identity verification is NOT required by default: this page documents what
 * it involves and when KaziHub KE would ask for it. No document upload is
 * requested here, and no fake verified badge is ever shown.
 */
import { useEffect, useState } from "react";
import { IdCard, Mail } from "lucide-react";
import VerificationStatusCard from "@/components/dashboard/VerificationStatusCard";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import { getJobSeekerVerification, type JobSeekerVerificationView } from "@/lib/verification-service";

export default function JobSeekerVerificationPage() {
  const [overview, setOverview] = useState<JobSeekerOverview | null>(null);
  const [policy, setPolicy] = useState<JobSeekerVerificationView | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getJobSeekerOverview();
      if (!active) return;
      setOverview(data);
      setPolicy(await getJobSeekerVerification(data.session));
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!overview || !policy) return <PageLoading label="Loading verification status…" />;

  return (
    <div className="flex flex-col gap-5">
      <VerificationStatusCard
        variant="seeker"
        status={policy.status}
        submittedAt={overview.session.verificationSubmittedAt || undefined}
      />

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <IdCard size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">
              What verification involves
            </h2>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              {policy.explanation}
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          <li className="rounded-lg border border-line bg-surface p-3.5 text-[13px] leading-relaxed text-charcoal">
            <strong className="font-bold">When it is required:</strong> some government roles,
            employer programmes and higher-value opportunities require verified identity. KaziHub KE
            asks at that point — through the official verification flow.
          </li>
          <li className="rounded-lg border border-line bg-surface p-3.5 text-[13px] leading-relaxed text-charcoal">
            <strong className="font-bold">What may be requested:</strong> a government-issued ID and
            a selfie check, reviewed by staff. Documents are stored encrypted and are never visible
            to employers.
          </li>
          <li className="rounded-lg border border-line bg-surface p-3.5 text-[13px] leading-relaxed text-charcoal">
            <strong className="font-bold">Your control:</strong> you choose when to verify. Nothing
            on your dashboard is blocked while verification is not started.
          </li>
        </ul>
      </section>

      <StatusMessage type="info">
        <strong>No verification service is connected yet.</strong>
        <p>
          The verification requirements above are the documented policy. Until the backend is
          connected there is nothing to submit, and no submission is simulated here.
        </p>
      </StatusMessage>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <Mail size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Your email</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Email verification is separate from identity verification. Verifying your email secures
              sign-in and enables job alerts and application updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
