/**
 * Job listing drafts (employer).
 *
 * Stored in sessionStorage for the demo. Statuses mirror the backend workflow
 * exactly: draft → pending-review → published. A listing NEVER becomes
 * published here — `published` only ever comes from the backend after
 * verification and moderation.
 */

import type { JobListingStatus } from "./account-types";

const KEY = "kazihub.draft.job-listings";

export interface JobDraft {
  id: string;
  title: string;
  category: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string[];
  location: string;
  arrangement: "remote" | "hybrid" | "on-site" | "";
  salaryRange: string;
  employmentType: string;
  deadline: string;
  applicationMethod: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: JobListingStatus;
  createdAt: string;
  updatedAt: string;
}

function readAll(): JobDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JobDraft[]) : [];
  } catch {
    return [];
  }
}

function writeAll(drafts: JobDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    // Storage blocked — drafts stay in memory for the current page.
  }
}

export function listJobDrafts(): JobDraft[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getJobDraft(id: string): JobDraft | null {
  return readAll().find((draft) => draft.id === id) ?? null;
}

export type JobDraftInput = Omit<JobDraft, "id" | "createdAt" | "updatedAt" | "status"> & {
  id?: string;
  status?: JobListingStatus;
};

/** Create or update a draft. Returns the saved draft. */
export function saveJobDraft(input: JobDraftInput): JobDraft {
  const drafts = readAll();
  const timestamp = new Date().toISOString();

  if (input.id) {
    const index = drafts.findIndex((draft) => draft.id === input.id);
    if (index >= 0) {
      const updated: JobDraft = {
        ...drafts[index],
        ...input,
        id: input.id,
        status: input.status ?? drafts[index].status,
        updatedAt: timestamp,
      };
      drafts[index] = updated;
      writeAll(drafts);
      return updated;
    }
  }

  const created: JobDraft = {
    ...input,
    id: `job-${Math.random().toString(36).slice(2, 9)}`,
    status: input.status ?? "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  drafts.push(created);
  writeAll(drafts);
  return created;
}

export function deleteJobDraft(id: string): void {
  writeAll(readAll().filter((draft) => draft.id !== id));
}

export function emptyJobDraft(): JobDraft {
  return {
    id: "",
    title: "",
    category: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    skills: [],
    location: "",
    arrangement: "",
    salaryRange: "",
    employmentType: "",
    deadline: "",
    applicationMethod: "Apply on KaziHub KE",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "draft",
    createdAt: "",
    updatedAt: "",
  };
}
