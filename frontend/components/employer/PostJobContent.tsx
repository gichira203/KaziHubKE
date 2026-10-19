"use client";

/**
 * PostJobContent — the interactive Post a Job page body. Receives the draft
 * id (?id=) from the server page and renders the listing wizard.
 */
import { useEffect, useState } from "react";
import JobPostingForm from "@/components/employer/JobPostingForm";
import PageLoading from "@/components/dashboard/PageLoading";
import { getOrCreateSession, type AccountSession } from "@/lib/session";
import { getJobDraft, type JobDraft } from "@/lib/job-drafts";

type PostJobContentProps = {
  draftId: string;
};

export default function PostJobContent({ draftId }: PostJobContentProps) {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [initial, setInitial] = useState<JobDraft | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setSession(getOrCreateSession("employer"));
      if (draftId) setInitial(getJobDraft(draftId));
    });
    return () => {
      active = false;
    };
  }, [draftId]);

  if (!session) return <PageLoading label="Loading the job form…" />;

  return <JobPostingForm session={session} initial={initial} />;
}
