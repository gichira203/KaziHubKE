import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Flag } from "lucide-react";
import InfoShell from "@/components/layout/InfoShell";
import { safetyPractices, safetySigns, reportingSteps } from "@/data/legal";
import { site } from "@/lib/constants";
import styles from "./safety.module.css";

export const metadata: Metadata = {
  title: "Safety & Reporting — KaziHub KE",
  description:
    "How to spot fraudulent job listings and task scams, protect your personal data, and report suspicious content on KaziHub KE.",
};

export default function SafetyPage() {
  return (
    <InfoShell
      eyebrow="Trust & Safety"
      title="Stay safe while job hunting"
      description="Most opportunities on KaziHub KE are genuine — but job scams exist everywhere. Here is how to recognise them, protect yourself, and report what you see."
    >
      <section className={styles.panelDanger} aria-labelledby="signs-title">
        <h2 id="signs-title" className={styles.panelTitle}>
          <ShieldAlert size={18} aria-hidden="true" />
          Warning signs of a scam
        </h2>
        <ul className={styles.list}>
          {safetySigns.map((sign) => (
            <li key={sign} className={styles.listItem}>
              {sign}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="practices-title">
        <h2 id="practices-title" className={styles.panelTitle}>
          <ShieldCheck size={18} aria-hidden="true" />
          Protect yourself
        </h2>
        <ul className={styles.list}>
          {safetyPractices.map((practice) => (
            <li key={practice} className={styles.listItem}>
              {practice}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="reporting-title">
        <h2 id="reporting-title" className={styles.panelTitle}>
          <Flag size={18} aria-hidden="true" />
          How to report
        </h2>
        <ol className={styles.steps}>
          {reportingSteps.map((step, index) => (
            <li key={step} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <p className={styles.stepText}>{step}</p>
            </li>
          ))}
        </ol>
        <p className={styles.reportNote}>
          Reports and urgent safety concerns can also be emailed to{" "}
          <a href={`mailto:${site.contact.email}`} className={styles.reportLink}>
            {site.contact.email}
          </a>
          . Reporter identities are restricted to authorized reviewers.
        </p>
        <p className={styles.reportNote}>
          See also our{" "}
          <Link href="/community-guidelines" className={styles.reportLink}>
            Community Guidelines
          </Link>{" "}
          for what is not allowed on the platform.
        </p>
      </section>
    </InfoShell>
  );
}
