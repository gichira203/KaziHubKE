"use client";

/**
 * Recruitment Activity — an honest empty state for a new employer. Real
 * activity (views, applications, shortlists) arrives from the backend.
 */
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageLoading from "@/components/dashboard/PageLoading";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";

export default function ActivityPage() {
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

  if (!overview) return <PageLoading label="Loading recruitment activity…" />;

  return (
    <div className="flex flex-col gap-5">
      <EmptyState
        icon={ClipboardList}
        title="No recruitment activity yet."
        description="Listing views, applications, shortlist activity and interview progress appear here once your verified listings start receiving candidates."
      />
      <p className="text-[11.5px] leading-snug text-muted">
        Activity metrics come from the backend — no sample numbers are shown for a new account.
      </p>
    </div>
  );
}
