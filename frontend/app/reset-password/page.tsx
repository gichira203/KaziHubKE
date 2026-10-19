import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
export const instant = false;

export const metadata: Metadata = {
  title: "Choose a new password — KaziHub KE",
  description: "Set a new password for your KaziHub KE account.",
};


type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] ?? null : rawToken ?? null;

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Create a new password for your KaziHub KE account."
      footer={
        <>
          Need a different email? <Link href="/forgot-password">Start over</Link>
        </>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
