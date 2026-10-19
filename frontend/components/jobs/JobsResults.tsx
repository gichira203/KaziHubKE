import PublicJobsBrowser from "./PublicJobsBrowser";
import { listJobs, isJobFilterId } from "@/lib/jobs-service";

/**
 * JobsResults — the searchParams-reading part of the public jobs page,
 * isolated so the page shell (and its SEO markup) can prerender while
 * the filterable results stream in.
 */
export default async function JobsResults({
  searchParams,
}: {
  searchParams: PageProps<"/jobs">["searchParams"];
}) {
  const params = await searchParams;
  // Search params can arrive as string[] (e.g. ?q=a&q=b) — take the first.
  const first = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  const query = first(params.q) ?? "";
  const categoryParam = first(params.category);
  const category = isJobFilterId(categoryParam) ? categoryParam : "all";
  const sortParam = first(params.sort);
  const sort = sortParam === "deadline" || sortParam === "title" ? sortParam : "newest";
  const employmentType = first(params.type);
  const pageParam = Number(first(params.page));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await listJobs({ query, category, sort, employmentType, page });

  return (
    <PublicJobsBrowser
      // Remount on filter change so the form state always matches the URL.
      key={`${query}|${category}|${sort}|${employmentType ?? ""}|${result.page}`}
      jobs={result.items}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      query={query}
      category={category}
    />
  );
}
