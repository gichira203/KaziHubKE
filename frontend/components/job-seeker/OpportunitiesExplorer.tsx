"use client";

/**
 * OpportunitiesExplorer — the interactive discovery UI for Find Opportunities.
 *
 * Receives the initial category/query from the server page (searchParams) and
 * drives filtering + URL updates itself with the router. Works fully before
 * profile completion; listings are clearly-labelled sample data.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import JobCard from "@/components/common/JobCard";
import EmptyState from "@/components/dashboard/EmptyState";
import PageLoading from "@/components/dashboard/PageLoading";
import SearchInput from "@/components/common/SearchInput";
import { cx } from "@/lib/cx";
import type { Job } from "@/data/jobs";
import { jobs } from "@/data/jobs";
import { dashboardDisclaimers } from "@/data/mock-dashboard";

const CATEGORIES = [
  { id: "all", label: "All Opportunities" },
  { id: "online", label: "Online Jobs" },
  { id: "government", label: "Government" },
  { id: "internship", label: "Internships" },
  { id: "attachment", label: "Attachments" },
  { id: "private", label: "Private Sector" },
  { id: "remote", label: "Remote" },
  { id: "freelance", label: "Freelance" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

function matchesCategory(job: Job, category: CategoryId): boolean {
  switch (category) {
    case "all":
      return true;
    case "remote":
      return job.remote;
    case "freelance":
      return job.remote && /part-time|contract|freelance/i.test(job.employmentType);
    default:
      return job.category === category;
  }
}

type OpportunitiesExplorerProps = {
  initialCategory: string;
  initialQuery: string;
};

export default function OpportunitiesExplorer({
  initialCategory,
  initialQuery,
}: OpportunitiesExplorerProps) {
  const router = useRouter();
  const category = (CATEGORIES.find((entry) => entry.id === initialCategory)?.id ?? "all") as CategoryId;
  const query = initialQuery;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Job[]>([]);

  // Simulated fetch keyed on the filters — real loading states, not decoration.
  // `loading` starts true (first load); filter changes swap results after the
  // delay, so the grid briefly shows the previous set rather than flashing.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const lower = query.trim().toLowerCase();
      setResults(
        jobs.filter(
          (job) =>
            matchesCategory(job, category) &&
            (!lower ||
              job.title.toLowerCase().includes(lower) ||
              job.employer.toLowerCase().includes(lower) ||
              job.description.toLowerCase().includes(lower)),
        ),
      );
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [category, query]);

  const activeCategory = CATEGORIES.find((entry) => entry.id === category) ?? CATEGORIES[0];

  const navigate = (nextCategory: string, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("cat", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    const suffix = params.toString();
    router.push(`/dashboard/opportunities${suffix ? `?${suffix}` : ""}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-[16px] font-bold tracking-tight text-ink">Explore Opportunities</h2>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted">
          Browse every category before completing your profile. {dashboardDisclaimers.opportunities}
        </p>

        <div className="mt-3 max-w-md">
          <SearchInput
            placeholder="Search opportunities…"
            ariaLabel="Search opportunities"
            initialValue={query}
            onSubmit={(value) => navigate(category, value)}
          />
        </div>

        <ul className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((entry) => {
            const active = entry.id === category;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => navigate(entry.id, query)}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "inline-flex h-8 items-center rounded-full border px-3.5 text-[12.5px] font-semibold transition",
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-ink hover:border-brand hover:text-brand-dark",
                  )}
                >
                  {entry.label}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {loading ? (
        <PageLoading label="Loading opportunities…" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No sample listings match this filter yet."
          description={
            query
              ? `Nothing matched "${query}" in ${activeCategory.label}. Try a different search or category.`
              : `There are no sample listings in ${activeCategory.label} yet. Live opportunities arrive with the backend.`
          }
        />
      ) : (
        <section>
          <p className="mb-3 text-[12.5px] text-muted">
            {results.length} {results.length === 1 ? "listing" : "listings"} in{" "}
            {activeCategory.label}
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((job) => (
              <li key={job.id} className="flex">
                <JobCard job={job} detailHref={`/dashboard/opportunities?cat=${category}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
