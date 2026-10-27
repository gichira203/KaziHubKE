export type AdminSection = {
  slug: string;
  label: string;
  title: string;
  description: string;
  columns: string[];
  rows: Record<string, string>[];
  filters: string[];
};

export const ADMIN_NAV = [
  { slug: "dashboard", label: "Dashboard", group: "Overview" },
  { slug: "users", label: "Users", group: "People" },
  { slug: "job-seekers", label: "Job Seekers", group: "People" },
  { slug: "employers", label: "Employers", group: "People" },
  { slug: "employer-verification", label: "Employer Verification", group: "Review" },
  { slug: "job-listings", label: "Job Listings", group: "Opportunities" },
  { slug: "government-jobs", label: "Government Jobs", group: "Opportunities" },
  { slug: "internships", label: "Internships & Attachments", group: "Opportunities" },
  { slug: "online-tasks", label: "Online Tasks", group: "Tasks" },
  { slug: "task-submissions", label: "Task Submissions", group: "Tasks" },
  { slug: "applications", label: "Applications", group: "Review" },
  { slug: "reports", label: "Reports & Moderation", group: "Review" },
  { slug: "notifications", label: "Notifications", group: "Platform" },
  { slug: "support-tickets", label: "Support Tickets", group: "Platform" },
  { slug: "analytics", label: "Analytics & Reports", group: "Platform" },
  { slug: "admin-users", label: "Admin Users & Permissions", group: "Administration" },
  { slug: "audit-logs", label: "Audit Logs", group: "Administration" },
  { slug: "settings", label: "Settings", group: "Administration" },
] as const;

export const ADMIN_SECTIONS: Record<string, AdminSection> = Object.fromEntries(
  ADMIN_NAV.filter((item) => item.slug !== "dashboard").map((item) => [
    item.slug,
    {
      ...item,
      title: item.label,
      description: `Live ${item.label.toLowerCase()} records from the platform database.`,
      columns: [],
      rows: [],
      filters: [],
    },
  ]),
);
