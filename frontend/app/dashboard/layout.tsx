"use client";

/**
 * Job seeker dashboard layout — the responsive shell for /dashboard.
 * Role-based navigation: job seekers never see employer management routes.
 */
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell variant="seeker">{children}</DashboardShell>;
}
