/** Dashboard disclosures and application status labels. */

import type { ApplicationStatus } from "@/lib/account-types";

export const dashboardDisclaimers = {
  opportunities:
    "Only published opportunities from the platform database are displayed.",
  tasks:
    "Task rewards appear after a submission is reviewed and approved. Withdrawals are processed manually.",
  notifications:
    "Notifications are generated from your account state in this browser. They are not server-delivered messages.",
  session:
    "Your sign-in is handled by the KaziHub API. Some profile fields are still saved locally in this browser.",
} as const;

/** Status explanations shown with the applications empty state. */
export const applicationStatusLegend: { status: ApplicationStatus; description: string }[] = [
  { status: "submitted", description: "Your application has been received by the employer." },
  { status: "under-review", description: "The employer is reviewing applications." },
  { status: "shortlisted", description: "The employer has shortlisted you for the next stage." },
  { status: "interview", description: "You have been invited to an interview." },
  { status: "closed", description: "The opportunity is closed or no longer considering applications." },
];
