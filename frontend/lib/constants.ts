/**
 * Site-wide constants: branding, navigation and disclosure copy.
 * `navLinks` carries BOTH a route (used off the home page) and an anchor
 * (used on the home page, whose sections are the same destinations).
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

export const disclaimers = {
  jobs:
    "Only published listings stored on KaziHub KE are shown. Confirm vacancy details with the hiring organization before applying.",
  tasks:
    "Rewards are credited after a submission is approved. Withdrawal requests are processed manually; automated M-Pesa payouts are not enabled.",
} as const;
