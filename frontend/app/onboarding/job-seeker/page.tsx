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
import { readSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { mergeCvAutofill } from "@/lib/cv-service";
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
  const [saveError, setSaveError] = useState("");

  // Name and email were already collected at registration; carry that identity
  // into the profile so the seeker does not have to type the name again.
  useEffect(() => {
    const account = readSession();
    let active = true;
    apiRequest<{ profile: JobSeekerDraft | null }>("/profile")
      .then(({ profile }) => {
        if (!active) return;
        const saved = profile ?? readJobSeekerDraft(emptyJobSeekerDraft());
        setDraft((current) => {
          const merged = {
            ...emptyJobSeekerDraft(),
            ...current,
            ...saved,
            personal: {
              ...emptyJobSeekerDraft().personal,
              ...current.personal,
              ...saved.personal,
              firstName: account?.accountType === "job-seeker" ? account.firstName : saved.personal?.firstName ?? "",
              lastName: account?.accountType === "job-seeker" ? account.lastName : saved.personal?.lastName ?? "",
            },
          };
          if (profile) writeJobSeekerDraft(profile);
          return merged;
        });
      })
      .catch((error: unknown) => {
        if (active) setSaveError(error instanceof Error ? error.message : "Could not load your saved profile.");
      });
    return () => { active = false; };
  }, []);

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

  const persistProfile = async () => {
    await apiRequest("/profile/job-seeker", {
      method: "PUT",
      body: JSON.stringify(draft),
    });
    writeJobSeekerDraft(draft);
  };

  const saveAndExit = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await persistProfile();
      router.push("/dashboard");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await persistProfile();
      setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
      router.push("/dashboard");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      eyebrow="Job seeker profile"
      heading="Welcome to KaziHub KE. Let's prepare your profile for better opportunities."
      subheading="Your name is filled from registration. Add only the career details you want employers to see; optional sections can wait."
      steps={STEP_LABELS}
      currentStep={step}
      completedSteps={completedSteps}
      onStepSelect={setStep}
      onBack={goBack}
      onNext={step === STEP_LABELS.length ? finish : goNext}
      onSaveAndExit={saveAndExit}
      nextLabel={step === STEP_LABELS.length ? "Complete profile" : "Continue"}
      nextDisabled={Boolean(stepErrors) || saving}
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
              onAutofill={(suggestions) => setDraft((current) => mergeCvAutofill(current, suggestions))}
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
        {saveError ? <p className={styles.stepError} role="alert">{saveError}</p> : null}
      </div>
    </OnboardingLayout>
  );
}
