"use client";

/**
 * Applications (employer) — empty by design for a new employer. Explains
 * when applications appear and how candidate privacy is protected.
 */
import { useEffect, useState } from "react";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";
import RecentApplications from "@/components/employer/RecentApplications";
import PageLoading from "@/components/dashboard/PageLoading";

export default function EmployerApplicationsPage() {
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

  if (!overview) return <PageLoading label="Loading applications…" />;

  return (
    <div className="flex flex-col gap-5">
      <RecentApplications />
      <p className="text-[11.5px] leading-snug text-muted">
        Applications appear after an eligible job listing receives them — and only for employers
        authorized to see them. Applicant names, CVs and contact details are never fabricated or
        shown without consent.
      </p>
    </div>
  );
}
