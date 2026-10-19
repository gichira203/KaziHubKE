"use client";

/**
 * NotificationMenu — bell + unread count in the topbar, opening a dropdown
 * panel. Notifications are derived from real account state (see
 * dashboard-service); a brand-new account with nothing pending shows the
 * empty state, never fabricated messages.
 */
import { useEffect, useRef, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { cx } from "@/lib/cx";
import type { DashboardNotification } from "@/lib/dashboard-service";
import EmptyState from "./EmptyState";

type NotificationMenuProps = {
  notifications: DashboardNotification[];
};

export default function NotificationMenu({ notifications }: NotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unreadCount > 0 ? `Notifications — ${unreadCount} unread` : "Notifications"}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
      >
        {unreadCount > 0 ? <BellRing size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13.5px] font-bold text-ink">Notifications</p>
            {unreadCount > 0 ? (
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-accent">
                {unreadCount} unread
              </span>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="Reminders about email verification, profile completion and application updates will appear here."
            />
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <a
                    href={notification.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-line bg-surface p-3 transition hover:border-brand hover:bg-white"
                  >
                    <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                      {notification.unread ? (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-label="Unread" />
                      ) : null}
                      {notification.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{notification.body}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className={cx("mt-3 border-t border-line pt-2.5 text-[11.5px] leading-snug text-muted")}>
            Generated from your account state in this browser — not server-delivered messages.
          </p>
        </div>
      ) : null}
    </div>
  );
}
