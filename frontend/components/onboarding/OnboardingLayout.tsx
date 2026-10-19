"use client";

/**
 * Shell for the onboarding wizard: header with logo + progress, the current
 * step panel, and step navigation (Back / Continue / Save & finish later).
 *
 * Step data lives in the parent page so navigating backwards preserves what was
 * already typed. Drafts are persisted through lib/draft-storage.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Logo from "@/components/common/Logo";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import OnboardingProgress from "./OnboardingProgress";
import styles from "./OnboardingLayout.module.css";

type OnboardingLayoutProps = {
  /** e.g. "Job Seeker Profile" — drives the header title. */
  eyebrow: string;
  heading: string;
  subheading: string;
  /** Step labels in order, e.g. ["Personal info", …]. */
  steps: string[];
  currentStep: number;
  /** Steps the user has completed (shown with a tick in the progress bar). */
  completedSteps: number[];
  onStepSelect: (step: number) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveAndExit: () => void;
  nextLabel: string;
  /** Disable Continue while the step has blocking errors. */
  nextDisabled?: boolean;
  saving?: boolean;
  /** Where "Save & exit" goes — employer onboarding exits to its dashboard. */
  exitHref?: string;
  children: ReactNode;
};

export default function OnboardingLayout({
  eyebrow,
  heading,
  subheading,
  steps,
  currentStep,
  completedSteps,
  onStepSelect,
  onBack,
  onNext,
  onSaveAndExit,
  nextLabel,
  nextDisabled = false,
  saving = false,
  exitHref = "/dashboard",
  children,
}: OnboardingLayoutProps) {
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo href="/" height={34} />
          <Link className={styles.exitLink} href={exitHref}>
            Save &amp; exit
          </Link>
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <div className={styles.container}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.heading}>{heading}</h1>
            <p className={styles.subheading}>{subheading}</p>
          </div>

          <OnboardingProgress
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepSelect={onStepSelect}
          />

          <section className={styles.panel} aria-labelledby="onboarding-step-title">
            {children}
          </section>

          <nav className={styles.actions} aria-label="Onboarding navigation">
            <button
              type="button"
              className={styles.secondary}
              onClick={onBack}
              disabled={isFirstStep}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>

            <div className={styles.actionsRight}>
              <button
                type="button"
                className={styles.ghost}
                onClick={onSaveAndExit}
                disabled={saving}
              >
                {saving ? (
                  <LoadingSpinner size={14} label="Saving" />
                ) : (
                  <Save size={16} aria-hidden="true" />
                )}
                {saving ? "Saving…" : "Save & finish later"}
              </button>

              <button
                type="button"
                className={styles.primary}
                onClick={onNext}
                disabled={nextDisabled}
              >
                {nextLabel}
                {isLastStep ? null : <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </div>
          </nav>

          <p className={styles.footNote}>
            You can skip optional steps and come back to them any time from your
            dashboard. Nothing is shared with employers until your profile is
            complete.
          </p>
        </div>
      </main>
    </div>
  );
}
