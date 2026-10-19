"use client";

/**
 * Step 1 — Personal information.
 * Photo is optional; only its file name is kept in the draft (contents stay in
 * the browser). Phone accepts local and +254 international formats.
 */
import { useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import { PHOTO_ALLOWED_TYPES, PHOTO_MAX_SIZE, formatFileSize, validateUploadFile } from "@/lib/validation";
import { counties, countries, contactMethodLabels, townsByCounty } from "@/lib/kenya-data";
import type { ContactMethod, JobSeekerPersonal } from "@/lib/onboarding-types";
import styles from "./PersonalInformation.module.css";

type PersonalInformationProps = {
  value: JobSeekerPersonal;
  onChange: (value: JobSeekerPersonal) => void;
};

const contactOptions = Object.entries(contactMethodLabels).map(([value, label]) => ({ value, label }));

export default function PersonalInformation({ value, onChange }: PersonalInformationProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const update = (patch: Partial<JobSeekerPersonal>) => onChange({ ...value, ...patch });

  const townOptions = value.county ? (townsByCounty[value.county] ?? []) : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Personal information
        </h2>
        <p className={styles.lead}>
          This is what employers see first. Only your name, headline and preferred
          contact method are visible — everything else stays private until you
          choose to share it.
        </p>
      </div>

      {/* ---- profile photo (optional) ---- */}
      <div className={styles.photoRow}>
        <span className={styles.photoPreview} aria-hidden="true">
          {value.photoName ? <User size={22} /> : <Camera size={20} />}
        </span>
        <div className={styles.photoMeta}>
          <p className={styles.photoLabel}>Profile photo</p>
          <p className={styles.photoHint}>
            {value.photoName
              ? value.photoName
              : `Optional · PNG, JPG or WebP, up to ${formatFileSize(PHOTO_MAX_SIZE)}`}
          </p>
          <div className={styles.photoActions}>
            <button
              type="button"
              className={styles.photoButton}
              onClick={() => photoRef.current?.click()}
            >
              {value.photoName ? "Replace photo" : "Upload photo"}
            </button>
            {value.photoName ? (
              <button
                type="button"
                className={styles.photoRemove}
                onClick={() => {
                  update({ photoName: "" });
                  setPhotoError(null);
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
          {photoError ? (
            <p className={styles.photoError} role="alert">
              {photoError}
            </p>
          ) : null}
        </div>
        <input
          ref={photoRef}
          type="file"
          className={styles.hiddenInput}
          accept={PHOTO_ALLOWED_TYPES.join(",")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const error = validateUploadFile(file, PHOTO_ALLOWED_TYPES, PHOTO_MAX_SIZE, "Photo");
            setPhotoError(error);
            if (!error) update({ photoName: file.name });
          }}
          aria-label="Profile photo"
        />
      </div>

      <div className={styles.nameRow}>
        <InputField
          label="First name"
          name="seeker-first-name"
          value={value.firstName}
          onChange={(firstName) => update({ firstName })}
          autoComplete="given-name"
          required
        />
        <InputField
          label="Last name"
          name="seeker-last-name"
          value={value.lastName}
          onChange={(lastName) => update({ lastName })}
          autoComplete="family-name"
          required
        />
      </div>

      <InputField
        label="Professional headline"
        name="seeker-headline"
        value={value.headline}
        onChange={(headline) => update({ headline })}
        placeholder="e.g. Frontend Developer · Nairobi"
        helperText="One line that describes what you do, like a LinkedIn headline."
        maxLength={90}
      />

      <InputField
        label="Telephone number"
        name="seeker-phone"
        type="tel"
        value={value.phone}
        onChange={(phone) => update({ phone })}
        onBlur={() => undefined}
        placeholder="0712 345 678 or +254 712 345 678"
        helperText="Kenyan numbers in 07…/01… or +254 format."
        autoComplete="tel"
        inputMode="tel"
      />

      <div className={styles.locationRow}>
        <SelectField
          label="Country"
          name="seeker-country"
          value={value.country}
          options={countries}
          onChange={(country) => update({ country })}
        />
        <SelectField
          label="County"
          name="seeker-county"
          value={value.county}
          options={counties}
          onChange={(county) => update({ county, town: "" })}
          helperText="All 47 counties are supported."
        />
      </div>

      <div className={styles.locationRow}>
        <SelectField
          label="Town or city"
          name="seeker-town"
          value={value.town}
          options={townOptions.length ? townOptions : ["Other"]}
          placeholder={value.county ? "Select a town" : "Select a county first"}
          disabled={!value.county}
          onChange={(town) => update({ town })}
        />
      </div>

      <fieldset className={styles.contactFieldset}>
        <legend className={styles.contactLegend}>Preferred contact method</legend>
        <div className={styles.contactOptions}>
          {contactOptions.map((option) => {
            const selected = value.preferredContact === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.contactOption} ${selected ? styles.contactOptionSelected : ""}`}
                onClick={() => update({ preferredContact: option.value as ContactMethod })}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className={styles.contactHint}>
          How approved employers should reach you about relevant opportunities.
        </p>
      </fieldset>
    </div>
  );
}
