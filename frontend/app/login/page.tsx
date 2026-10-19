import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — KaziHub KE",
  description: "Log in to your KaziHub KE account to apply for jobs, manage applications or post vacancies.",
};

export default function LoginPage() {
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
      <LoginForm />
    </AuthLayout>
  );
}
