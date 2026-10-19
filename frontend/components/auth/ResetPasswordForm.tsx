"use client";

/**
 * Reset password form — reached from the email link (?token=…).
 *
 * Token validation, expiry and the actual password change all require the
 * backend. The UI implements every state: invalid token, expired token,
 * success. Without a backend the token is reported as unverified and the form
 * explains that the reset service is not connected.
 */
import { useState } from "react";
import Link from "next/link";
import { validatePassword, validatePasswordConfirm } from "@/lib/validation";
import PasswordField from "@/components/common/PasswordField";
import StatusMessage from "@/components/common/StatusMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import styles from "./ResetPasswordForm.module.css";

type TokenState = "checking" | "invalid" | "valid";

type ResetPasswordFormProps = {
  token: string | null;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [tokenState, setTokenState] = useState<TokenState>(token ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string | null;
    confirmPassword?: string | null;
    form?: string | null;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // A real implementation verifies the token against the backend here.
  // Without one, no token can be trusted, so the flow stops honestly.
  useState(() => {
    if (!token) return;
    window.setTimeout(() => setTokenState("invalid"), 400);
  });

  if (done) {
    return (
      <div className={styles.wrapper}>
        <StatusMessage type="success">
          <strong>Your password has been changed.</strong>
          <p>Use your new password the next time you log in.</p>
        </StatusMessage>
        <Link className={styles.primaryAction} href="/login">
          Continue to login
        </Link>
      </div>
    );
  }

  if (tokenState === "checking") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.checkingRow}>
          <LoadingSpinner size={18} label="Checking reset link" />
          <span>Checking your reset link…</span>
        </div>
      </div>
    );
  }

  if (tokenState === "invalid") {
    return (
      <div className={styles.wrapper}>
        <StatusMessage type="error">
          <strong>This reset link is not valid.</strong>
          <p>
            The link may have expired, already been used, or the reset service
            may not be connected yet. Request a new link to try again.
          </p>
        </StatusMessage>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/forgot-password">
            Request a new link
          </Link>
          <Link className={styles.secondaryAction} href="/login">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const passwordError = validatePassword(password);
    const confirmError = validatePasswordConfirm(password, confirmPassword);
    setErrors({ password: passwordError, confirmPassword: confirmError });
    if (passwordError || confirmError) return;

    setSubmitting(true);
    // Backend integration point: POST apiEndpoints.resetPassword with the token.
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 700);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.intro}>
        Choose a new password for your account. It must be at least 8 characters
        and include a letter and a number.
      </p>

      <PasswordField
        label="New password"
        name="reset-password"
        value={password}
        onChange={(value) => {
          setPassword(value);
          setErrors((e) => ({ ...e, password: null }));
        }}
        autoComplete="new-password"
        required
        error={errors.password}
        showStrength
      />

      <PasswordField
        label="Confirm new password"
        name="reset-confirm-password"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          setErrors((e) => ({ ...e, confirmPassword: null }));
        }}
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? (
          <>
            <LoadingSpinner size={15} label="Updating" />
            Updating password…
          </>
        ) : (
          "Reset password"
        )}
      </button>
    </form>
  );
}
