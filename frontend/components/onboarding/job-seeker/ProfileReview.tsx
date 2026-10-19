"use client";

/**
 * Step 8 — Review and finish. Shows completed sections, what is still optional,
 * CV status, and the chosen preferences. Nothing is locked — the dashboard is
 * reachable regardless of what is incomplete.
 */
import { Check, Circle, FileText } from "lucide-react";
import { employmentTypeLabels, workModeLabels } from "@/lib/kenya-data";
import { formatPhoneForDisplay } from "@/lib/validation";
import type { JobSeekerDraft } from "@/lib/onboarding-types";
import styles from "./ProfileReview.module.css";

type ProfileReviewProps = {
  draft: JobSeekerDraft;
  /** Step numbers the user completed, for the completion list. */
  completedSteps: number[];
};

type SectionState = "complete" | "partial" | "empty";

interface ReviewRow {
  label: string;
  state: SectionState;
  detail: string;
}

export default function ProfileReview({ draft, completedSteps }: ProfileReviewProps) {
  const { personal, employment, education, experience, skills, cv, notifications } = draft;

  const filled = (value: string) => Boolean(value.trim());
  const listFilled = (value: string[]) => value.length > 0;

  const rows: ReviewRow[] = [
    {
      label: "Personal information",
      state: filled(personal.firstName) && filled(personal.lastName) && filled(personal.county) ? "complete" : "partial",
      detail: [personal.headline, formatPhoneForDisplay(personal.phone) || personal.phone, personal.county]
        .filter(Boolean)
        .join(" · ") || "Add your name, headline and county",
    },
    {
      label: "Employment preferences",
      state: listFilled(employment.employmentTypes) ? "complete" : "empty",
      detail: listFilled(employment.employmentTypes)
        ? `${employment.employmentTypes.map((t) => employmentTypeLabels[t]).join(", ")}${employment.workMode ? ` · ${workModeLabels[employment.workMode]}` : ""}`
        : "No employment types selected",
    },
    {
      label: "Education",
      state: education.length > 0 ? "complete" : "empty",
      detail: education.length
        ? `${education.length} ${education.length === 1 ? "record" : "records"} added`
        : "Optional — add later from your dashboard",
    },
    {
      label: "Work experience",
      state: experience.length > 0 ? "complete" : "empty",
      detail: experience.length
        ? `${experience.length} ${experience.length === 1 ? "role" : "roles"} added`
        : "Optional — first-time job seekers can skip this",
    },
    {
      label: "Skills & certifications",
      state: listFilled(skills.technicalSkills) || listFilled(skills.professionalSkills) ? "complete" : "empty",
      detail: skills.technicalSkills.length + skills.professionalSkills.length
        ? `${skills.technicalSkills.length + skills.professionalSkills.length} skills added`
        : "Optional — skills help employers find you",
    },
    {
      label: "CV",
      state: cv.method === "upload" && cv.upload ? "complete" : cv.professionalSummary.trim() ? "partial" : "empty",
      detail:
        cv.method === "upload" && cv.upload
          ? `${cv.upload.fileName} uploaded`
          : cv.professionalSummary.trim()
            ? "Manual CV details started"
            : "Optional — upload a CV or fill it in later",
    },
    {
      label: "Visibility & notifications",
      state: notifications.profileVisibleToEmployers || notifications.jobAlertEmails ? "complete" : "partial",
      detail: [
        notifications.profileVisibleToEmployers ? "Profile visible to employers" : "Profile hidden",
        notifications.jobAlertEmails ? `Job alerts (${notifications.frequency})` : "No job alerts",
      ].join(" · "),
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
          Here is a summary of your profile. Optional sections can stay
          incomplete — you can finish them any time from your dashboard.
        </p>
      </div>

      {/* ---- completion meter ---- */}
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
          aria-label="Profile completion"
        >
          <span className={styles.meterFill} style={{ width: `${percent}%` }} />
        </div>
        <p className={styles.meterNote}>
          {completedCount} of {rows.length} sections complete
        </p>
      </div>

      {/* ---- section list ---- */}
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

      {/* ---- CV status ---- */}
      <div className={styles.cvCard}>
        <span className={styles.cvIcon} aria-hidden="true">
          <FileText size={18} />
        </span>
        <div>
          <p className={styles.cvTitle}>CV status</p>
          <p className={styles.cvDetail}>
            {cv.method === "upload" && cv.upload
              ? `Uploaded: ${cv.upload.fileName}`
              : cv.method === "build"
                ? "Being built with the CV builder"
                : "Manual entry in progress"}
          </p>
          <p className={styles.cvHint}>
            You can upload or replace your CV at any time. Employers only see
            what you allow.
          </p>
        </div>
      </div>

      <p className={styles.footerNote}>
        Completed steps: {completedSteps.length ? completedSteps.join(", ") : "none yet"}. You can revisit
        any section from your dashboard.
      </p>
    </div>
  );
}

const stateText: Record<SectionState, string> = {
  complete: "Complete",
  partial: "In progress",
  empty: "Not started",
};
