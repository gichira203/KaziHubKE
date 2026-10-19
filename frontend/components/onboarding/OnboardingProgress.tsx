"use client";

/**
 * Step indicator. Desktop shows every step with its state (done / current /
 * upcoming); mobile shows "Step 3 of 8" plus a compact progress bar. Completed
 * steps are clickable so users can jump back to anything they have finished.
 */
import { Check } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./OnboardingProgress.module.css";

type OnboardingProgressProps = {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  onStepSelect: (step: number) => void;
};

export default function OnboardingProgress({
  steps,
  currentStep,
  completedSteps,
  onStepSelect,
}: OnboardingProgressProps) {
  const percent = Math.round((currentStep / steps.length) * 100);

  return (
    <div className={styles.wrapper}>
      {/* ---- mobile: compact indicator ---- */}
      <div className={styles.mobile}>
        <p className={styles.mobileLabel} aria-live="polite">
          Step {currentStep} of {steps.length}
          <span className={styles.mobileStepName}> · {steps[currentStep - 1]}</span>
        </p>
        <div
          className={styles.mobileTrack}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Onboarding progress: step ${currentStep} of ${steps.length}`}
        >
          <span className={styles.mobileFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* ---- desktop: full step list ---- */}
      <ol className={styles.steps}>
        {steps.map((label, index) => {
          const step = index + 1;
          const isCurrent = step === currentStep;
          const isDone = completedSteps.includes(step);
          const clickable = isDone || step < currentStep;

          return (
            <li key={label} className={styles.stepItem}>
              <button
                type="button"
                className={cx(
                  styles.step,
                  isCurrent && styles.stepCurrent,
                  isDone && styles.stepDone,
                  clickable && styles.stepClickable,
                )}
                onClick={() => clickable && onStepSelect(step)}
                disabled={!clickable}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className={cx(styles.marker, isDone && styles.markerDone, isCurrent && styles.markerCurrent)}>
                  {isDone ? <Check size={13} aria-hidden="true" /> : step}
                </span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
