"use client";

/**
 * Job seeker onboarding wizard — 8 steps.
 *
 * State lives here so navigating backwards preserves everything. Drafts are
 * written to session storage on every change (passwords never included — the
 * draft shape has none). Validation is per step: required fields block Continue,
 * optional sections can be skipped.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PersonalInformation from "@/components/onboarding/job-seeker/PersonalInformation";
import EmploymentPreferences from "@/components/onboarding/job-seeker/EmploymentPreferences";
import EducationForm from "@/components/onboarding/job-seeker/EducationForm";
import WorkExperienceForm from "@/components/onboarding/job-seeker/WorkExperienceForm";
import SkillsCertifications from "@/components/onboarding/job-seeker/SkillsCertifications";
import CVUpload from "@/components/onboarding/job-seeker/CVUpload";
import CVBuilder from "@/components/onboarding/job-seeker/CVBuilder";
import NotificationPreferences from "@/components/onboarding/job-seeker/NotificationPreferences";
import ProfileReview from "@/components/onboarding/job-seeker/ProfileReview";
import { readJobSeekerDraft, writeJobSeekerDraft } from "@/lib/draft-storage";
import { emptyJobSeekerDraft, type JobSeekerDraft } from "@/lib/onboarding-types";
import { validateName, validatePhone } from "@/lib/validation";
import styles from "./JobSeekerOnboarding.module.css";

const STEP_LABELS = [
  "Personal info",
  "Preferences",
  "Education",
  "Experience",
  "Skills",
  "CV",
  "Visibility",
  "Review",
];

export default function JobSeekerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draft, setDraft] = useState<JobSeekerDraft>(() => readJobSeekerDraft(emptyJobSeekerDraft()));
  const [showBuilder, setShowBuilder] = useState(false);
  const [saving, setSaving] = useState(false);

  // Persist the draft on every change. The storage layer strips sensitive keys.
  useEffect(() => {
    writeJobSeekerDraft(draft);
  }, [draft]);

  const update = (patch: Partial<JobSeekerDraft>) => setDraft((previous) => ({ ...previous, ...patch }));

  /** Per-step blocking validation. Returns the first error message, if any. */
  const stepErrors = useMemo(() => {
    switch (step) {
      case 1: {
        if (validateName(draft.personal.firstName, "first name")) return "Add your first name.";
        if (validateName(draft.personal.lastName, "last name")) return "Add your last name.";
        if (draft.personal.phone && validatePhone(draft.personal.phone)) return "Check your phone number.";
        return null;
      }
      case 2:
        return draft.employment.employmentTypes.length > 0
          ? null
          : "Select at least one employment type.";
      case 6:
        return draft.cv.method === "upload" && !draft.cv.upload
          ? "Upload a file or choose another way to create your CV."
          : null;
      default:
        return null;
    }
  }, [step, draft]);

  const goNext = () => {
    if (stepErrors) return;
    setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
    setStep((previous) => Math.min(previous + 1, STEP_LABELS.length));
  };

  const goBack = () => setStep((previous) => Math.max(previous - 1, 1));

  const saveAndExit = () => {
    setSaving(true);
    writeJobSeekerDraft(draft);
    // Backend integration point: POST apiEndpoints.profileJobSeeker.
    window.setTimeout(() => {
      setSaving(false);
      router.push("/dashboard");
    }, 500);
  };

  const finish = () => {
    setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
    router.push("/dashboard");
  };

  return (
    <OnboardingLayout
      eyebrow="Job seeker profile"
      heading="Welcome to KaziHub KE. Let's prepare your profile for better opportunities."
      subheading="Eight short steps. Skip anything optional and come back to it later — you are never locked out."
      steps={STEP_LABELS}
      currentStep={step}
      completedSteps={completedSteps}
      onStepSelect={setStep}
      onBack={goBack}
      onNext={step === STEP_LABELS.length ? finish : goNext}
      onSaveAndExit={saveAndExit}
      nextLabel={step === STEP_LABELS.length ? "Complete profile" : "Continue"}
      nextDisabled={Boolean(stepErrors)}
      saving={saving}
    >
      <div className={styles.stepBody}>
        {step === 1 ? (
          <PersonalInformation value={draft.personal} onChange={(personal) => update({ personal })} />
        ) : null}

        {step === 2 ? (
          <EmploymentPreferences value={draft.employment} onChange={(employment) => update({ employment })} />
        ) : null}

        {step === 3 ? (
          <EducationForm entries={draft.education} onChange={(education) => update({ education })} />
        ) : null}

        {step === 4 ? (
          <WorkExperienceForm
            entries={draft.experience}
            noExperience={draft.noExperience}
            onChange={(experience, noExperience) => update({ experience, noExperience })}
          />
        ) : null}

        {step === 5 ? (
          <SkillsCertifications value={draft.skills} onChange={(skills) => update({ skills })} />
        ) : null}

        {step === 6 ? (
          showBuilder ? (
            <CVBuilder
              personal={draft.personal}
              education={draft.education}
              experience={draft.experience}
              skills={draft.skills}
              summary={draft.cv.professionalSummary}
              onSummaryChange={(professionalSummary) =>
                update({ cv: { ...draft.cv, professionalSummary, method: "build" } })
              }
              onSaveDraft={() =>
                update({ cv: { ...draft.cv, draftSavedAt: new Date().toISOString() } })
              }
              onClose={() => setShowBuilder(false)}
            />
          ) : (
            <CVUpload
              value={draft.cv}
              onChange={(cv) => update({ cv })}
              onOpenBuilder={() => setShowBuilder(true)}
            />
          )
        ) : null}

        {step === 7 ? (
          <NotificationPreferences
            value={draft.notifications}
            onChange={(notifications) => update({ notifications })}
          />
        ) : null}

        {step === 8 ? (
          <ProfileReview draft={draft} completedSteps={completedSteps} />
        ) : null}

        {stepErrors ? (
          <p className={styles.stepError} role="alert">
            {stepErrors}
          </p>
        ) : null}
      </div>
    </OnboardingLayout>
  );
}
