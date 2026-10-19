import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { sampleValueStats } from "@/lib/constants";
import styles from "./AboutUs.module.css";

export default function AboutUs() {
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
            {sampleValueStats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statNote}>{stat.note}</p>
              </div>
            ))}
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
