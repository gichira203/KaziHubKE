/**
 * Opportunity categories used to filter live platform records.
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
    icon: "briefcase",
    href: "#latest-jobs",
  },
  {
    id: "government-jobs",
    name: "Government Jobs",
    description:
      "Public-sector vacancies, recruitment announcements and official application information.",
    icon: "landmark",
    href: "#latest-jobs",
  },
  {
    id: "internships",
    name: "Internships",
    description:
      "Paid and unpaid internships for students and recent graduates building their careers.",
    icon: "graduationCap",
    href: "#latest-jobs",
  },
  {
    id: "industrial-attachments",
    name: "Industrial Attachments",
    description:
      "Practical attachment placements for college and university students across Kenya.",
    icon: "school",
    href: "#latest-jobs",
  },
  {
    id: "private-sector-jobs",
    name: "Private-Sector Jobs",
    description:
      "Vacancies from companies, SMEs and NGOs hiring across a wide range of industries.",
    icon: "building",
    href: "#latest-jobs",
  },
  {
    id: "remote-jobs",
    name: "Remote Jobs",
    description:
      "Fully remote positions you can work from anywhere in Kenya with a reliable connection.",
    icon: "laptop",
    href: "#latest-jobs",
  },
  {
    id: "freelance-work",
    name: "Freelance Work",
    description:
      "Short and long-term freelance projects in writing, design, development and more.",
    icon: "penTool",
    href: "#online-tasks",
  },
  {
    id: "social-media-tasks",
    name: "Social Media Tasks",
    description:
      "Eligible digital microtasks such as following creators, watching videos and completing surveys.",
    icon: "share",
    href: "#online-tasks",
  },
];

/** Filter options used by live job discovery. */
export const jobFilters = [
  { id: "all", label: "All Opportunities" },
  { id: "online", label: "Online & Remote" },
  { id: "government", label: "Government" },
  { id: "internship", label: "Internships" },
  { id: "attachment", label: "Attachments" },
  { id: "private", label: "Private Sector" },
] as const;

export type JobFilterId = (typeof jobFilters)[number]["id"];
