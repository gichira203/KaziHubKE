/**
 * Shared job data types for listings returned by the platform API.
 */

export type JobCategory = "online" | "government" | "internship" | "attachment" | "private";

export type Job = {
  id: string;
  title: string;
  employer: string;
  category: JobCategory;
  employmentType: string;
  location: string;
  remote: boolean;
  salaryRange?: string;
  deadline: string | null;
  postedAt: string;
  description: string;
};
