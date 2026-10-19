/**
 * Site-wide constants: branding, navigation and disclosure copy.
 * `navLinks` carries BOTH a route (used off the home page) and an anchor
 * (used on the home page, whose sections are the same destinations).
 * Mock figures are clearly labelled as sample data (see `sampleStats`).
 */

export const site = {
  name: "KaziHub KE",
  tagline: "Your gateway to jobs and online opportunities.",
  copyrightYear: 2026,
  description:
    "KaziHub KE connects job seekers, students, employers and online earners with jobs, internships, industrial attachments, government vacancies and eligible digital microtasks — all in one place.",
  contact: {
    email: "hello@kazihub.co.ke",
    phone: "+254 700 000 000",
    location: "Nairobi, Kenya",
  },
} as const;

export const navLinks = [
  { label: "Home", href: "/", anchor: "#home" },
  { label: "About Us", href: "/about", anchor: "#about" },
  { label: "How It Works", href: "/how-it-works", anchor: "#how-it-works" },
  { label: "Services", href: "/services", anchor: "#services" },
  { label: "Find Jobs", href: "/jobs", anchor: "#latest-jobs" },
  { label: "Contact Us", href: "/contact", anchor: "#contact" },
] as const;

/** Sample statistics shown on the hero and about sections. Replace with real API data. */
export const sampleStats = {
  jobsListed: 1240,
  opportunities: 3860,
  registeredUsers: 24500,
} as const;

export const sampleValueStats = [
  {
    value: "9",
    label: "Opportunity categories",
    note: "Jobs, attachments, government roles and online tasks",
  },
  {
    value: "47",
    label: "Counties covered",
    note: "Opportunities from across Kenya",
  },
  {
    value: "24/7",
    label: "Mobile-friendly access",
    note: "Browse and apply from any device",
  },
] as const;

export const disclaimers = {
  jobs:
    "Demonstration data: these are sample listings for this frontend preview, not verified live vacancies.",
  tasks:
    "Demonstration data: rewards, eligibility and availability are sample values. Task verification and payouts require a secure backend.",
} as const;
