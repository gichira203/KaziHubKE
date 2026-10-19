/**
 * Manage Jobs — server page reading the ?q= search filter from searchParams
 * and handing it to the client manager.
 */
import JobsManager from "@/components/employer/JobsManager";

export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ManageJobsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  return <JobsManager initialQuery={query} />;
}
