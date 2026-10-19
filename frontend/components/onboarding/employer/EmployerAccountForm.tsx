"use client";

/**
 * Employer onboarding step 1 — account details for the contact person.
 *
 * The password pair is held in component state only. The parent wizard strips
 * it before persisting the draft, and the storage layer re-checks as defence in
 * depth. Continue is gated by the wizard's own per-step validation.
 */
import { useState } from "react";
import InputField from "@/components/common/InputField";
import PasswordField from "@/components/common/PasswordField";
import { validateEmail, validateName, validatePhone } from "@/lib/validation";
import type { EmployerAccount } from "@/lib/onboarding-types";
import styles from "./EmployerAccountForm.module.css";

type EmployerAccountFormProps = {
  value: EmployerAccount;
  onChange: (value: EmployerAccount) => void;
};

export default function EmployerAccountForm({ value, onChange }: EmployerAccountFormProps) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const update = (patch: Partial<EmployerAccount>) => {
    onChange({ ...value, ...patch });
    setErrors((previous) => {
      const cleared = { ...previous };
      for (const key of Object.keys(patch)) delete cleared[key];
      return cleared;
    });
  };

  return (
    <form
      className={styles.wrapper}
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Account details
        </h2>
        <p className={styles.lead}>
          Start with the person who will manage this account. Your organisation
          details come next.
        </p>
      </div>

      <div className={styles.nameRow}>
        <InputField
          label="Contact person's first name"
          name="emp-first-name"
          value={value.firstName}
          onChange={(firstName) => update({ firstName })}
          onBlur={() => setErrors((e) => ({ ...e, firstName: validateName(value.firstName, "first name") }))}
          autoComplete="given-name"
          required
          error={errors.firstName}
        />
        <InputField
          label="Contact person's last name"
          name="emp-last-name"
          value={value.lastName}
          onChange={(lastName) => update({ lastName })}
          onBlur={() => setErrors((e) => ({ ...e, lastName: validateName(value.lastName, "last name") }))}
          autoComplete="family-name"
          required
          error={errors.lastName}
        />
      </div>

      <InputField
        label="Work email address"
        name="emp-work-email"
        type="email"
        value={value.workEmail}
        onChange={(workEmail) => update({ workEmail })}
        onBlur={() => setErrors((e) => ({ ...e, workEmail: validateEmail(value.workEmail) }))}
        placeholder="name@company.co.ke"
        helperText="Use a company email where possible — it speeds up verification."
        autoComplete="email"
        inputMode="email"
        required
        error={errors.workEmail}
      />

      <InputField
        label="Business telephone number"
        name="emp-phone"
        type="tel"
        value={value.phone}
        onChange={(phone) => update({ phone })}
        onBlur={() =>
          setErrors((e) => ({
            ...e,
            phone: value.phone ? validatePhone(value.phone) : "Enter your business phone number.",
          }))
        }
        placeholder="0712 345 678 or +254 712 345 678"
        helperText="Candidates and our team use this to reach you."
        autoComplete="tel"
        inputMode="tel"
        required
        error={errors.phone}
      />

      <PasswordField
        label="Password"
        name="emp-password"
        value={value.password}
        onChange={(password) => update({ password })}
        autoComplete="new-password"
        required
        error={errors.password}
        showStrength
      />

      <PasswordField
        label="Confirm password"
        name="emp-confirm-password"
        value={value.confirmPassword}
        onChange={(confirmPassword) => update({ confirmPassword })}
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <div className={styles.accountType}>
        <span className={styles.accountTypeLabel}>Account type</span>
        <span className={styles.accountTypeValue}>Employer</span>
      </div>
    </form>
  );
}
