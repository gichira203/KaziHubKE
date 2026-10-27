/** Public job discovery backed by the API database. No mock listings are used. */

import type { Job } from "@/data/jobs";
import { apiBaseUrl } from "./auth-config";
import type { JobFilterId } from "@/data/categories";

export type JobSort = "newest" | "deadline" | "title";

export type JobQuery = {
  query?: string;
  category?: JobFilterId;
  employmentType?: string;
  sort?: JobSort;
  page?: number;
  perPage?: number;
};

export type JobPage = {
  items: Job[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const JOBS_PER_PAGE = 6;

const emptyPage = (page = 1, perPage = JOBS_PER_PAGE): JobPage => ({
  items: [],
  total: 0,
  page,
  perPage,
  totalPages: 1,
});

export function isJobFilterId(value: string | undefined): value is JobFilterId {
  return ["all", "online", "government", "internship", "attachment", "private"].includes(value || "");
}

export async function listJobs({
  query = "",
  category = "all",
  employmentType = "",
  sort = "newest",
  page = 1,
  perPage = JOBS_PER_PAGE,
}: JobQuery = {}): Promise<JobPage> {
  if (!apiBaseUrl) return emptyPage(page, perPage);

  const params = new URLSearchParams({
    query,
    category,
    sort,
    page: String(page),
    perPage: String(perPage),
  });
  if (employmentType) params.set("employmentType", employmentType);

  try {
    const response = await fetch(`${apiBaseUrl}/jobs?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return emptyPage(page, perPage);
    return (await response.json()) as JobPage;
  } catch {
    return emptyPage(page, perPage);
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  if (!apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBaseUrl}/jobs/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const result = (await response.json()) as { job?: Job };
    return result.job ?? null;
  } catch {
    return null;
  }
}

/** True when the application deadline has passed (date-only comparison). */
export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;
  return deadline < new Date().toISOString().slice(0, 10);
}
