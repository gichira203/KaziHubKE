"use client";

/**
 * My Applications — for a newly registered account this is the honest empty
 * state: nothing has been applied for yet, with the status legend explained
 * so the user knows what to expect.
 */
import { useEffect, useState } from "react";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import ApplicationActivity from "@/components/job-seeker/ApplicationActivity";
import PageLoading from "@/components/dashboard/PageLoading";

export default function ApplicationsPage() {
  const [overview, setOverview] = useState<JobSeekerOverview | null>(null);

  useEffect(() => {
    let active = true;
    getJobSeekerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!overview) return <PageLoading label="Loading your applications…" />;

  return (
    <div className="flex flex-col gap-5">
      <ApplicationActivity />
      <p className="text-[11.5px] leading-snug text-muted">
        Applications shown here would come from the backend with real statuses — Submitted, Under
        Review, Shortlisted, Interview or Closed. None are simulated.
      </p>
    </div>
  );
}
