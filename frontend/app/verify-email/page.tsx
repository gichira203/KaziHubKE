import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
export const instant = false;

export const metadata: Metadata = {
  title: "Verify your email — KaziHub KE",
  description: "Verify your email address to activate your KaziHub KE account.",
};


type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const single = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  };

  // A real verification link carries a one-time token. ?status lets us show the
  // outcome states without trusting anything client-side.
  const token = single(params.token);
  const rawStatus = single(params.status);
  const status: "success" | "invalid" | "pending" =
    rawStatus === "verified" ? "success" : rawStatus === "invalid" || (token && !rawStatus) ? "invalid" : "pending";
  const email = single(params.email);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm your email address to activate your KaziHub KE account."
      footer={
        <>
          Using the wrong address? <Link href="/login">Log in</Link> to update it.
        </>
      }
    >
      <VerifyEmailForm status={status} email={email} />
    </AuthLayout>
  );
}
