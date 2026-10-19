"use client";

/**
 * Email registration form: first name, last name, email, password, confirm,
 * preselected account type, and Terms/Privacy acceptance.
 *
 * Only the minimum needed to create an account is collected here — career and
 * company details belong to onboarding. On submit it validates, then calls
 * `submitRegistration`, then routes to the matching dashboard.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail, validateName, validatePassword, validatePasswordConfirm } from "@/lib/validation";
import { submitRegistration } from "@/lib/auth-config";
import InputField from "@/components/common/InputField";
import PasswordField from "@/components/common/PasswordField";
import CheckboxField from "@/components/common/CheckboxField";
import StatusMessage from "@/components/common/StatusMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SocialLoginButtons from "./SocialLoginButtons";
import AuthDivider from "./AuthDivider";
import styles from "./RegisterForm.module.css";

type AccountType = "job-seeker" | "employer";

type RegisterFormProps = {
  accountType: AccountType;
  onChangeAccountType: () => void;
  /** Employer accounts collect phone later, in onboarding step 1. */
};

type Errors = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  acceptedTerms?: string | null;
  form?: string | null;
  notice?: string | null;
};

export default function RegisterForm({ accountType, onChangeAccountType }: RegisterFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const accountLabel = accountType === "employer" ? "an employer account" : "a job seeker account";

  const validate = (): boolean => {
    const next: Errors = {
      firstName: validateName(firstName, "first name"),
      lastName: validateName(lastName, "last name"),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirm(password, confirmPassword),
      acceptedTerms: acceptedTerms ? null : "You must accept the Terms of Service and Privacy Policy to continue.",
    };
    setErrors(next);
    return Object.values(next).every((value) => !value);
  };

  const clearField = (field: keyof Errors) =>
    setErrors((previous) => (previous[field] ? { ...previous, [field]: null } : previous));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return; // prevent duplicate submissions
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    // Name + email (never the password) are kept for this session so the
    // dashboard can greet the user who actually registered — nothing invented.
    try {
      const result = await submitRegistration({ firstName, lastName, email, password, accountType });
      if (result.ok) {
        router.push(accountType === "employer" ? "/employer/dashboard" : "/dashboard");
      } else {
        if (result.code === "not-configured") {
          setErrors({ notice: result.error });
        } else if (result.code === "email-taken") {
          setErrors({ email: "An account with this email already exists. Log in instead." });
        } else {
          setErrors({ form: result.error });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.accountBanner}>
        <span className={styles.accountDot} aria-hidden="true" />
        <p>
          Creating <strong>{accountLabel}</strong> as{" "}
          <Link href="/register" className={styles.changeLink} onClick={onChangeAccountType}>
            change account type
          </Link>
        </p>
      </div>

      {errors.notice ? (
        <StatusMessage type="info">
          <strong>Registration API is not connected.</strong>
          <p>{errors.notice}</p>
        </StatusMessage>
      ) : null}

      {errors.form ? <StatusMessage type="error">{errors.form}</StatusMessage> : null}

      <div className={styles.nameRow}>
        <InputField
          label="First name"
          name="register-first-name"
          value={firstName}
          onChange={(value) => {
            setFirstName(value);
            clearField("firstName");
          }}
          onBlur={() => setErrors((e) => ({ ...e, firstName: validateName(firstName, "first name") }))}
          placeholder="Jane"
          autoComplete="given-name"
          required
          error={errors.firstName}
        />
        <InputField
          label="Last name"
          name="register-last-name"
          value={lastName}
          onChange={(value) => {
            setLastName(value);
            clearField("lastName");
          }}
          onBlur={() => setErrors((e) => ({ ...e, lastName: validateName(lastName, "last name") }))}
          placeholder="Wanjiku"
          autoComplete="family-name"
          required
          error={errors.lastName}
        />
      </div>

      <InputField
        label={accountType === "employer" ? "Work email address" : "Email address"}
        name="register-email"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          clearField("email");
        }}
        onBlur={() => setErrors((e) => ({ ...e, email: validateEmail(email) }))}
        placeholder="name@example.com"
        helperText="We use this for sign-in and account notifications."
        autoComplete="email"
        inputMode="email"
        required
        error={errors.email}
      />

      <PasswordField
        label="Password"
        name="register-password"
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearField("password");
        }}
        onBlur={() => setErrors((e) => ({ ...e, password: validatePassword(password) }))}
        autoComplete="new-password"
        required
        error={errors.password}
        showStrength
      />

      <PasswordField
        label="Confirm password"
        name="register-confirm-password"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          clearField("confirmPassword");
        }}
        onBlur={() =>
          setErrors((e) => ({ ...e, confirmPassword: validatePasswordConfirm(password, confirmPassword) }))
        }
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <CheckboxField
        name="accept-terms"
        checked={acceptedTerms}
        onChange={(checked) => {
          setAcceptedTerms(checked);
          clearField("acceptedTerms");
        }}
        error={errors.acceptedTerms}
        label={
          <>
            I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>, including how KaziHub KE
            handles my personal information.
          </>
        }
      />

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? (
          <>
            <LoadingSpinner size={15} label="Creating account" />
            Creating account…
          </>
        ) : accountType === "employer" ? (
          "Create employer account"
        ) : (
          "Create account"
        )}
      </button>

      <AuthDivider label="or continue with email" />
      <SocialLoginButtons action="continue with" iconsOnly />

      <p className={styles.switch}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
