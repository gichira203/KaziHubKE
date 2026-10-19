import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password — KaziHub KE",
  description: "Request a password reset link for your KaziHub KE account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email address you used to sign up and we will send you reset instructions if an account exists."
      footer={
        <>
          Remembered it? <Link href="/login">Back to login</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
