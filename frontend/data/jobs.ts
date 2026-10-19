/**
 * Mock job listings for the LatestJobs section.
 * SAMPLE DATA ONLY — not verified live vacancies. Deadline/date values are
 * ISO strings so they can be swapped for real API payloads later.
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
  deadline: string | null;
  postedAt: string;
  description: string;
};

export const jobs: Job[] = [
  {
    id: "job-001",
    title: "Junior Frontend Developer",
    employer: "Savannah Tech Ltd",
    category: "online",
    employmentType: "Full-time",
    location: "Nairobi",
    remote: true,
    deadline: "2026-11-15",
    postedAt: "2026-10-09",
    description:
      "Build responsive interfaces with React and Next.js for clients across East Africa. Junior and mid-level applicants welcome.",
  },
  {
    id: "job-002",
    title: "Public Health Officer",
    employer: "Ministry of Health",
    category: "government",
    employmentType: "Full-time",
    location: "Kisumu",
    remote: false,
    deadline: "2026-11-02",
    postedAt: "2026-10-06",
    description:
      "Support county health programmes, community outreach and reporting duties. Applicants must meet the public service entry requirements.",
  },
  {
    id: "job-003",
    title: "Software Engineering Intern",
    employer: "PayLink Kenya",
    category: "internship",
    employmentType: "Internship (6 months)",
    location: "Nairobi",
    remote: false,
    deadline: "2026-10-30",
    postedAt: "2026-10-08",
    description:
      "Work alongside a product engineering team on payment integrations, APIs and internal tooling. Stipend provided.",
  },
  {
    id: "job-004",
    title: "Industrial Attachment — ICT",
    employer: "Kenya Power",
    category: "attachment",
    employmentType: "Attachment (3 months)",
    location: "Nakuru",
    remote: false,
    deadline: "2026-11-20",
    postedAt: "2026-10-05",
    description:
      "Gain hands-on experience in network support, systems administration and ICT asset management. Open to diploma and degree students.",
  },
  {
    id: "job-005",
    title: "Customer Support Agent",
    employer: "Brightline Retail Group",
    category: "private",
    employmentType: "Full-time",
    location: "Mombasa",
    remote: false,
    deadline: "2026-10-28",
    postedAt: "2026-10-10",
    description:
      "Assist customers via phone, email and chat for a growing retail chain. Fluency in English and Swahili required.",
  },
  {
    id: "job-006",
    title: "Remote Content Writer",
    employer: "Lango Media",
    category: "online",
    employmentType: "Part-time",
    location: "Remote — Kenya",
    remote: true,
    deadline: "2026-11-08",
    postedAt: "2026-10-07",
    description:
      "Write blog articles and social copy for fintech and lifestyle brands. Flexible hours, paid per article with a monthly retainer.",
  },
  {
    id: "job-007",
    title: "Data Entry Clerk",
    employer: "County Government of Kiambu",
    category: "government",
    employmentType: "Contract (12 months)",
    location: "Kiambu",
    remote: false,
    deadline: "2026-11-12",
    postedAt: "2026-10-04",
    description:
      "Digitise and verify records for county departments. Certificate in ICT or related discipline required.",
  },
  {
    id: "job-008",
    title: "Digital Marketing Intern",
    employer: "Zawadi Brands",
    category: "internship",
    employmentType: "Internship (4 months)",
    location: "Nairobi",
    remote: true,
    deadline: "2026-10-25",
    postedAt: "2026-10-11",
    description:
      "Assist with social media campaigns, analytics reporting and content calendars for consumer brands.",
  },
  {
    id: "job-009",
    title: "Accounts Assistant",
    employer: "Rift Valley Farmers Co-op",
    category: "private",
    employmentType: "Full-time",
    location: "Eldoret",
    remote: false,
    deadline: null,
    postedAt: "2026-10-02",
    description:
      "Support bookkeeping, supplier payments and monthly reconciliations. CPA Part II or equivalent experience preferred.",
  },
  {
    id: "job-010",
    title: "UX/UI Designer",
    employer: "NovaHealth",
    category: "online",
    employmentType: "Full-time",
    location: "Remote — Kenya",
    remote: true,
    deadline: "2026-11-18",
    postedAt: "2026-10-10",
    description:
      "Design web and mobile experiences for health-tech products. Portfolio required; Figma proficiency essential.",
  },
];
