/**
 * Find Opportunities — server page reading the ?cat= / ?q= filters from
 * searchParams (the Next 16 way — awaiting searchParams keeps this route out
 * of the client-only Suspense path) and handing them to the client explorer.
 */
import OpportunitiesExplorer from "@/components/job-seeker/OpportunitiesExplorer";

export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OpportunitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const single = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] ?? "" : value ?? "";

  return (
    <OpportunitiesExplorer
      initialCategory={single(params.cat) || "all"}
      initialQuery={single(params.q)}
    />
  );
}
