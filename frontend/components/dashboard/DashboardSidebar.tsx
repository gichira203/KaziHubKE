"use client";

/**
 * DashboardSidebar — fixed white navigation for desktop (lg+).
 *
 * The KaziHub KE logo sits directly on the white sidebar. Active pages are
 * marked with aria-current AND a green highlight — never colour alone.
 */
import Link from "next/link";
import { LogOut, Lock, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";
import Logo from "@/components/common/Logo";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Action the account cannot use yet — shown locked with the reason. */
  locked?: boolean;
  lockReason?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SidebarUser {
  name: string;
  initials: string;
  email: string;
  accountLabel: string;
}

const isActive = (href: string, activeHref: string): boolean =>
  activeHref === href || activeHref.startsWith(`${href}/`);

/** Shared nav rendering — used by both the desktop sidebar and the mobile drawer. */
export function NavList({
  groups,
  activeHref,
  onNavigate,
}: {
  groups: NavGroup[];
  activeHref: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4" aria-label="Dashboard">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href, activeHref);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={item.locked ? item.lockReason : undefined}
                    className={cx(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition",
                      active
                        ? "bg-primary-light text-brand"
                        : "text-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
                        aria-hidden="true"
                      />
                    ) : null}
                    <item.icon size={17} aria-hidden="true" className="flex-shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.locked ? (
                      <Lock size={13} aria-hidden="true" className="flex-shrink-0 text-muted-soft" />
                    ) : null}
                  </Link>
                  {item.locked && item.lockReason ? (
                    <p className="px-3 pb-1.5 pt-0.5 text-[11px] leading-snug text-muted-soft">
                      {item.lockReason}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

type DashboardSidebarProps = {
  groups: NavGroup[];
  activeHref: string;
  user: SidebarUser | null;
  onLogout: () => void;
};

export default function DashboardSidebar({ groups, activeHref, user, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-sidebar lg:flex">
      <div className="flex h-16 flex-shrink-0 items-center border-b border-line px-5">
        <Logo href="/" height={26} />
      </div>

      <NavList groups={groups} activeHref={activeHref} />

      <div className="flex-shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
            {user ? user.initials : "…"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">
              {user?.name || "Loading…"}
            </p>
            <p className="truncate text-[11.5px] text-muted">
              {user?.accountLabel || ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold text-muted transition hover:bg-danger-bg hover:text-error"
        >
          <LogOut size={17} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
