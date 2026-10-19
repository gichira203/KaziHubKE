import { Briefcase, Users, Building2, type LucideIcon } from "lucide-react";

/** Mock journey content for the HowItWorks tabs. */
export type Journey = {
  id: string;
  label: string;
  title: string;
  steps: string[];
  icon: LucideIcon;
};

export const journeys: Journey[] = [
  {
    id: "job-seekers",
    label: "For Job Seekers",
    title: "Find and land the right opportunity",
    steps: [
      "Create an account and complete your profile.",
      "Search and apply for suitable opportunities.",
      "Track applications and follow recruitment updates.",
    ],
    icon: Briefcase,
  },
  {
    id: "task-participants",
    label: "For Microtask Participants",
    title: "Complete tasks and track your reviews",
    steps: [
      "Browse available tasks and eligibility requirements.",
      "Complete the requested action.",
      "Submit the required evidence and track review status.",
    ],
    icon: Users,
  },
  {
    id: "employers",
    label: "For Employers",
    title: "Post vacancies and find qualified candidates",
    steps: [
      "Register an employer account.",
      "Submit a job vacancy.",
      "Review applications and identify suitable candidates.",
    ],
    icon: Building2,
  },
];
