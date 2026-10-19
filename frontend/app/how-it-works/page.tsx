import type { Metadata } from "next";
import InfoShell from "@/components/layout/InfoShell";
import Button from "@/components/common/Button";
import { employerSteps, seekerSteps } from "@/data/info";
import styles from "./how-it-works.module.css";

export const metadata: Metadata = {
  title: "How KaziHub KE Works",
  description:
    "From registration to application tracking — see how job seekers, students and employers use KaziHub KE, step by step.",
};

export default function HowItWorksPage() {
  return (
    <InfoShell
      eyebrow="How It Works"
      title="From account to opportunity in four steps"
      description="Whether you are looking for work or hiring, the path is the same: register, complete the basics, then use the tools built for your side of the platform."
    >
      <div className={styles.columns}>
        <section className={styles.panel} aria-labelledby="seekers-title">
          <h2 id="seekers-title" className={styles.panelTitle}>
            For job seekers &amp; students
          </h2>
          <ol className={styles.steps}>
            {seekerSteps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.panel} aria-labelledby="employers-title">
          <h2 id="employers-title" className={styles.panelTitle}>
            For employers
          </h2>
          <ol className={styles.steps}>
            {employerSteps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className={styles.cta}>
        <p className={styles.ctaText}>Ready to get started?</p>
        <Button href="/register" variant="primary">
          Create your account
        </Button>
      </div>
    </InfoShell>
  );
}
