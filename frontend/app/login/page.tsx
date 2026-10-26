import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — KaziHub KE",
  description: "Log in to your KaziHub KE account to apply for jobs, manage applications or post vacancies.",
};

type LoginSearchParams = Promise<{ oauth_error?: string | string[] }>;

/**
 * The OAuth callback routes redirect back here with `?oauth_error=...` when a
 * provider sign-in does not complete. Reading searchParams is URL data, so the
 * read lives inside Suspense and the form can still prerender as a fallback.
 */
async function LoginFormWithOAuthError({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;
  const oauthError = Array.isArray(params.oauth_error) ? params.oauth_error[0] : params.oauth_error;
  return <LoginForm oauthError={oauthError} />;
}

export default function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  return (
    <AuthLayout
      layout="login"
      title="Log in to KaziHub KE"
      subtitle="Welcome back. Log in to continue your job search or manage your vacancies."
      footer={
        <>
          Trouble logging in? <Link href="/forgot-password">Reset your password</Link>
        </>
      }
    >
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithOAuthError searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}
