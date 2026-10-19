"use client";

/**
 * DashboardTopbar — sticky compact top bar: page title, search, help,
 * notifications and the account menu. On mobile it also carries the drawer
 * trigger and a compact logo.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, CircleQuestionMark, Menu, User, LogOut, type LucideIcon } from "lucide-react";
import Logo from "@/components/common/Logo";
import SearchInput from "@/components/common/SearchInput";
import NotificationMenu from "./NotificationMenu";
import type { DashboardNotification } from "@/lib/dashboard-service";
import type { SidebarUser } from "./DashboardSidebar";

type DashboardTopbarProps = {
  title: string;
  search?: {
    placeholder: string;
    ariaLabel: string;
    onSubmit: (query: string) => void;
  };
  notifications: DashboardNotification[];
  user: SidebarUser | null;
  helpHref: string;
  profileHref: string;
  settingsHref: string;
  onOpenMenu: () => void;
  onLogout: () => void;
};

function AccountMenu({
  user,
  profileHref,
  settingsHref,
  onLogout,
}: {
  user: SidebarUser | null;
  profileHref: string;
  settingsHref: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "My profile", href: profileHref, icon: User },
    { label: "Settings", href: settingsHref, icon: ChevronDown },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        className="flex h-10 items-center gap-2 rounded-lg px-1.5 transition hover:bg-surface"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[12.5px] font-bold text-white">
          {user ? user.initials : "…"}
        </span>
        <span className="hidden max-w-32 truncate text-[13px] font-semibold text-ink sm:block">
          {user?.name || "Loading…"}
        </span>
        <ChevronDown size={15} aria-hidden="true" className="flex-shrink-0 text-muted" />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-line bg-white p-2 shadow-xl">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate text-[13px] font-bold text-ink">{user?.name || "Loading…"}</p>
            <p className="truncate text-[11.5px] text-muted">{user?.email || ""}</p>
          </div>
          <ul className="pt-1.5">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-surface"
                >
                  <item.icon size={15} aria-hidden="true" className="text-muted" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-error transition hover:bg-danger-bg"
              >
                <LogOut size={15} aria-hidden="true" />
                Log out
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardTopbar({
  title,
  search,
  notifications,
  user,
  helpHref,
  profileHref,
  settingsHref,
  onOpenMenu,
  onLogout,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink transition hover:bg-surface lg:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Compact logo on mobile — the sidebar logo is hidden there. */}
        <span className="lg:hidden">
          <Logo href="/" height={24} />
        </span>

        <h1 className="min-w-0 flex-1 truncate text-[16px] font-bold tracking-tight text-ink sm:text-[17px]">
          {title}
        </h1>

        {search ? (
          <SearchInput
            placeholder={search.placeholder}
            ariaLabel={search.ariaLabel}
            onSubmit={search.onSubmit}
            className="hidden w-56 flex-shrink-0 md:block lg:w-72"
          />
        ) : null}

        <Link
          href={helpHref}
          aria-label="Help and support"
          className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink sm:flex"
        >
          <CircleQuestionMark size={18} aria-hidden="true" />
        </Link>

        <NotificationMenu notifications={notifications} />

        <AccountMenu
          user={user}
          profileHref={profileHref}
          settingsHref={settingsHref}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
