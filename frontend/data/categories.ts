/**
 * Mock opportunity categories for the OpportunityCategories section.
 * `icon` keys map to Lucide icon components in the section component.
 */

export type CategoryId =
  | "online-jobs"
  | "government-jobs"
  | "internships"
  | "industrial-attachments"
  | "private-sector-jobs"
  | "remote-jobs"
  | "freelance-work"
  | "social-media-tasks";

export type OpportunityCategory = {
  id: CategoryId;
  name: string;
  description: string;
  count: number;
  icon:
    | "briefcase"
    | "landmark"
    | "graduationCap"
    | "school"
    | "building"
    | "laptop"
    | "penTool"
    | "share";
  href: string;
};

export const opportunityCategories: OpportunityCategory[] = [
  {
    id: "online-jobs",
    name: "Online Jobs",
    description:
      "Remote roles, freelance gigs and work-from-home vacancies posted by verified employers.",
    count: 486,
    icon: "briefcase",
    href: "#latest-jobs",
  },
  {
    id: "government-jobs",
    name: "Government Jobs",
    description:
      "Public-sector vacancies, recruitment announcements and official application information.",
    count: 132,
    icon: "landmark",
    href: "#latest-jobs",
  },
  {
    id: "internships",
    name: "Internships",
    description:
      "Paid and unpaid internships for students and recent graduates building their careers.",
    count: 214,
    icon: "graduationCap",
    href: "#latest-jobs",
  },
  {
    id: "industrial-attachments",
    name: "Industrial Attachments",
    description:
      "Practical attachment placements for college and university students across Kenya.",
    count: 168,
    icon: "school",
    href: "#latest-jobs",
  },
  {
    id: "private-sector-jobs",
    name: "Private-Sector Jobs",
    description:
      "Vacancies from companies, SMEs and NGOs hiring across a wide range of industries.",
    count: 725,
    icon: "building",
    href: "#latest-jobs",
  },
  {
    id: "remote-jobs",
    name: "Remote Jobs",
    description:
      "Fully remote positions you can work from anywhere in Kenya with a reliable connection.",
    count: 298,
    icon: "laptop",
    href: "#latest-jobs",
  },
  {
    id: "freelance-work",
    name: "Freelance Work",
    description:
      "Short and long-term freelance projects in writing, design, development and more.",
    count: 341,
    icon: "penTool",
    href: "#online-tasks",
  },
  {
    id: "social-media-tasks",
    name: "Social Media Tasks",
    description:
      "Eligible digital microtasks such as following creators, watching videos and completing surveys.",
    count: 1520,
    icon: "share",
    href: "#online-tasks",
  },
];

/** Filter options used by the LatestJobs search + category filter (frontend demo). */
export const jobFilters = [
  { id: "all", label: "All Opportunities" },
  { id: "online", label: "Online & Remote" },
  { id: "government", label: "Government" },
  { id: "internship", label: "Internships" },
  { id: "attachment", label: "Attachments" },
  { id: "private", label: "Private Sector" },
] as const;

export type JobFilterId = (typeof jobFilters)[number]["id"];
