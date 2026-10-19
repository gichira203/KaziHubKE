"use client";

/**
 * Employer dashboard layout — the responsive shell for /employer/dashboard.
 * Role-based navigation: employers never see job-seeker routes.
 */
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function EmployerDashboardLayout({ children }: LayoutProps<"/employer/dashboard">) {
  return <DashboardShell variant="employer">{children}</DashboardShell>;
}
