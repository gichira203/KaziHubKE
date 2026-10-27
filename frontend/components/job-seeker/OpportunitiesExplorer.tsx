"use client";

/**
 * OpportunitiesExplorer — the interactive discovery UI for Find Opportunities.
 *
 * Receives the initial category/query from the server page (searchParams) and
 * drives filtering + URL updates itself with the router. Works fully before
 * profile completion; listings are loaded from the platform API.
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
import { apiRequest } from "@/lib/api";


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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiRequest<{ items: Job[] }>("/jobs?perPage=50&sort=newest")
      .then(({ items }) => {
        if (!active) return;
        const lower = query.trim().toLowerCase();
        setResults(items.filter((job) => matchesCategory(job, category) && (!lower ||
          job.title.toLowerCase().includes(lower) || job.employer.toLowerCase().includes(lower) ||
          job.description.toLowerCase().includes(lower))));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setResults([]);
        setError(reason instanceof Error ? reason.message : "Could not load opportunities.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
          Browse published jobs and online work posted on KaziHub KE.
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
          title={error ? "Opportunities could not be loaded." : "No published listings match this filter yet."}
          description={
            query
              ? error || `Nothing matched "${query}" in ${activeCategory.label}. Try a different search or category.`
              : error || `There are no published listings in ${activeCategory.label} yet.`
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
                <JobCard job={job} detailHref={`/jobs/${job.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
