"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { apiRequest } from "@/lib/api";
import styles from "./AboutUs.module.css";

type PlatformStats = { registeredUsers: number; publishedJobs: number };

export default function AboutUs() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<PlatformStats>("/platform/stats")
      .then((result) => { if (active) setStats(result); })
      .catch(() => { if (active) setStats(null); });
    return () => { active = false; };
  }, []);

  return (
    <section className={styles.section} id="about" aria-labelledby="about-title">
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>About KaziHub KE</p>
          <h2 className={styles.title} id="about-title">
            Connecting people with real opportunities across Kenya
          </h2>
          <p className={styles.text}>
            KaziHub KE is a digital platform built to connect job seekers, students,
            employers and online earners. We bring employment, internships, industrial
            attachments, government vacancies and eligible online microtasks into one
            clear, mobile-friendly place — so that whether you are starting your career
            or looking for flexible digital work, the next step is easy to find.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <p className={styles.statValue}>{stats ? stats.registeredUsers.toLocaleString() : "—"}</p>
              <p className={styles.statLabel}>Registered users</p>
              <p className={styles.statNote}>KaziHub community members</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statValue}>{stats ? stats.publishedJobs.toLocaleString() : "—"}</p>
              <p className={styles.statLabel}>Current jobs</p>
              <p className={styles.statNote}>Published listings accepting applications</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>More opportunities</p>
              <p className={styles.statNote}>Browse jobs from MyJobMag Kenya</p>
              <a href="https://www.myjobmag.co.ke/" target="_blank" rel="noopener noreferrer">Visit MyJobMag →</a>
            </div>
          </div>

          <Button href="#services" variant="primary" size="lg" className={styles.cta}>
            Browse Opportunities
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>

        <div className={styles.media}>
          <Image
            src="/images/about-img.jpg"
            alt="A young professional smiling at her laptop while working from her home office desk"
            width={735}
            height={490}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
