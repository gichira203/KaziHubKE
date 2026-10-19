"use client";

/**
 * Forgot-password form.
 *
 * The confirmation message is deliberately neutral — it never reveals whether
 * an email belongs to an account (account enumeration protection). No email is
 * actually sent in this preview; the UI says so.
 */
import { useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/validation";
import InputField from "@/components/common/InputField";
import StatusMessage from "@/components/common/StatusMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import styles from "./ForgotPasswordForm.module.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setSubmitting(true);
    // Backend integration point: call requestPasswordReset(email). The UI
    // deliberately shows the same neutral confirmation either way.
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  if (submitted) {
    return (
      <div className={styles.wrapper}>
        <StatusMessage type="success">
          <strong>Check your inbox.</strong>
          <p>
            If an account exists for <strong>{email}</strong>, we have sent a
            password reset link. The link expires shortly for your security.
          </p>
        </StatusMessage>

        <p className={styles.note}>
          Nothing arrived? Check your spam folder, or wait a few minutes and try
          again. In this preview build no email is actually sent — the mail
          service is not connected yet.
        </p>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/login">
            Back to login
          </Link>
          <button type="button" className={styles.secondaryAction} onClick={() => setSubmitted(false)}>
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

      <InputField
        label="Email address"
        name="forgot-email"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          setError(null);
        }}
        placeholder="name@example.com"
        helperText="Use the email address associated with your KaziHub KE account."
        autoComplete="email"
        inputMode="email"
        required
        error={error}
      />

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? (
          <>
            <LoadingSpinner size={15} label="Sending" />
            Sending instructions…
          </>
        ) : (
          "Send reset instructions"
        )}
      </button>

      <p className={styles.switch}>
        Remembered your password? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
