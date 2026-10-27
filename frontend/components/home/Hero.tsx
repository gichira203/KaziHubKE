"use client";

import {
  Briefcase,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Landmark,
  MousePointerClick,
} from "lucide-react";
import Button from "@/components/common/Button";
import styles from "./Hero.module.css";

/** Compact highlight strip that sits inside the green hero, under the CTAs. */
const highlights = [
  { label: "Online Jobs", note: "Remote & freelance roles", icon: Briefcase },
  { label: "Internships", note: "For students & graduates", icon: GraduationCap },
  { label: "Gov Vacancies", note: "Public-sector openings", icon: Landmark },
  { label: "Microtasks", note: "Eligible digital tasks", icon: MousePointerClick },
];

export default function Hero() {
  return (
    <section className={styles.hero} id="home" aria-labelledby="hero-title">
      {/* The banner image leaves open space on the right for the introduction. */}
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.badge}>
            <Sparkles size={14} aria-hidden="true" />
            Jobs · Internships · Online Opportunities
          </p>

          <h1 className={styles.title} id="hero-title">
            Find Your Next Opportunity with KaziHub KE
          </h1>

          <p className={styles.description}>
            KaziHub KE brings together jobs, internships, industrial attachments,
            government vacancies and eligible online tasks, helping job seekers,
            students and online earners explore opportunities in one place.
          </p>

          <div className={styles.ctas}>
            <Button href="#latest-jobs" variant="primary" size="lg">
              <Briefcase size={18} aria-hidden="true" />
              Find Jobs
            </Button>
            <Button href="#online-tasks" variant="onGreen" size="lg">
              Explore Online Tasks
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>

      </div>

      {/* Highlight strip — white cards overlapping the bottom of the green band */}
      <div className={styles.highlights}>
        {highlights.map((item) => (
          <div className={styles.highlightCard} key={item.label}>
            <item.icon className={styles.highlightIcon} size={25} aria-hidden="true" />
            <h3 className={styles.highlightLabel}>{item.label}</h3>
            <p className={styles.highlightNote}>{item.note}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
