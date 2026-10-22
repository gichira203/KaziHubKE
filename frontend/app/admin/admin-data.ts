export type AdminSection = {
  slug: string;
  label: string;
  title: string;
  description: string;
  columns: string[];
  rows: Record<string, string>[];
  filters: string[];
};

export const DEMO_ADMIN_SESSION = "kazihub.admin.demo";

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
];

const demoRows = (kind: string): Record<string, string>[] => {
  const rows: Record<string, Record<string, string>[]> = {
    users: [
      { Name: "Amina Wanjiku", Email: "amina.demo@example.test", Type: "Job seeker", Status: "Active", Joined: "Oct 18, 2026" },
      { Name: "Peter Mwangi", Email: "peter.demo@example.test", Type: "Employer", Status: "Pending", Joined: "Oct 17, 2026" },
      { Name: "Grace Atieno", Email: "grace.demo@example.test", Type: "Job seeker", Status: "Active", Joined: "Oct 16, 2026" },
      { Name: "Kifaru Digital", Email: "hr.demo@example.test", Type: "Employer", Status: "Suspended", Joined: "Oct 12, 2026" },
    ],
    "job-seekers": [
      { Name: "Amina Wanjiku", Email: "amina.demo@example.test", Completion: "85%", Skills: "Design, Figma", CV: "Uploaded", Status: "Active" },
      { Name: "Grace Atieno", Email: "grace.demo@example.test", Completion: "52%", Skills: "Accounting, Excel", CV: "Missing", Status: "Active" },
      { Name: "Brian Otieno", Email: "brian.demo@example.test", Completion: "100%", Skills: "React, TypeScript", CV: "Uploaded", Status: "Active" },
    ],
    employers: [
      { Company: "Pamoja Health", Contact: "hr.demo@example.test", Activity: "3 listings", Verification: "Pending", Status: "Active" },
      { Company: "Kifaru Digital", Contact: "careers.demo@example.test", Activity: "1 listing", Verification: "Verified", Status: "Active" },
      { Company: "Soko Fresh Ltd", Contact: "jobs.demo@example.test", Activity: "0 listings", Verification: "Needs review", Status: "Pending" },
    ],
    "employer-verification": [
      { Company: "Pamoja Health", Submitted: "Oct 20, 2026", Documents: "2 files", Status: "Pending" },
      { Company: "Soko Fresh Ltd", Submitted: "Oct 19, 2026", Documents: "3 files", Status: "Pending" },
      { Company: "Kifaru Digital", Submitted: "Oct 15, 2026", Documents: "2 files", Status: "Approved" },
    ],
    "job-listings": [
      { Title: "Graduate Product Designer", Employer: "Pamoja Health", Category: "Design", Submitted: "Oct 20, 2026", Status: "Pending" },
      { Title: "Junior Software Engineer", Employer: "Kifaru Digital", Category: "Technology", Submitted: "Oct 19, 2026", Status: "Published" },
      { Title: "Accounts Assistant", Employer: "Soko Fresh Ltd", Category: "Finance", Submitted: "Oct 17, 2026", Status: "Needs edits" },
    ],
    "government-jobs": [
      { Title: "ICT Officer II", Source: "Public Service Commission", Deadline: "Nov 14, 2026", Reviewed: "Oct 18, 2026", Status: "Published" },
      { Title: "Records Management Assistant", Source: "County Public Service", Deadline: "Nov 02, 2026", Reviewed: "Oct 19, 2026", Status: "Draft" },
    ],
    internships: [
      { Title: "ICT Attachment Programme", Organization: "Demo Ministry", Deadline: "Nov 10, 2026", Category: "Attachment", Status: "Published" },
      { Title: "Graduate Trainee Cohort", Organization: "Demo Bank", Deadline: "Nov 22, 2026", Category: "Internship", Status: "Draft" },
    ],
    "online-tasks": [
      { Title: "Product feedback survey", Reward: "KES 150 (demo)", Submissions: "23", Updated: "Oct 20, 2026", Status: "Active" },
      { Title: "Image tagging practice", Reward: "KES 80 (demo)", Submissions: "41", Updated: "Oct 18, 2026", Status: "Paused" },
    ],
    "task-submissions": [
      { Task: "Product feedback survey", User: "Amina Wanjiku", Submitted: "Oct 21, 2026", Evidence: "Attached", Status: "Pending" },
      { Task: "Image tagging practice", User: "Brian Otieno", Submitted: "Oct 20, 2026", Evidence: "Attached", Status: "Pending" },
    ],
    applications: [
      { Candidate: "Amina Wanjiku", Job: "Graduate Product Designer", Employer: "Pamoja Health", Applied: "Oct 21, 2026", Status: "Received" },
      { Candidate: "Grace Atieno", Job: "Accounts Assistant", Employer: "Soko Fresh Ltd", Applied: "Oct 19, 2026", Status: "Reviewing" },
    ],
    reports: [
      { Subject: "Expired job listing", Target: "Junior Sales Associate", Reporter: "User demo 14", Received: "Oct 21, 2026", Status: "Open" },
      { Subject: "Suspicious employer", Target: "Demo Company", Reporter: "User demo 09", Received: "Oct 20, 2026", Status: "Investigating" },
    ],
    notifications: [
      { Title: "October platform update", Audience: "All users", Channel: "In-app", Scheduled: "Oct 24, 2026", Status: "Draft" },
      { Title: "Profile completion reminder", Audience: "Job seekers", Channel: "Email (demo)", Scheduled: "—", Status: "Paused" },
    ],
    "support-tickets": [
      { Subject: "Unable to update profile", User: "Amina Wanjiku", Assigned: "Unassigned", Updated: "Oct 21, 2026", Status: "Open" },
      { Subject: "Company verification question", User: "Pamoja Health", Assigned: "Admin demo", Updated: "Oct 20, 2026", Status: "In progress" },
    ],
    analytics: [
      { Report: "User growth overview", Period: "Last 30 days", Updated: "Oct 21, 2026", Status: "Mock data" },
      { Report: "Opportunity activity", Period: "Last 90 days", Updated: "Oct 21, 2026", Status: "Mock data" },
    ],
    "admin-users": [
      { Name: "Demo Administrator", Email: "admin.demo@example.test", Role: "Super admin (demo)", Permissions: "All (mock)", Status: "Active" },
    ],
    "audit-logs": [
      { Action: "Opened admin dashboard", Actor: "Demo Administrator", Record: "Dashboard", Time: "Oct 21, 2026 09:30", Status: "Demo event" },
      { Action: "Viewed verification queue", Actor: "Demo Administrator", Record: "Employer review", Time: "Oct 21, 2026 09:34", Status: "Demo event" },
    ],
    settings: [
      { Setting: "Job seeker profile categories", Scope: "Profiles", Updated: "Oct 18, 2026", Status: "Enabled" },
      { Setting: "Employer verification required", Scope: "Employer accounts", Updated: "Oct 16, 2026", Status: "Enabled" },
    ],
  };
  return rows[kind] || [];
};

export const ADMIN_SECTIONS: Record<string, AdminSection> = Object.fromEntries(
  ADMIN_NAV.filter((item) => item.slug !== "dashboard").map((item) => {
    const rows = demoRows(item.slug);
    return [item.slug, {
      ...item,
      title: item.label,
      description: `Review and manage ${item.label.toLowerCase()} records. Current examples are frontend demo data.`,
      columns: rows.length ? Object.keys(rows[0]) : ["Name", "Status"],
      rows,
      filters: [...new Set(rows.map((row) => row.Status).filter(Boolean))],
    }];
  }),
);
