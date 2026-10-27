"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/common/Logo";
import Button from "@/components/common/Button";
import { navLinks } from "@/lib/constants";
import styles from "./Navbar.module.css";

/**
 * Sticky top navigation. Desktop shows inline links + Login/Register;
 * mobile shows a hamburger that toggles MobileMenu.
 *
 * On the home page the links are in-page anchors (the sections ARE the
 * destinations); everywhere else they are real routes.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  // Prevent body scroll while the mobile menu overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Logo height={36} className={styles.logo} href={onHome ? "#home" : "/"} />

        {/* Desktop links */}
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={onHome ? link.anchor : link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className={styles.actions}>
          <Button href="/login" variant="outline">
            Login
          </Button>
          <Button href="/register" variant="primary">
            Register
          </Button>
        </div>

        {/* Keep the two most important account actions visible on phones. */}
        <div className={styles.quickActions}>
          <Button href="/login" variant="outline" className={styles.quickLogin}>
            Login
          </Button>
          <Button href="/register" variant="primary" className={styles.quickRegister}>
            Register
          </Button>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className={styles.hamburger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

type MobileMenuProps = {
  onClose: () => void;
};

/** Accessible slide-down mobile menu: links, then Login/Register actions. */
function MobileMenu({ onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onHome = usePathname() === "/";

  // Close on Escape key.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className={styles.mobileMenu}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <ul className={styles.mobileLinks}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={onHome ? link.anchor : link.href} className={styles.mobileLink} onClick={onClose}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.mobileActions}>
        <Button href="/login" variant="outline" onClick={onClose} className="w-full">
          Login
        </Button>
        <Button href="/register" variant="primary" onClick={onClose} className="w-full">
          Register
        </Button>
      </div>
    </div>
  );
}
