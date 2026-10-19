"use client";

/**
 * Candidates — search + saved candidates. Locked until the organization is
 * verified; results only ever come from the backend and respect candidate
 * consent and visibility settings.
 */
import { useEffect, useState } from "react";
import CandidateSearch from "@/components/employer/CandidateSearch";
import PageLoading from "@/components/dashboard/PageLoading";
import { getOrCreateSession } from "@/lib/session";
import { canSearchCandidates, type PermissionResult } from "@/lib/permissions";
import type { AccountSession } from "@/lib/session";

export default function CandidatesPage() {
  const [permission, setPermission] = useState<PermissionResult | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      const session: AccountSession = getOrCreateSession("employer");
      setPermission(canSearchCandidates(session));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (!permission) return <PageLoading label="Loading candidate search…" />;

  return (
    <div className="flex flex-col gap-5">
      <CandidateSearch permission={permission} />
    </div>
  );
}
