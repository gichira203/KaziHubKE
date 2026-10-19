"use client";

/**
 * Company Profile — read-only preview of the saved company profile plus the
 * recruitment contact, with the edit action pointing at the employer
 * onboarding wizard where details are actually entered and saved.
 */
import { useEffect, useState } from "react";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import CompanyProfileCard from "@/components/employer/CompanyProfileCard";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";

export default function CompanyProfilePage() {
  const [overview, setOverview] = useState<EmployerOverview | null>(null);

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview) return <PageLoading label="Loading your company profile…" />;

  const { company, recruitment, session } = overview;

  return (
    <div className="flex flex-col gap-5">
      <CompanyProfileCard
        company={company}
        verificationStatus={session.verificationStatus}
        editHref="/onboarding/employer"
      />

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <UserRound size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Recruitment contact</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              The named contact candidates and the KaziHub KE team reach about your vacancies.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <UserRound size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Name
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {recruitment.contactName || "Not added yet"}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <Mail size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Email
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {recruitment.contactEmail || "Not added yet"}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <Phone size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Phone
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {recruitment.contactPhone || "Not added yet"}
              </span>
            </span>
          </li>
        </ul>

        <div className="mt-4">
          <a
            href="/onboarding/employer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
          >
            <Building2 size={14} aria-hidden="true" />
            Edit in the company profile wizard
          </a>
        </div>
      </section>

      <StatusMessage type="info">
        <strong>Editing happens in the profile wizard.</strong>
        <p>
          Company details are entered and saved through onboarding. In this preview drafts persist in
          your browser session only.
        </p>
      </StatusMessage>
    </div>
  );
}
