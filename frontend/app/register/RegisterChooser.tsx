"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AccountType } from "@/lib/onboarding-types";
import { saveAccountType, readAccountType, clearAccountType } from "@/lib/draft-storage";
import AuthLayout from "@/components/auth/AuthLayout";
import AccountTypeSelector from "@/components/auth/AccountTypeSelector";
import RegisterForm from "@/components/auth/RegisterForm";

import styles from "./RegisterChooser.module.css";

/**
 * Registration entry: asks what the visitor wants to do, then either shows the
 * account-type cards or the email registration form for the chosen type.
 *
 * The account type chosen here creates nothing — it is stored for this session
 * and preselects the type on the form (and later on onboarding).
 */

type RegisterChooserProps = {
  /** Type carried in the URL (?type=employer) — a shareable, bookmarked link. */
  initialType: AccountType | null;
};

export default function RegisterChooser({ initialType }: RegisterChooserProps) {
  const router = useRouter();
  // URL first (fresh intent); otherwise the choice stored earlier in this tab.
  const [accountType, setAccountType] = useState<AccountType | null>(initialType ?? readAccountType());

  const choose = (type: AccountType) => {
    saveAccountType(type);
    setAccountType(type);
    router.push(`/register?type=${type}`);
  };

  const startOver = () => {
    clearAccountType();
    setAccountType(null);
    router.push("/register");
  };

  return (
    <AuthLayout
      backgroundImage="register"
      title={accountType ? "Create your account" : "Join KaziHub KE"}
      subtitle={
        accountType
          ? accountType === "employer"
            ? "Create an employer account to start posting vacancies."
            : "Create your account to start applying for jobs and opportunities."
          : "What would you like to do on KaziHub KE? Choose an account type to continue."
      }
      footer={
        accountType ? (
          <button type="button" className={styles.resetLink} onClick={startOver}>
            Start over and choose a different account type
          </button>
        ) : (
          <p>
            Already have an account? <a href="/login">Log in</a>
          </p>
        )
      }
    >
      {accountType ? (
        <RegisterForm accountType={accountType} onChangeAccountType={startOver} />
      ) : (
        <AccountTypeSelector value={null} onChange={choose} />
      )}
    </AuthLayout>
  );
}
