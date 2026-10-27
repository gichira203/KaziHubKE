"use client";

/**
 * PostJobContent — the interactive Post a Job page body. Receives the draft
 * id (?id=) from the server page and renders the listing wizard.
 */
import { useEffect, useState } from "react";
import JobPostingForm from "@/components/employer/JobPostingForm";
import PageLoading from "@/components/dashboard/PageLoading";
import type { AccountSession } from "@/lib/session";
import type { JobDraft } from "@/lib/job-drafts";
import { getEmployerOverview } from "@/lib/dashboard-service";

type PostJobContentProps = {
  draftId: string;
};

export default function PostJobContent({ draftId }: PostJobContentProps) {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [initial, setInitial] = useState<JobDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((overview) => {
      if (!active) return;
      setSession(overview.session);
      if (draftId) setInitial(overview.drafts.find((job) => job.id === draftId) ?? null);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load your employer account.");
    });
    return () => {
      active = false;
    };
  }, [draftId]);

  if (!session && error) return <p role="alert" className="rounded-lg bg-danger-bg p-4 text-sm text-error">{error}</p>;
  if (!session) return <PageLoading label="Loading your employer account..." />;

  return <JobPostingForm session={session} initial={initial} />;
}
