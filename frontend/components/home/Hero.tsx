"use client";

import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  GraduationCap,
  Landmark,
  MousePointerClick,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import { sampleStats } from "@/lib/constants";
import styles from "./Hero.module.css";

/** Compact highlight strip that sits inside the green hero, under the CTAs. */
const highlights = [
  { label: "Online Jobs", note: "Remote & freelance roles", icon: Briefcase },
  { label: "Internships", note: "For students & graduates", icon: GraduationCap },
  { label: "Gov Vacancies", note: "Public-sector openings", icon: Landmark },
  { label: "Microtasks", note: "Eligible digital tasks", icon: MousePointerClick },
];

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [count, setCount] = useState(0);
  const finalCount = sampleStats.registeredUsers;

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredView) return;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 4;
      setCount(Math.round(finalCount * easedProgress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hasEnteredView, finalCount]);

  const stats = [
    { label: "Jobs listed", value: sampleStats.jobsListed, icon: Briefcase },
    { label: "Opportunities", value: sampleStats.opportunities, icon: Layers },
    { label: "Registered users", value: sampleStats.registeredUsers, icon: Users },
  ];

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

      {/* Statistics band — full width, below the fold */}
      <div className={styles.statsBand} ref={statsRef}>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div className={styles.stat} key={stat.label}>
              <stat.icon className={styles.statIcon} size={24} aria-hidden="true" />
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>
                {(hasEnteredView
                  ? Math.round(count * (stat.value / finalCount))
                  : 0
                ).toLocaleString("en-KE")}
                +
              </dd>
              <p className={styles.statNote}>Sample data</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
