"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import JobCard from "@/components/common/JobCard";
import type { Job } from "@/data/jobs";
import { jobFilters, type JobFilterId } from "@/data/categories";
import { listEmploymentTypes } from "@/lib/jobs-service";
import { disclaimers } from "@/lib/constants";
import styles from "./PublicJobsBrowser.module.css";

const sortOptions = [
  { id: "newest", label: "Newest first" },
  { id: "deadline", label: "Deadline soonest" },
  { id: "title", label: "Title A–Z" },
] as const;

type PublicJobsBrowserProps = {
  /** Jobs for the current query — computed server-side and handed in. */
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  category: JobFilterId;
};

/**
 * PublicJobsBrowser — search, filter, sort and pagination controls for the
 * public opportunities page. State lives in the URL (via router
 * navigation), so filtered views are shareable and the back button
 * works; the initial values arrive from the server-rendered page. The
 * parent remounts this component when the URL changes (see JobsResults),
 * which keeps the form in sync without an effect.
 */
export default function PublicJobsBrowser({
  jobs,
  total,
  page,
  totalPages,
  query: initialQuery,
  category: initialCategory,
}: PublicJobsBrowserProps) {
  const router = useRouter();
  const employmentTypes = listEmploymentTypes();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<JobFilterId>(initialCategory);
  const [sort, setSort] = useState("newest");
  const [employmentType, setEmploymentType] = useState("");

  /** Re-run the server query by pushing URL search params. */
  function apply(next: { query?: string; category?: JobFilterId; sort?: string; employmentType?: string; page?: number }) {
    const params = new URLSearchParams();
    const merged = {
      query: next.query ?? query,
      category: next.category ?? category,
      sort: next.sort ?? sort,
      employmentType: next.employmentType ?? employmentType,
      page: next.page ?? 1,
    };
    if (merged.query) params.set("q", merged.query);
    if (merged.category && merged.category !== "all") params.set("category", merged.category);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    if (merged.employmentType) params.set("type", merged.employmentType);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className={styles.wrapper}>
      <form
        className={styles.controls}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          apply({ query, page: 1 });
        }}
      >
        <div className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            className={styles.search}
            placeholder="Search by title, employer or location…"
            aria-label="Search job opportunities"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className={styles.selects}>
          <label className={styles.selectLabel}>
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span className={styles.selectText}>Type</span>
            <select
              className={styles.select}
              value={employmentType}
              onChange={(event) => {
                setEmploymentType(event.target.value);
                apply({ employmentType: event.target.value, page: 1 });
              }}
            >
              <option value="">All types</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.selectLabel}>
            <span className={styles.selectText}>Sort</span>
            <select
              className={styles.select}
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                apply({ sort: event.target.value, page: 1 });
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.filters} role="group" aria-label="Filter opportunities by category">
          {jobFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`${styles.filter} ${category === filter.id ? styles.filterActive : ""}`}
              aria-pressed={category === filter.id}
              onClick={() => {
                setCategory(filter.id);
                apply({ category: filter.id, page: 1 });
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </form>

      <p className={styles.count} role="status">
        {total} {total === 1 ? "opportunity" : "opportunities"} found
        {query ? ` for “${query}”` : ""}
      </p>

      {jobs.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No opportunities match your search</p>
          <p className={styles.emptyText}>
            Try a different keyword, or clear the category and type filters.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} detailHref={`/jobs/${job.id}`} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Opportunity pages">
          <button
            type="button"
            className={styles.pageButton}
            disabled={page <= 1}
            onClick={() => apply({ page: page - 1 })}
          >
            <ChevronLeft size={15} aria-hidden="true" />
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={page >= totalPages}
            onClick={() => apply({ page: page + 1 })}
          >
            Next
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}

      <p className={styles.note}>{disclaimers.jobs}</p>
      <p className={styles.note}>
        Government listings are shown for information only. KaziHub KE does not claim that any
        sample listing is an official vacancy — official announcements come from the hiring body.
      </p>
    </div>
  );
}
