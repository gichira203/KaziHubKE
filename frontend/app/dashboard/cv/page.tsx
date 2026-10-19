"use client";

/**
 * My CV — upload, build or edit. File types and sizes are validated in the
 * browser; only METADATA is remembered (contents never touch storage) so the
 * profile checklist reflects a genuinely uploaded CV.
 */
import { useEffect, useState } from "react";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import CareerProfileCard from "@/components/job-seeker/CareerProfileCard";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { readJobSeekerDraft, writeJobSeekerDraft } from "@/lib/draft-storage";
import { emptyJobSeekerDraft } from "@/lib/onboarding-types";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

export default function CvPage() {
  const [overview, setOverview] = useState<JobSeekerOverview | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getJobSeekerOverview().then((data) => {
      if (active) setOverview(data);
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (!overview) return <PageLoading label="Loading your CV…" />;

  /** Persist upload METADATA to the session draft — never file contents. */
  const handleUpload = (file: { fileName: string; fileSize: number } | null) => {
    const draft = readJobSeekerDraft(emptyJobSeekerDraft());
    draft.cv.upload = file
      ? {
          fileName: file.fileName,
          fileSize: file.fileSize,
          uploadedAt: new Date().toISOString(),
          parsedSummary: "",
          reviewed: false,
        }
      : null;
    writeJobSeekerDraft(draft);
    setReloadKey((key) => key + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <CareerProfileCard
        cv={overview.draft.cv}
        variant="full"
        onUploadChange={handleUpload}
      />

      <StatusMessage type="info">
        <strong>CVs stay on this device in the preview.</strong>
        <p>
          The upload service, parsing and secure storage are backend features. Until then your file
          is validated in the browser and its metadata is remembered for this session — contents are
          never stored. {dashboardDisclaimers.session}
        </p>
      </StatusMessage>
    </div>
  );
}
