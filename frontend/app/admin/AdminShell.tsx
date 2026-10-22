"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, BriefcaseBusiness, Building2, ChartNoAxesColumn, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, ClipboardCheck, FileClock, FileText, Flag, FolderKanban, HelpCircle, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_NAV, DEMO_ADMIN_SESSION } from "./admin-data";
import styles from "./admin.module.css";

const iconBySlug: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, users: Users, "job-seekers": Users, employers: Building2,
  "employer-verification": ShieldCheck, "job-listings": BriefcaseBusiness, "government-jobs": Building2,
  internships: FolderKanban, "online-tasks": CheckSquare, "task-submissions": ClipboardCheck,
  applications: FileText, reports: Flag, notifications: Bell, "support-tickets": HelpCircle,
  analytics: ChartNoAxesColumn, "admin-users": ShieldCheck, "audit-logs": FileClock, settings: Settings,
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin";
  const [ready, setReady] = useState(isLogin);
  const [username, setUsername] = useState("Admin");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (isLogin) return;
    const timer = window.setTimeout(() => {
      const storedName = window.sessionStorage.getItem(DEMO_ADMIN_SESSION);
      if (!storedName) { router.replace("/admin"); return; }
      setUsername(storedName);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;

  function logout() {
    window.sessionStorage.removeItem(DEMO_ADMIN_SESSION);
    router.replace("/admin");
  }

  const groups = [...new Set(ADMIN_NAV.map((item) => item.group))];
  const searchResults = ADMIN_NAV.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className={styles.adminShell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brandRow}>
          <Link href="/admin/dashboard" className={styles.brandImage}><Image src="/website%20logo.png" alt="KaziHub KE" width={190} height={62} /></Link>
          <button className={styles.collapseButton} onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>
        <nav className={styles.nav} aria-label="Admin navigation">
          {groups.map((group) => <div className={styles.navGroup} key={group}>
            <p className={styles.sidebarLabel}>{group}</p>
            {ADMIN_NAV.filter((item) => item.group === group).map((item) => {
              const Icon = iconBySlug[item.slug] || Activity;
              const active = pathname === `/admin/${item.slug}`;
              return <Link key={item.slug} href={`/admin/${item.slug}`} title={collapsed ? item.label : undefined} className={`${styles.navItem} ${active ? styles.navActive : ""}`} onClick={() => setMobileOpen(false)}><Icon size={17} strokeWidth={1.9} /><span>{item.label}</span></Link>;
            })}
          </div>)}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarProfile}><span className={styles.avatar}>{username.slice(0, 1).toUpperCase()}</span><span className={styles.profileText}><strong>{username}</strong><small>Demo administrator</small></span></div>
          <button className={styles.navItem} onClick={logout} title={collapsed ? "Logout" : undefined}><LogOut size={17} /><span>Logout</span></button>
        </div>
      </aside>
      {mobileOpen && <button className={styles.scrim} aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <section className={`${styles.mainArea} ${collapsed ? styles.mainCollapsed : ""}`}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <Link href="/admin/dashboard" className={styles.topbarBrand} aria-label="KaziHub KE admin dashboard"><Image src="/website%20logo.png" alt="KaziHub KE" width={190} height={62} priority /><span>Admin</span></Link>
          <div className={styles.globalSearchWrap}>
            <Search size={17} />
            <input aria-label="Search admin pages" placeholder="Search pages…" value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchQuery(event.target.value); setSearchOpen(true); }} />
            {searchOpen && searchQuery && <div className={styles.searchResults}>{searchResults.length ? searchResults.map((item) => <Link key={item.slug} href={`/admin/${item.slug}`} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><Search size={14} />{item.label}</Link>) : <span>No matching admin pages</span>}</div>}
          </div>
          <div className={styles.topActions}><span className={styles.previewBadge}>Frontend preview · mock data</span><Link href="/admin/notifications" className={styles.notificationButton} aria-label="Notifications"><Bell size={18} /><i /></Link><button className={styles.profileChip} aria-label={`Demo administrator ${username}`} aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><CircleUserRound size={20} /><span>{username}</span><ChevronDown size={14} /></button>{profileOpen && <div className={styles.profileDropdown}><strong>{username}</strong><span>Demo administrator</span><button onClick={logout}><LogOut size={14} />Log out</button></div>}</div>
        </header>
        {children}
        {!ready && <div className={styles.shellLoadingOverlay} role="status">Opening admin preview…</div>}
      </section>
    </div>
  );
}
