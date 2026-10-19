"use client";

/**
 * MobileDashboardMenu — accessible slide-in drawer for phones and tablets.
 * Closes on Escape, backdrop click and after any navigation; the page behind
 * it is scroll-locked while it is open.
 */
import { useEffect } from "react";
import { X } from "lucide-react";
import Logo from "@/components/common/Logo";
import { NavList, type NavGroup, type SidebarUser } from "./DashboardSidebar";

type MobileDashboardMenuProps = {
  open: boolean;
  onClose: () => void;
  groups: NavGroup[];
  activeHref: string;
  user: SidebarUser | null;
};

export default function MobileDashboardMenu({
  open,
  onClose,
  groups,
  activeHref,
  user,
}: MobileDashboardMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard navigation"
        className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-sidebar"
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-line px-4">
          <Logo href="/" height={24} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <NavList groups={groups} activeHref={activeHref} onNavigate={onClose} />

        <div className="flex-shrink-0 border-t border-line p-4">
          <p className="truncate text-[13px] font-semibold text-ink">{user?.name || "Loading…"}</p>
          <p className="truncate text-[11.5px] text-muted">{user?.accountLabel || ""}</p>
        </div>
      </div>
    </div>
  );
}
