"use client";

/**
 * Step 2 — Employment preferences.
 * Multi-select cards for employment types and work mode; tag inputs for
 * titles, industries and locations (with county suggestions). Everything here
 * is optional except employment types, which drive the recommendations feed.
 */
import { Briefcase } from "lucide-react";
import TagInput from "@/components/common/TagInput";
import SelectField from "@/components/common/SelectField";

import CheckboxField from "@/components/common/CheckboxField";
import { employmentTypeLabels, industries, workModeLabels, counties } from "@/lib/kenya-data";
import type { EmploymentType, JobSeekerEmployment, WorkMode } from "@/lib/onboarding-types";
import styles from "./EmploymentPreferences.module.css";

type EmploymentPreferencesProps = {
  value: JobSeekerEmployment;
  onChange: (value: JobSeekerEmployment) => void;
};

const employmentTypes = Object.entries(employmentTypeLabels) as Array<[EmploymentType, string]>;
const workModes = Object.entries(workModeLabels) as Array<[WorkMode, string]>;

const salaryOptions = [
  "Below KES 20,000",
  "KES 20,000 – 50,000",
  "KES 50,000 – 100,000",
  "KES 100,000 – 200,000",
  "Above KES 200,000",
  "Negotiable",
  "Prefer not to say",
];

const availabilityOptions = [
  "Immediately",
  "Within 1 month",
  "Within 3 months",
  "After graduation",
  "Not looking right now",
];

export default function EmploymentPreferences({ value, onChange }: EmploymentPreferencesProps) {
  const update = (patch: Partial<JobSeekerEmployment>) => onChange({ ...value, ...patch });

  const toggleType = (type: EmploymentType) => {
    const selected = value.employmentTypes.includes(type);
    update({
      employmentTypes: selected
        ? value.employmentTypes.filter((t) => t !== type)
        : [...value.employmentTypes, type],
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Employment preferences
        </h2>
        <p className={styles.lead}>
          Tell us what you are looking for so we can match you with the right
          opportunities. You can change these preferences at any time.
        </p>
      </div>

      <TagInput
        label="Desired job titles"
        name="desired-titles"
        tags={value.desiredTitles}
        onChange={(desiredTitles) => update({ desiredTitles })}
        placeholder="e.g. Software Developer"
        helperText="Add up to 10 job titles. Examples: Data Analyst, Accountant, Sales Executive."
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Preferred employment types
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </legend>
        <div className={styles.typeGrid}>
          {employmentTypes.map(([type, label]) => {
            const selected = value.employmentTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                role="checkbox"
                aria-checked={selected}
                className={`${styles.typeCard} ${selected ? styles.typeCardSelected : ""}`}
                onClick={() => toggleType(type)}
              >
                <span className={styles.typeLabel}>{label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <TagInput
        label="Preferred industries"
        name="preferred-industries"
        tags={value.industries}
        suggestions={industries}
        onChange={(industries) => update({ industries })}
        placeholder="e.g. Technology & IT"
        helperText="Pick from the suggestions or type your own."
      />

      <TagInput
        label="Preferred work locations"
        name="preferred-locations"
        tags={value.locations}
        suggestions={counties}
        onChange={(locations) => update({ locations })}
        placeholder="e.g. Nairobi"
        helperText="Counties, towns, or 'Remote'."
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Work mode preference</legend>
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

      <div className={styles.twoCol}>
        <SelectField
          label="Expected salary range"
          name="expected-salary"
          value={value.salaryRange}
          options={salaryOptions}
          placeholder="Select a range"
          onChange={(salaryRange) => update({ salaryRange })}
        />
        <SelectField
          label="Availability"
          name="availability"
          value={value.availability}
          options={availabilityOptions}
          placeholder="Select availability"
          onChange={(availability) => update({ availability })}
        />
      </div>

      <div className={styles.firstJobCard}>
        <Briefcase size={20} aria-hidden="true" className={styles.firstJobIcon} />
        <CheckboxField
          name="first-job-seeker"
          checked={value.firstJobSeeker}
          onChange={(firstJobSeeker) => update({ firstJobSeeker })}
          label="I am looking for my first job"
          helperText="Tick this if you have no formal work experience yet. Employers using this filter will prioritise entry-level roles for you."
        />
      </div>
    </div>
  );
}
