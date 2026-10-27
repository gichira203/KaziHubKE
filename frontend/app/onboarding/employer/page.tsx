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
import { validateName, validateUrl } from "@/lib/validation";
import { apiRequest } from "@/lib/api";
import { readSession } from "@/lib/session";
import PageLoading from "@/components/dashboard/PageLoading";
import StatusMessage from "@/components/common/StatusMessage";
import styles from "./EmployerOnboarding.module.css";

const STEP_LABELS = ["Account", "Organization", "Recruitment", "Verification", "Review"];

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draft, setDraft] = useState<EmployerDraft>(() => readEmployerDraft(emptyEmployerDraft()));
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    const session = readSession();
    apiRequest<{
      profile: EmployerDraft | null;
      verification: { status: string; note: string; submittedAt: string | null };
    }>("/profile")
      .then(({ profile, verification }) => {
        if (!active) return;
        const saved = profile ?? readEmployerDraft(emptyEmployerDraft());
        const base = emptyEmployerDraft();
        setDraft({
          ...base,
          ...saved,
          account: {
            ...base.account,
            ...saved.account,
            firstName: session?.accountType === "employer" ? session.firstName : saved.account?.firstName ?? "",
            lastName: session?.accountType === "employer" ? session.lastName : saved.account?.lastName ?? "",
            workEmail: session?.accountType === "employer" ? session.email : saved.account?.workEmail ?? "",
            password: "",
            confirmPassword: "",
          },
          verification: {
            ...base.verification,
            ...saved.verification,
            status: verification.status === "not-started" ? "not-submitted"
              : verification.status === "submitted" || verification.status === "pending-review" ? "pending-review"
                : verification.status === "action-required" ? "more-info-required"
                  : verification.status as EmployerDraft["verification"]["status"],
            submittedAt: verification.submittedAt ?? "",
            notes: verification.note || saved.verification?.notes || "",
          },
        });
      })
      .catch((error: unknown) => {
        if (active) setSaveError(error instanceof Error ? error.message : "Could not load your saved organization profile.");
      })
      .finally(() => { if (active) setInitialized(true); });
    return () => { active = false; };
  }, []);

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
        const { firstName, lastName, workEmail } = draft.account;
        if (validateName(firstName, "first name")) return "Add the contact person's first name.";
        if (validateName(lastName, "last name")) return "Add the contact person's last name.";
        if (!workEmail.trim()) return "Sign in again to load your account email.";
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
    setSaveError("");
    apiRequest("/profile/employer", {
      method: "PUT",
      body: JSON.stringify(draft),
    }).then(() => {
      router.push("/employer/dashboard");
    }).catch((error: unknown) => {
      setSaveError(error instanceof Error ? error.message : "Could not save your organization profile.");
    }).finally(() => {
      setSaving(false);
    });
  };

  const finish = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await apiRequest("/profile/employer", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setCompletedSteps((previous) => (previous.includes(step) ? previous : [...previous, step]));
      router.push("/employer/dashboard");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your organization profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      eyebrow="Employer profile"
      heading="Set up your organization to start hiring."
      subheading="Five short steps. Your profile is saved to your account, and organization verification is reviewed separately."
      steps={STEP_LABELS}
      currentStep={step}
      completedSteps={completedSteps}
      onStepSelect={setStep}
      exitHref="/employer/dashboard"
      onBack={() => setStep((previous) => Math.max(previous - 1, 1))}
      onNext={step === STEP_LABELS.length ? finish : goNext}
      onSaveAndExit={saveAndExit}
      nextLabel={step === STEP_LABELS.length ? "Complete profile" : "Continue"}
      nextDisabled={Boolean(stepErrors) || saving || !initialized}
      saving={saving}
    >
      <div className={styles.stepBody}>
        {saveError ? <p className={styles.stepError} role="alert">{saveError}</p> : null}
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
          <VerificationStatus value={draft.verification} />
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
