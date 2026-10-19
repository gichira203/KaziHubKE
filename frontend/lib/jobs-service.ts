/**
 * Public opportunities listing service.
 *
 * Async by design so the UI never touches storage directly: when the REST
 * API lands, only the bodies of these functions change — components keep
 * the same contract (same pattern as `dashboard-service.ts`).
 *
 * HONESTY RULES:
 * - Source data is `data/jobs.ts`, clearly labelled sample listings.
 *   Nothing here fabricates vacancies, employers or application counts.
 * - `listJobs` reports the true result count for the applied filters.
 */

import { jobs, type Job, type JobCategory } from "@/data/jobs";
import { jobFilters, type JobFilterId } from "@/data/categories";

export type JobSort = "newest" | "deadline" | "title";

export type JobQuery = {
  /** Free-text match across title, employer, location and employment type. */
  query?: string;
  /** Category filter chip; "all" (default) matches every category. */
  category?: JobFilterId;
  /** Exact employment type, e.g. "Full-time". Omitted means any. */
  employmentType?: string;
  sort?: JobSort;
  /** 1-based page number. */
  page?: number;
  perPage?: number;
};

export type JobPage = {
  items: Job[];
  /** Total matches for the filters, ignoring pagination. */
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const JOBS_PER_PAGE = 6;

/** Categories each filter chip matches. "online" is online roles only. */
const filterGroups: Record<JobFilterId, string[]> = {
  all: ["online", "government", "internship", "attachment", "private"],
  online: ["online"],
  government: ["government"],
  internship: ["internship"],
  attachment: ["attachment"],
  private: ["private"],
};

export function isJobFilterId(value: string | undefined): value is JobFilterId {
  return jobFilters.some((filter) => filter.id === value);
}

/** Distinct employment types present in the data — powers the type filter. */
export function listEmploymentTypes(): string[] {
  return [...new Set(jobs.map((job) => job.employmentType))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function matchesQuery(job: Job, needle: string): boolean {
  if (!needle) return true;
  return (
    job.title.toLowerCase().includes(needle) ||
    job.employer.toLowerCase().includes(needle) ||
    job.location.toLowerCase().includes(needle) ||
    job.employmentType.toLowerCase().includes(needle)
  );
}

function sortJobs(items: Job[], sort: JobSort): Job[] {
  const sorted = [...items];
  if (sort === "title") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "deadline") {
    // Soonest deadline first; listings without a deadline go last.
    sorted.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  } else {
    sorted.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }
  return sorted;
}

export async function listJobs({
  query = "",
  category = "all",
  employmentType,
  sort = "newest",
  page = 1,
  perPage = JOBS_PER_PAGE,
}: JobQuery = {}): Promise<JobPage> {
  const needle = query.trim().toLowerCase();
  const allowed = filterGroups[category] as JobCategory[];

  const matched = sortJobs(
    jobs.filter(
      (job) =>
        allowed.includes(job.category) &&
        matchesQuery(job, needle) &&
        (!employmentType || job.employmentType === employmentType),
    ),
    sort,
  );

  const totalPages = Math.max(1, Math.ceil(matched.length / perPage));
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: matched.slice(start, start + perPage),
    total: matched.length,
    page: safePage,
    perPage,
    totalPages,
  };
}

export async function getJobById(id: string): Promise<Job | null> {
  return jobs.find((job) => job.id === id) ?? null;
}

/** True when the application deadline has passed (date-only comparison). */
export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;
  const today = new Date().toISOString().slice(0, 10);
  return deadline < today;
}
