/**
 * Dashboard mock data and disclosures.
 *
 * A NEWLY REGISTERED account has no applications, no job listings and no
 * candidate results. Those sections render honest empty states — this file
 * only holds the clearly-labelled SAMPLE data used for opportunity discovery
 * and the disclaimers shown beside it.
 */

import type { ApplicationStatus } from "@/lib/account-types";

export const dashboardDisclaimers = {
  opportunities:
    "Sample listings: these are demonstration opportunities for the frontend preview, not verified live vacancies.",
  tasks:
    "Sample tasks: rewards, eligibility and availability are sample values. Task verification and payouts require a secure backend — earnings are never guaranteed.",
  notifications:
    "Notifications are generated from your account state in this browser. They are not server-delivered messages.",
  session:
    "No authentication backend is connected: this is a local demo session created in your browser. Nothing is saved to a server and no real account exists.",
} as const;

/** Status explanations shown with the applications empty state. */
export const applicationStatusLegend: { status: ApplicationStatus; description: string }[] = [
  { status: "submitted", description: "Your application has been received by the employer." },
  { status: "under-review", description: "The employer is reviewing applications." },
  { status: "shortlisted", description: "The employer has shortlisted you for the next stage." },
  { status: "interview", description: "You have been invited to an interview." },
  { status: "closed", description: "The opportunity is closed or no longer considering applications." },
];
