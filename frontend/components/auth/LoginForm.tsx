"use client";

/**
 * Login form — email + password, remember me, forgot-password link and the
 * three social providers.
 *
 * On submit the form validates locally, then calls `submitLogin`. Without a
 * backend that returns an honest "not configured" result which is shown as an
 * info notice — the user is never told they are signed in when they are not.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/validation";
import { submitLogin } from "@/lib/auth-config";
import InputField from "@/components/common/InputField";
import PasswordField from "@/components/common/PasswordField";
import CheckboxField from "@/components/common/CheckboxField";
import StatusMessage from "@/components/common/StatusMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SocialLoginButtons from "./SocialLoginButtons";
import AuthDivider from "./AuthDivider";
import styles from "./LoginForm.module.css";

type Errors = {
  email?: string | null;
  password?: string | null;
  form?: string | null;
  notice?: string | null;
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {
      email: validateEmail(email),
      password: password ? validatePassword(password) : "Enter your password.",
    };
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return; // guard against double submissions
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const result = await submitLogin({ email, password, rememberMe });
      if (result.ok) {
        router.push(result.data?.redirectTo ?? "/dashboard");
      } else {
        // Distinguish a configuration notice from a real auth failure so the
        // copy can stay accurate either way.
        if (result.code === "not-configured") {
          setErrors({ notice: result.error });
        } else if (result.code === "invalid-credentials") {
          setErrors({ form: "That email and password combination is not correct. Try again or reset your password." });
        } else if (result.code === "email-not-verified") {
          setErrors({ form: "Please verify your email address before logging in. Check your inbox for the verification link." });
        } else if (result.code === "account-locked") {
          setErrors({ form: "This account is temporarily locked after several failed attempts. Try again later or reset your password." });
        } else if (result.code === "network") {
          setErrors({ form: "We could not reach the server. Check your internet connection and try again." });
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
      {errors.notice ? (
        <StatusMessage type="info">
          <strong>Preview build — sign-in not connected.</strong>
          <p>{errors.notice}</p>
        </StatusMessage>
      ) : null}

      {errors.form ? <StatusMessage type="error">{errors.form}</StatusMessage> : null}

      <div className={styles.fields}>
        <InputField
          label="Email address"
          name="login-email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          onBlur={() => setErrors((e) => ({ ...e, email: validateEmail(email) }))}
          placeholder="name@example.com"
          autoComplete="email"
          inputMode="email"
          required
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="login-password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          onBlur={() =>
            setErrors((e) => ({ ...e, password: password ? validatePassword(password) : "Enter your password." }))
          }
          autoComplete="current-password"
          required
          error={errors.password}
        />
      </div>

      <div className={styles.options}>
        <CheckboxField
          label="Remember me on this device"
          name="remember-me"
          checked={rememberMe}
          onChange={setRememberMe}
        />
        <Link className={styles.forgot} href="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? (
          <>
            <LoadingSpinner size={15} label="Signing in" />
            Signing in…
          </>
        ) : (
          "Log in"
        )}
      </button>

      <AuthDivider label="Or continue with" />
      <SocialLoginButtons action="sign in with" iconsOnly />

      <p className={styles.switch}>
        Not registered yet? <Link href="/register">Sign up</Link>
      </p>
    </form>
  );
}
