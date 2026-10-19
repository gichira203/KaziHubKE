"use client";

/**
 * Employer onboarding wizard — 5 steps.
 * State lives here; drafts persist to session storage. Passwords are never
 * written to the draft (the storage layer also strips them as defence in depth).
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import EmployerAccountForm from "@/components/onboarding/employer/EmployerAccountForm";
import CompanyInformation from "@/components/onboarding/employer/CompanyInformation";
import RecruitmentPreferences from "@/components/onboarding/employer/RecruitmentPreferences";
import VerificationStatus from "@/components/onboarding/employer/VerificationStatus";
import EmployerProfileReview from "@/components/onboarding/employer/EmployerProfileReview";
import { readEmployerDraft, writeEmployerDraft } from "@/lib/draft-storage";
import { emptyEmployerDraft, type EmployerDraft } from "@/lib/onboarding-types";
import { validateEmail, validateName, validatePassword, validatePasswordConfirm, validatePhone, validateUrl } from "@/lib/validation";
import styles from "./EmployerOnboarding.module.css";

const STEP_LABELS = ["Account", "Organization", "Recruitment", "Verification", "Review"];

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draft, setDraft] = useState<EmployerDraft>(() => readEmployerDraft(emptyEmployerDraft()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Strip the password pair before persisting — defence in depth on top of
    // the storage layer's own sanitisation.
    const { password, confirmPassword, ...rest } = draft.account;
    void password;
    void confirmPassword;
    writeEmployerDraft({ ...draft, account: { ...rest, password: "", confirmPassword: "" } });
  }, [draft]);

  const update = (patch: Partial<EmployerDraft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const stepErrors = useMemo(() => {
    switch (step) {
      case 1: {
        const { firstName, lastName, workEmail, phone, password, confirmPassword } = draft.account;
        if (validateName(firstName, "first name")) return "Add the contact person's first name.";
        if (validateName(lastName, "last name")) return "Add the contact person's last name.";
        if (validateEmail(workEmail)) return "Enter a valid work email address.";
        if (!phone.trim()) return "Enter your business phone number.";
        if (validatePhone(phone)) return "Check your business phone number.";
        if (validatePassword(password)) return "Choose a password that meets the requirements.";
        if (validatePasswordConfirm(password, confirmPassword)) return "Make sure both passwords match.";
        return null;
      }
      case 2: {
        if (!draft.company.companyName.trim()) return "Enter your company or organization name.";
        if (!draft.company.organizationType) return "Select an organization type.";
        if (!draft.company.industry) return "Select an industry.";
        if (validateUrl(draft.company.website, "website link")) return "Check your company website URL.";
        return null;
      }
      case 3: {
        if (draft.recruitment.hiringCategories.length === 0) {
          return "Select at least one hiring category.";
        }
        return null;
      }
      default:
        return null;
    }
  }, [step, draft]);

  const goNext = () => {
    if (stepErrors) return;
    setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
    setStep((previous) => Math.min(previous + 1, STEP_LABELS.length));
  };

  const saveAndExit = () => {
    setSaving(true);
    // Backend integration point: POST apiEndpoints.profileEmployer.
    window.setTimeout(() => {
      setSaving(false);
      router.push("/employer/dashboard");
    }, 500);
  };

  const finish = () => {
    setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
    router.push("/employer/dashboard");
  };

  return (
    <OnboardingLayout
      eyebrow="Employer profile"
      heading="Set up your organization to start hiring."
      subheading="Five short steps. Verification unlocks job posting — you can prepare everything now and submit when ready."
      steps={STEP_LABELS}
      currentStep={step}
      completedSteps={completedSteps}
      onStepSelect={setStep}
      exitHref="/employer/dashboard"
      onBack={() => setStep((previous) => Math.max(previous - 1, 1))}
      onNext={step === STEP_LABELS.length ? finish : goNext}
      onSaveAndExit={saveAndExit}
      nextLabel={step === STEP_LABELS.length ? "Complete profile" : "Continue"}
      nextDisabled={Boolean(stepErrors)}
      saving={saving}
    >
      <div className={styles.stepBody}>
        {step === 1 ? (
          <EmployerAccountForm
            value={draft.account}
            onChange={(account) => update({ account })}
          />
        ) : null}

        {step === 2 ? (
          <CompanyInformation value={draft.company} onChange={(company) => update({ company })} />
        ) : null}

        {step === 3 ? (
          <RecruitmentPreferences
            value={draft.recruitment}
            onChange={(recruitment) => update({ recruitment })}
          />
        ) : null}

        {step === 4 ? (
          <VerificationStatus
            value={draft.verification}
            onChange={(verification) => update({ verification })}
          />
        ) : null}

        {step === 5 ? <EmployerProfileReview draft={draft} /> : null}

        {stepErrors ? (
          <p className={styles.stepError} role="alert">
            {stepErrors}
          </p>
        ) : null}
      </div>
    </OnboardingLayout>
  );
}
