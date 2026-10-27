"use client";

/**
 * Employer onboarding step 5 — review the organisation profile before finishing.
 */
import { Check, Circle } from "lucide-react";
import { verificationStatusLabels, workModeLabels } from "@/lib/kenya-data";
import type { EmployerDraft } from "@/lib/onboarding-types";
import styles from "./EmployerProfileReview.module.css";

type EmployerProfileReviewProps = {
  draft: EmployerDraft;
};

type SectionState = "complete" | "partial" | "empty";

interface ReviewRow {
  label: string;
  state: SectionState;
  detail: string;
}

const stateText: Record<SectionState, string> = {
  complete: "Complete",
  partial: "In progress",
  empty: "Not started",
};

export default function EmployerProfileReview({ draft }: EmployerProfileReviewProps) {
  const { account, company, recruitment, verification } = draft;

  const filled = (value: string) => Boolean(value.trim());

  const rows: ReviewRow[] = [
    {
      label: "Account details",
      state: filled(account.firstName) && filled(account.workEmail) ? "complete" : "partial",
      detail: [account.firstName, account.lastName].filter(Boolean).join(" ") + (account.workEmail ? ` · ${account.workEmail}` : ""),
    },
    {
      label: "Organization",
      state: filled(company.companyName) && filled(company.industry) ? "complete" : "partial",
      detail: [company.companyName, company.organizationType, company.industry].filter(Boolean).join(" · ") || "Add your company name and industry",
    },
    {
      label: "Location",
      state: filled(company.county) ? "complete" : "empty",
      detail: [company.city, company.county, company.country].filter(Boolean).join(", ") || "Add your county",
    },
    {
      label: "Recruitment information",
      state: recruitment.hiringCategories.length > 0 ? "complete" : "empty",
      detail: recruitment.hiringCategories.length
        ? `${recruitment.hiringCategories.join(", ")}${recruitment.workMode ? ` · ${workModeLabels[recruitment.workMode]}` : ""}`
        : "Add the categories you hire for",
    },
    {
      label: "Verification",
      state: verification.status === "verified" ? "complete" : "empty",
      detail: `${verificationStatusLabels[verification.status]}${verification.documentName ? ` · ${verification.documentName} staged` : ""}`,
    },
  ];

  const completedCount = rows.filter((row) => row.state === "complete").length;
  const percent = Math.round((completedCount / rows.length) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Review &amp; finish
        </h2>
        <p className={styles.lead}>
          Check your organization profile. You can edit any section later from
          your dashboard.
        </p>
      </div>

      <div className={styles.meter}>
        <div className={styles.meterHeader}>
          <p className={styles.meterLabel}>Profile completion</p>
          <p className={styles.meterValue}>{percent}%</p>
        </div>
        <div
          className={styles.meterTrack}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Employer profile completion"
        >
          <span className={styles.meterFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.label} className={styles.row}>
            <span className={`${styles.stateIcon} ${styles[`state_${row.state}`]}`} aria-hidden="true">
              {row.state === "complete" ? <Check size={13} /> : <Circle size={11} />}
            </span>
            <div className={styles.rowMain}>
              <p className={styles.rowLabel}>
                {row.label}
                <span className={styles.stateText}>{stateText[row.state]}</span>
              </p>
              <p className={styles.rowDetail}>{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.nextCard}>
        <p className={styles.nextTitle}>What happens next</p>
        <ol className={styles.nextList}>
          <li>Your organization profile is saved to your dashboard.</li>
          <li>Submit organization evidence in the verification centre for administrator review.</li>
          <li>After verification, vacancies can be submitted for moderation and candidate search is enabled.</li>
        </ol>
        <p className={styles.nextNote}>Your profile can be edited later from the employer dashboard.</p>
      </div>
    </div>
  );
}
