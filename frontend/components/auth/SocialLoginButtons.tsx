"use client";

/**
 * Social sign-in buttons for Google, Facebook and LinkedIn.
 *
 * Each button calls `startSocialLogin`, which refuses when the provider is not
 * configured and surfaces an honest explanation in the shared notice below the
 * buttons. No fake OAuth success is ever simulated.
 *
 * Provider brand marks are drawn inline (simple official-style glyphs) so no
 * extra icon dependency is needed; the visible label is always the full
 * provider name.
 */
import { useState } from "react";
import { authProviders, startSocialLogin, type AuthProviderId } from "@/lib/auth-config";
import StatusMessage from "@/components/common/StatusMessage";
import styles from "./SocialLoginButtons.module.css";

const providerOrder: AuthProviderId[] = ["google", "facebook", "linkedin"];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#ffffff"
        d="M15.1 12.5l.4-2.9h-2.8V8.2c0-.8.2-1.3 1.4-1.3h1.4V4.3s-1.2-.2-2.4-.2c-2.4 0-4 1.5-4 4.2v2.3H7.1v2.9h2v7.4h3.3v-7.4h2.7z"
      />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <path
        fill="#ffffff"
        d="M7 9.5h2.4v8.2H7V9.5zm1.2-1.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8zM11 9.5h2.3v1.1c.4-.7 1.2-1.3 2.5-1.3 1.8 0 2.7 1.2 2.7 3.4v5h-2.4v-4.5c0-1.1-.4-1.8-1.4-1.8-.9 0-1.5.6-1.5 1.8v4.5H11V9.5z"
      />
    </svg>
  );
}

const marks: Record<AuthProviderId, () => React.ReactElement> = {
  google: GoogleMark,
  facebook: FacebookMark,
  linkedin: LinkedInMark,
};

type SocialLoginButtonsProps = {
  /** "sign in with" or "continue with" — matches the surrounding context. */
  action: "sign in with" | "continue with";
  iconsOnly?: boolean;
};

export default function SocialLoginButtons({ action, iconsOnly = false }: SocialLoginButtonsProps) {
  const [notice, setNotice] = useState<{ provider: string; message: string } | null>(null);

  const handleProvider = (provider: AuthProviderId) => {
    const result = startSocialLogin(provider);
    if (!result.ok) {
      setNotice({ provider: authProviders[provider].name, message: result.error });
    }
  };

  return (
    <div className={`${styles.wrapper} ${iconsOnly ? styles.iconsOnly : ""}`}>
      <div className={styles.buttons}>
        {providerOrder.map((id) => {
          const Mark = marks[id];
          return (
            <button
              key={id}
              type="button"
              className={styles.button}
              onClick={() => handleProvider(id)}
              aria-label={`${action} ${authProviders[id].name}`}
            >
              <Mark />
              <span className={styles.label}>{authProviders[id].name}</span>
            </button>
          );
        })}
      </div>

      {notice ? (
        <StatusMessage type="info">
          <strong>{notice.provider} sign-in unavailable.</strong>
          <p>{notice.message}</p>
        </StatusMessage>
      ) : null}

      <p className={styles.consentNote}>
        Social sign-in uses official sign-in flows. With your permission we only
        receive your name, email address and profile photo from the provider. We
        never ask for your social media password.
      </p>
    </div>
  );
}
