"use client";

/**
 * DashboardShell — the shared responsive shell for BOTH dashboards:
 * fixed white sidebar (desktop), sticky topbar, mobile drawer, scrollable
 * main content. Navigation is per-account-type and locked items explain why
 * they are unavailable. It is deliberately variant-aware only through the
 * nav config — every page beneath it stays independent.
 */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  ClipboardList,
  FileSearch,
  FileText,
  GraduationCap,
  Landmark,
  Laptop,
  LayoutDashboard,
  LifeBuoy,
  PenTool,
  School,
  Settings,
  ShieldCheck,
  User,
  Users,
  PlusCircle,
} from "lucide-react";
import DashboardSidebar, { type NavGroup, type SidebarUser } from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import MobileDashboardMenu from "./MobileDashboardMenu";
import { getOrCreateSession, displayName, initials, type AccountSession } from "@/lib/session";
import { signOut } from "@/lib/auth-config";
import { deriveNotifications } from "@/lib/dashboard-service";
import { canSearchCandidates } from "@/lib/permissions";

/* ------------------------------------------------------------------ */
/* Navigation configuration                                            */
/* ------------------------------------------------------------------ */

function seekerNavGroups(): NavGroup[] {
  return [
    {
      label: "Discover",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Find Jobs", href: "/dashboard/opportunities", icon: Briefcase },
        { label: "Government Jobs", href: "/dashboard/opportunities?cat=government", icon: Landmark },
        { label: "Internships", href: "/dashboard/opportunities?cat=internship", icon: GraduationCap },
        { label: "Industrial Attachments", href: "/dashboard/opportunities?cat=attachment", icon: School },
        { label: "Remote Jobs", href: "/dashboard/opportunities?cat=remote", icon: Laptop },
        { label: "Online Tasks", href: "/dashboard/tasks", icon: PenTool },
      ],
    },
    {
      label: "My Account",
      items: [
        { label: "My Applications", href: "/dashboard/applications", icon: ClipboardList },
        { label: "My CV", href: "/dashboard/cv", icon: FileText },
        { label: "My Profile", href: "/dashboard/profile", icon: User },
        { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
      ],
    },
    {
      label: "Support",
      items: [
        { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
        { label: "Help and Support", href: "/dashboard/help", icon: LifeBuoy },
      ],
    },
  ];
}

function employerNavGroups(session: AccountSession | null): NavGroup[] {
  const candidateSearch = canSearchCandidates(session);
  const lock = { locked: !candidateSearch.allowed, lockReason: candidateSearch.reason };

  return [
    {
      label: "Recruitment",
      items: [
        { label: "Overview", href: "/employer/dashboard", icon: LayoutDashboard },
        { label: "Post a Job", href: "/employer/dashboard/jobs/new", icon: PlusCircle },
        { label: "Manage Jobs", href: "/employer/dashboard/jobs", icon: Briefcase },
        { label: "Applications", href: "/employer/dashboard/applications", icon: Users },
      ],
    },
    {
      label: "Candidates",
      items: [
        { label: "Candidate Search", href: "/employer/dashboard/candidates", icon: FileSearch, ...lock },
        { label: "Saved Candidates", href: "/employer/dashboard/candidates#saved", icon: User, ...lock },
      ],
    },
    {
      label: "Organization",
      items: [
        { label: "Company Profile", href: "/employer/dashboard/company-profile", icon: Building2 },
        { label: "Verification", href: "/employer/dashboard/verification", icon: ShieldCheck },
        { label: "Recruitment Activity", href: "/employer/dashboard/activity", icon: ClipboardList },
      ],
    },
    {
      label: "Support",
      items: [
        { label: "Notifications", href: "/employer/dashboard/notifications", icon: Bell },
        { label: "Settings", href: "/employer/dashboard/settings", icon: Settings },
        { label: "Help and Support", href: "/employer/dashboard/help", icon: LifeBuoy },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Page titles                                                         */
/* ------------------------------------------------------------------ */

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/opportunities": "Find Opportunities",
  "/dashboard/tasks": "Online Tasks",
  "/dashboard/applications": "My Applications",
  "/dashboard/cv": "My CV",
  "/dashboard/profile": "My Profile",
  "/dashboard/verification": "Verification",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
  "/dashboard/help": "Help and Support",
  "/employer/dashboard": "Overview",
  "/employer/dashboard/company-profile": "Company Profile",
  "/employer/dashboard/verification": "Verification",
  "/employer/dashboard/jobs": "Manage Jobs",
  "/employer/dashboard/jobs/new": "Post a Job",
  "/employer/dashboard/applications": "Applications",
  "/employer/dashboard/candidates": "Candidates",
  "/employer/dashboard/activity": "Recruitment Activity",
  "/employer/dashboard/notifications": "Notifications",
  "/employer/dashboard/settings": "Settings",
  "/employer/dashboard/help": "Help and Support",
};

function resolveTitle(pathname: string): string {
  // Longest matching prefix wins (e.g. jobs/new before jobs).
  const matches = Object.keys(PAGE_TITLES)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length);
  return matches.length > 0 ? PAGE_TITLES[matches[0]] : "Dashboard";
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

type DashboardShellProps = {
  /** "seeker" | "employer" — selects the navigation and search config. */
  variant: "seeker" | "employer";
  children: React.ReactNode;
};

export default function DashboardShell({ variant, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AccountSession | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // A newly registered account: session exists, nothing is verified or
    // complete. Read on mount (not during render) so the server snapshot
    // stays session-free and hydration matches; the microtask keeps the
    // setState out of the synchronous effect body.
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setSession(getOrCreateSession(variant === "employer" ? "employer" : "job-seeker"));
      }
    });
    return () => {
      active = false;
    };
  }, [variant]);

  const groups = variant === "employer" ? employerNavGroups(session) : seekerNavGroups();
  const notifications = session ? deriveNotifications(session) : [];

  const user: SidebarUser | null = session
    ? {
        name: displayName(session) || "Your account",
        initials: initials(session),
        email: session.email,
        accountLabel: variant === "employer" ? "Employer account" : "Job seeker account",
      }
    : null;

  const handleLogout = () => {
    void signOut();
    router.push("/login");
  };

  const base = variant === "employer" ? "/employer/dashboard" : "/dashboard";

  return (
    <div className="min-h-dvh bg-dashboard">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <DashboardSidebar groups={groups} activeHref={pathname} user={user} onLogout={handleLogout} />

      <div className="lg:pl-64">
        <DashboardTopbar
          title={resolveTitle(pathname)}
          search={
            variant === "seeker"
              ? {
                  placeholder: "Search opportunities…",
                  ariaLabel: "Search opportunities",
                  onSubmit: (query) =>
                    router.push(
                      query
                        ? `/dashboard/opportunities?q=${encodeURIComponent(query)}`
                        : "/dashboard/opportunities",
                    ),
                }
              : {
                  placeholder: "Search jobs…",
                  ariaLabel: "Search job listings",
                  onSubmit: (query) =>
                    router.push(
                      query
                        ? `/employer/dashboard/jobs?q=${encodeURIComponent(query)}`
                        : "/employer/dashboard/jobs",
                    ),
                }
          }
          notifications={notifications}
          user={user}
          helpHref={`${base}/help`}
          profileHref={
            variant === "employer" ? "/employer/dashboard/company-profile" : "/dashboard/profile"
          }
          settingsHref={`${base}/settings`}
          onOpenMenu={() => setDrawerOpen(true)}
          onLogout={handleLogout}
        />

        <main id="main-content" className="w-full px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>

      <MobileDashboardMenu
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={groups}
        activeHref={pathname}
        user={user}
      />
    </div>
  );
}
