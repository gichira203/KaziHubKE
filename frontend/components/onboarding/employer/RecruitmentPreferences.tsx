"use client";

/**
 * Employer onboarding step 3 — recruitment information.
 * What you hire for, where, and who candidates should contact.
 */
import { useState } from "react";
import TagInput from "@/components/common/TagInput";

import InputField from "@/components/common/InputField";
import { validateEmail, validatePhone } from "@/lib/validation";
import { counties, jobCategories, workModeLabels } from "@/lib/kenya-data";
import type { EmployerRecruitment, WorkMode } from "@/lib/onboarding-types";
import styles from "./RecruitmentPreferences.module.css";

type RecruitmentPreferencesProps = {
  value: EmployerRecruitment;
  onChange: (value: EmployerRecruitment) => void;
};

const workModes = Object.entries(workModeLabels) as Array<[WorkMode, string]>;

export default function RecruitmentPreferences({ value, onChange }: RecruitmentPreferencesProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const update = (patch: Partial<EmployerRecruitment>) => onChange({ ...value, ...patch });

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Recruitment information
        </h2>
        <p className={styles.lead}>
          This helps us show your vacancies to the right candidates and lets
          applicants reach the right person.
        </p>
      </div>

      <TagInput
        label="Main hiring categories"
        name="hiring-categories"
        tags={value.hiringCategories}
        suggestions={jobCategories}
        onChange={(hiringCategories) => update({ hiringCategories })}
        placeholder="e.g. Internships"
      />

      <TagInput
        label="Typical positions recruited"
        name="typical-positions"
        tags={value.typicalPositions}
        onChange={(typicalPositions) => update({ typicalPositions })}
        placeholder="e.g. Sales Assistant, Software Developer"
        helperText="Roles you regularly hire for, so candidates know what to expect."
      />

      <TagInput
        label="Hiring locations"
        name="hiring-locations"
        tags={value.hiringLocations}
        suggestions={counties}
        onChange={(hiringLocations) => update({ hiringLocations })}
        placeholder="e.g. Nairobi"
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Opportunity work mode</legend>
        <div className={styles.modeGrid}>
          {workModes.map(([mode, label]) => {
            const selected = value.workMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.modeCard} ${selected ? styles.modeCardSelected : ""}`}
                onClick={() => update({ workMode: mode })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.contactCard}>
        <p className={styles.contactTitle}>Recruitment contact</p>
        <p className={styles.contactHint}>
          Applications and candidate questions go to this person. Defaults to the
          account holder if left blank.
        </p>

        <InputField
          label="Contact name"
          name="recruitment-contact-name"
          value={value.contactName}
          onChange={(contactName) => update({ contactName })}
          placeholder="e.g. Jane Wanjiku"
        />

        <InputField
          label="Contact email"
          name="recruitment-contact-email"
          type="email"
          value={value.contactEmail}
          onChange={(contactEmail) => {
            update({ contactEmail });
            setEmailError(validateEmail(contactEmail));
          }}
          onBlur={() => setEmailError(value.contactEmail ? validateEmail(value.contactEmail) : null)}
          placeholder="careers@company.co.ke"
          inputMode="email"
          error={emailError}
        />

        <InputField
          label="Contact phone"
          name="recruitment-contact-phone"
          type="tel"
          value={value.contactPhone}
          onChange={(contactPhone) => {
            update({ contactPhone });
            setPhoneError(value.contactPhone ? validatePhone(value.contactPhone) : null);
          }}
          onBlur={() => setPhoneError(value.contactPhone ? validatePhone(value.contactPhone) : null)}
          placeholder="0712 345 678"
          inputMode="tel"
          error={phoneError}
        />
      </div>
    </div>
  );
}
