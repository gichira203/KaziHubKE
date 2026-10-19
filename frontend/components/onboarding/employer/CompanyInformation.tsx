"use client";

/**
 * Employer onboarding step 2 — organization information.
 * Logo upload is optional; only the file name is kept in the draft.
 */
import { useRef, useState } from "react";
import { Building2 } from "lucide-react";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import {
  LOGO_ALLOWED_TYPES,
  LOGO_MAX_SIZE,
  formatFileSize,
  validateUrl,
  validateUploadFile,
} from "@/lib/validation";
import { companySizes, counties, countries, organizationTypes, industries } from "@/lib/kenya-data";
import type { EmployerCompany } from "@/lib/onboarding-types";
import styles from "./CompanyInformation.module.css";

type CompanyInformationProps = {
  value: EmployerCompany;
  onChange: (value: EmployerCompany) => void;
};

export default function CompanyInformation({ value, onChange }: CompanyInformationProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);

  const update = (patch: Partial<EmployerCompany>) => onChange({ ...value, ...patch });

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Organization information
        </h2>
        <p className={styles.lead}>
          Tell candidates who they would be working for. This appears on every
          vacancy you post.
        </p>
      </div>

      {/* ---- logo ---- */}
      <div className={styles.logoRow}>
        <span className={styles.logoPreview} aria-hidden="true">
          <Building2 size={20} />
        </span>
        <div className={styles.logoMeta}>
          <p className={styles.logoLabel}>Company logo</p>
          <p className={styles.logoHint}>
            {value.logoName
              ? value.logoName
              : `Optional · PNG, JPG, WebP or SVG, up to ${formatFileSize(LOGO_MAX_SIZE)}`}
          </p>
          <div className={styles.logoActions}>
            <button type="button" className={styles.logoButton} onClick={() => logoRef.current?.click()}>
              {value.logoName ? "Replace logo" : "Upload logo"}
            </button>
            {value.logoName ? (
              <button
                type="button"
                className={styles.logoRemove}
                onClick={() => {
                  update({ logoName: "" });
                  setLogoError(null);
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          {logoError ? (
            <p className={styles.logoError} role="alert">
              {logoError}
            </p>
          ) : null}
        </div>
        <input
          ref={logoRef}
          type="file"
          className={styles.hiddenInput}
          accept={LOGO_ALLOWED_TYPES.join(",")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const error = validateUploadFile(file, LOGO_ALLOWED_TYPES, LOGO_MAX_SIZE, "Logo");
            setLogoError(error);
            if (!error) update({ logoName: file.name });
          }}
          aria-label="Company logo"
        />
      </div>

      <InputField
        label="Company or organization name"
        name="company-name"
        value={value.companyName}
        onChange={(companyName) => update({ companyName })}
        placeholder="e.g. Acme Solutions Ltd"
        required
      />

      <div className={styles.twoCol}>
        <SelectField
          label="Organization type"
          name="organization-type"
          value={value.organizationType}
          options={organizationTypes}
          placeholder="Select a type"
          onChange={(organizationType) => update({ organizationType })}
          required
        />
        <SelectField
          label="Industry"
          name="company-industry"
          value={value.industry}
          options={industries}
          placeholder="Select an industry"
          onChange={(industry) => update({ industry })}
          required
        />
      </div>

      <InputField
        label="Company website"
        name="company-website"
        type="url"
        value={value.website}
        onChange={(website) => {
          update({ website });
          setWebsiteError(validateUrl(website, "website link"));
        }}
        placeholder="https://company.co.ke"
        error={websiteError}
      />

      <div className={styles.twoCol}>
        <SelectField
          label="Company size"
          name="company-size"
          value={value.companySize}
          options={companySizes}
          placeholder="Select a size"
          onChange={(companySize) => update({ companySize })}
        />
        <SelectField
          label="Country"
          name="company-country"
          value={value.country}
          options={countries}
          onChange={(country) => update({ country })}
        />
      </div>

      <div className={styles.twoCol}>
        <SelectField
          label="County"
          name="company-county"
          value={value.county}
          options={counties}
          placeholder="Select a county"
          onChange={(county) => update({ county })}
        />
        <InputField
          label="City or town"
          name="company-city"
          value={value.city}
          onChange={(city) => update({ city })}
          placeholder="e.g. Westlands, Nairobi"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="company-description">
          Business description
          <span className={styles.optional}> (optional)</span>
        </label>
        <textarea
          id="company-description"
          className={styles.textarea}
          value={value.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="What does your organization do? What is it like to work there?"
          rows={4}
        />
        <p className={styles.helper}>
          A short, honest description helps candidates decide whether to apply.
        </p>
      </div>
    </div>
  );
}
