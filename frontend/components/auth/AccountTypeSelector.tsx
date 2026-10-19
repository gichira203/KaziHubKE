"use client";

/**
 * The registration entry question: "What would you like to do on KaziHub KE?"
 * Two large selectable cards (job seeker / employer).
 *
 * Selecting a card only records the intent for this flow — it creates no
 * account. The choice is kept in session storage and preselects the account
 * type on the email registration form.
 */
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./AccountTypeSelector.module.css";

type AccountTypeSelectorProps = {
  value: "job-seeker" | "employer" | null;
  onChange: (value: "job-seeker" | "employer") => void;
};

const options = [
  {
    id: "job-seeker" as const,
    icon: Briefcase,
    title: "Looking for a Job",
    description: "Discover jobs, internships, industrial attachments, remote work, and career opportunities.",
    benefits: [
      "Jobs, internships and attachments across all 47 counties",
      "Remote, freelance and online microtask opportunities",
      "Build a profile and CV employers can find",
    ],
    cta: "Find Opportunities",
  },
  {
    id: "employer" as const,
    icon: Building2,
    title: "Posting a Job",
    description: "Find qualified candidates, publish vacancies, and manage recruitment.",
    benefits: [
      "Publish vacancies and manage applications",
      "Search candidate profiles that match your needs",
      "Track hiring from one dashboard",
    ],
    cta: "Register as an Employer",
  },
];

export default function AccountTypeSelector({ value, onChange }: AccountTypeSelectorProps) {
  return (
    <div className={styles.wrapper} role="radiogroup" aria-label="What would you like to do on KaziHub KE?">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cx(styles.card, selected && styles.cardSelected)}
            onClick={() => onChange(option.id)}
          >
            <span className={cx(styles.iconWrap, selected && styles.iconWrapSelected)}>
              <option.icon size={22} aria-hidden="true" />
            </span>

            <span className={styles.body}>
              <span className={styles.title}>{option.title}</span>
              <span className={styles.description}>{option.description}</span>

              <ul className={styles.benefits}>
                {option.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <span className={cx(styles.cta, selected && styles.ctaSelected)}>
                {option.cta}
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
