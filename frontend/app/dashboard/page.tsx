"use client";

/**
 * Job seeker dashboard — the FIRST-LOGIN experience.
 *
 * Designed for a newly registered account: welcome, profile checklist,
 * independent verification status, and full opportunity discovery that works
 * BEFORE the profile is complete. Applications, CV status and saved items
 * show honest empty/zero states — nothing is fabricated.
 */
import { useEffect, useState } from "react";
import { Bookmark, Briefcase, FileText, Percent } from "lucide-react";
import WelcomePanel from "@/components/dashboard/WelcomePanel";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import VerificationStatusCard from "@/components/dashboard/VerificationStatusCard";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import OpportunityCategories from "@/components/job-seeker/OpportunityCategories";
import RecommendedJobs from "@/components/job-seeker/RecommendedJobs";
import ApplicationActivity from "@/components/job-seeker/ApplicationActivity";
import CareerProfileCard from "@/components/job-seeker/CareerProfileCard";
import OnlineTasksPanel from "@/components/job-seeker/OnlineTasksPanel";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

export default function DashboardPage() {
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

  if (!overview) {
    return (
      <div className="flex flex-col gap-4">
        <PageLoading />
      </div>
    );
  }

  const { session, completion, draft, sampleJobs, sampleTasks } = overview;
  const cvReady = Boolean(draft.cv.upload) || draft.cv.professionalSummary.trim().length > 0;

  return (
    <div className="flex flex-col gap-5">
      <WelcomePanel variant="seeker" session={session} completion={completion} />

      <StatusMessage type="info">
        <strong>No backend connected — local demo session.</strong>
        <p>{dashboardDisclaimers.session}</p>
      </StatusMessage>

      <ProfileCompletionCard
        completion={completion}
        title="Complete Your Profile"
        description="Complete these steps to help us recommend suitable opportunities and prepare your applications."
      />

      <VerificationStatusCard
        variant="seeker"
        status={session.verificationStatus}
        submittedAt={session.verificationSubmittedAt || undefined}
      />

      <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardStatCard
          icon={Percent}
          label="Profile completion"
          value={`${completion.percent}%`}
          note={`${completion.doneCount} of ${completion.requiredCount} steps saved.`}
        />
        <DashboardStatCard
          icon={Briefcase}
          label="Applications"
          value="0"
          note="You haven't applied yet."
        />
        <DashboardStatCard
          icon={FileText}
          label="CV status"
          value={cvReady ? "Ready" : "Not created"}
          note={cvReady ? "You can apply with it." : "Upload or build one."}
        />
        <DashboardStatCard
          icon={Bookmark}
          label="Saved opportunities"
          value="0"
          note="Save listings while browsing."
        />
      </div>

      <OpportunityCategories />

      <RecommendedJobs jobs={sampleJobs} />

      <ApplicationActivity />

      <CareerProfileCard cv={draft.cv} variant="overview" />

      <OnlineTasksPanel tasks={sampleTasks} variant="overview" />
    </div>
  );
}
