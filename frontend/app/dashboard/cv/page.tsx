"use client";

/**
 * My CV — upload, build or edit. File types and sizes are validated in the
 * browser. The API saves metadata and extracted profile fields.
 */
import { useEffect, useState } from "react";
import { getJobSeekerOverview, type JobSeekerOverview } from "@/lib/dashboard-service";
import CareerProfileCard from "@/components/job-seeker/CareerProfileCard";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import { writeJobSeekerDraft } from "@/lib/draft-storage";
import { apiRequest } from "@/lib/api";
import { autofillFromCv, mergeCvAutofill, uploadCvFile } from "@/lib/cv-service";

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

  /** Save CV metadata and its private storage key to the database profile. */
  const handleUpload = async (file: { fileName: string; fileSize: number; storageKey?: string } | null) => {
    const draft = { ...overview.draft, cv: { ...overview.draft.cv } };
    draft.cv.method = "upload";
    draft.cv.upload = file
      ? {
          fileName: file.fileName,
          fileSize: file.fileSize,
          ...(file.storageKey ? { storageKey: file.storageKey } : {}),
          uploadedAt: new Date().toISOString(),
          parsedSummary: "",
          reviewed: false,
        }
      : null;
    await apiRequest("/profile/job-seeker", { method: "PUT", body: JSON.stringify(draft) });
    writeJobSeekerDraft(draft);
    setReloadKey((key) => key + 1);
  };

  const handleAutofill = async () => {
    const key = overview.draft.cv.upload?.storageKey;
    if (!key) throw new Error("Upload your CV to private storage first.");
    const { profile, aiAvailable } = await autofillFromCv(key);
    const draft = mergeCvAutofill(overview.draft, profile);
    await apiRequest("/profile/job-seeker", { method: "PUT", body: JSON.stringify(draft) });
    writeJobSeekerDraft(draft);
    setReloadKey((current) => current + 1);
    return aiAvailable;
  };

  return (
    <div className="flex flex-col gap-5">
      <CareerProfileCard
        cv={overview.draft.cv}
        variant="full"
        onUploadChange={handleUpload}
        onUploadFile={uploadCvFile}
        onAutofill={handleAutofill}
      />

      <StatusMessage type="info">
        <strong>Your CV and profile are saved to your account.</strong>
        <p>CV files are kept in private storage. Autofill reads the CV on the API and saves extracted details to your profile while preserving fields you already filled. Review the result after extraction.</p>
      </StatusMessage>
    </div>
  );
}
