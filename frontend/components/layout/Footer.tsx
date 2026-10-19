"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { site } from "@/lib/constants";
import styles from "./Footer.module.css";

/**
 * Site footer. Off the home page every link is a real route; on the home
 * page the same destinations resolve to their in-page sections, so the
 * footer never dead-ends on an anchor that does not exist.
 */
const quickLinks = [
  { label: "Home", href: "/", anchor: "#home" },
  { label: "About Us", href: "/about", anchor: "#about" },
  { label: "How It Works", href: "/how-it-works", anchor: "#how-it-works" },
  { label: "Services", href: "/services", anchor: "#services" },
  { label: "Contact Us", href: "/contact", anchor: "#contact" },
];

const opportunityLinks = [
  { label: "Find Jobs", href: "/jobs", anchor: "#latest-jobs" },
  { label: "Government Jobs", href: "/jobs?category=government", anchor: "#latest-jobs" },
  { label: "Internships", href: "/jobs?category=internship", anchor: "#latest-jobs" },
  { label: "Industrial Attachments", href: "/jobs?category=attachment", anchor: "#latest-jobs" },
  { label: "Online Tasks", href: "/#online-tasks", anchor: "#online-tasks" },
];

const employerLinks = [
  { label: "Post a Job", href: "/employer/dashboard/jobs/new" },
  { label: "Employer Registration", href: "/register" },
  { label: "Help Centre", href: "/help" },
  { label: "Contact Support", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Community Guidelines", href: "/community-guidelines" },
  { label: "Safety & Reporting", href: "/safety" },
];

export default function Footer() {
  const onHome = usePathname() === "/";
  const resolve = (link: { href: string; anchor?: string }) =>
    onHome && link.anchor ? link.anchor : link.href;

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.inner}>
        {/* Column 1 — brand */}
        <div className={styles.brandCol}>
          <div className={styles.logoBacking}>
            <Logo height={48} href={onHome ? "#home" : "/"} />
          </div>
          <p className={styles.brandText}>{site.description}</p>
        </div>

        {/* Column 2 — quick links */}
        <nav className={styles.col} aria-label="Quick links">
          <h3 className={styles.heading}>Quick Links</h3>
          <ul className={styles.list}>
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link href={resolve(link)} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Column 3 — opportunities */}
        <nav className={styles.col} aria-label="Opportunities">
          <h3 className={styles.heading}>Opportunities</h3>
          <ul className={styles.list}>
            {opportunityLinks.map((link) => (
              <li key={link.label}>
                <Link href={resolve(link)} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Column 4 — employers & support */}
        <nav className={styles.col} aria-label="For employers and support">
          <h3 className={styles.heading}>For Employers</h3>
          <ul className={styles.list}>
            {employerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.contactNote}>
            {site.contact.email}
            <br />
            {site.contact.location}
          </p>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {site.copyrightYear} KaziHub KE. All rights reserved.
        </p>
        <div className={styles.legal}>
          {legalLinks.map((link) => (
            <Link key={link.label} href={link.href} className={styles.legalLink}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
