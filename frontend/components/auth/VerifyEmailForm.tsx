"use client";

/**
 * Email verification screen.
 *
 * Handles three states driven by the ?token / ?status query parameters that a
 * real verification email link would carry: success (verified), invalid token,
 * and the default "still needs verifying" state with a resend action that has
 * a cooldown. No email is actually sent in this preview.
 */
import { useState } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "@/lib/auth-config";
import StatusMessage from "@/components/common/StatusMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import styles from "./VerifyEmailForm.module.css";

const RESEND_COOLDOWN_SECONDS = 60;

type VerifyEmailFormProps = {
  status: "success" | "invalid" | "pending";
  email: string;
};

export default function VerifyEmailForm({ status, email }: VerifyEmailFormProps) {
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    // Backend integration point: POST apiEndpoints.resendVerificationEmail.
    await resendVerificationEmail();
    setSending(false);
    setResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    window.setInterval(() => {
      setCooldown((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);
  };

  if (status === "success") {
    return (
      <div className={styles.wrapper}>
        <StatusMessage type="success">
          <strong>Your email address is verified.</strong>
          <p>You now have full access to KaziHub KE. Continue to set up your profile.</p>
        </StatusMessage>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/onboarding/job-seeker">
            Continue to your profile
          </Link>
          <Link className={styles.secondaryAction} href="/login">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className={styles.wrapper}>
        <StatusMessage type="error">
          <strong>This verification link is not valid.</strong>
          <p>
            It may have expired or already been used. Request a new verification
            email to continue.
          </p>
        </StatusMessage>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/login">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <StatusMessage type="info">
        <strong>Verify your email address</strong>
        <p>
          We sent a verification link to{" "}
          <strong>{email || "your email address"}</strong>. Open it to activate
          your account. The link expires after a short time for your security.
        </p>
      </StatusMessage>

      <div className={styles.checklist}>
        <p className={styles.checklistTitle}>What to do next</p>
        <ol>
          <li>Open the email from KaziHub KE.</li>
          <li>Click the verification link.</li>
          <li>You will be returned here and can continue to your profile.</li>
        </ol>
      </div>

      {resent ? (
        <StatusMessage type="success">
          <p>A new verification email is on its way if the account is eligible.</p>
        </StatusMessage>
      ) : null}

      <button
        type="button"
        className={styles.resend}
        onClick={handleResend}
        disabled={cooldown > 0 || sending}
      >
        {sending ? (
          <>
            <LoadingSpinner size={15} label="Sending" />
            Sending…
          </>
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          "Resend verification email"
        )}
      </button>

      <p className={styles.note}>
        In this preview build no email is actually sent — the mail service is not
        connected yet. The interface above is the final behaviour once it is.
      </p>

      <div className={styles.actions}>
        <Link className={styles.secondaryAction} href="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
