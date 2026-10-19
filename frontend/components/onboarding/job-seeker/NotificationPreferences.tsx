"use client";

/**
 * Step 7 — Profile visibility and notifications.
 * Every marketing/communication consent starts UNCHECKED. Each option has an
 * explicit explanation so the user can make an informed choice.
 */
import { Bell, Eye, Mail } from "lucide-react";
import CheckboxField from "@/components/common/CheckboxField";
import TagInput from "@/components/common/TagInput";
import { counties, jobCategories } from "@/lib/kenya-data";
import type { JobSeekerNotifications } from "@/lib/onboarding-types";
import styles from "./NotificationPreferences.module.css";

type NotificationPreferencesProps = {
  value: JobSeekerNotifications;
  onChange: (value: JobSeekerNotifications) => void;
};

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export default function NotificationPreferences({ value, onChange }: NotificationPreferencesProps) {
  const update = (patch: Partial<JobSeekerNotifications>) => onChange({ ...value, ...patch });

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Visibility &amp; notifications
        </h2>
        <p className={styles.lead}>
          You decide who sees your profile and when we contact you. Nothing here
          is enabled automatically — every option starts switched off.
        </p>
      </div>

      {/* ---- visibility ---- */}
      <div className={styles.group}>
        <p className={styles.groupTitle}>
          <Eye size={15} aria-hidden="true" />
          Profile visibility
        </p>

        <CheckboxField
          name="profile-visible"
          checked={value.profileVisibleToEmployers}
          onChange={(profileVisibleToEmployers) => update({ profileVisibleToEmployers })}
          label="Make my profile visible to approved employers"
          helperText="Approved employers can find you in candidate search. Unchecking this hides your profile entirely — you can still apply to jobs yourself."
        />

        <CheckboxField
          name="employer-contact"
          checked={value.allowEmployerContact}
          onChange={(allowEmployerContact) => update({ allowEmployerContact })}
          label="Let employers contact me about relevant opportunities"
          helperText="Employers who match your preferences can send you a message. You can turn this off at any time."
        />
      </div>

      {/* ---- alerts ---- */}
      <div className={styles.group}>
        <p className={styles.groupTitle}>
          <Bell size={15} aria-hidden="true" />
          Job alerts
        </p>

        <CheckboxField
          name="job-alerts"
          checked={value.jobAlertEmails}
          onChange={(jobAlertEmails) => update({ jobAlertEmails })}
          label="Send me job alert emails"
          helperText="We email you when new opportunities match the categories and locations below. This is opt-in and you can unsubscribe from any email."
        />

        {value.jobAlertEmails ? (
          <div className={styles.alertsDetail}>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Alert frequency</legend>
              <div className={styles.frequencyRow}>
                {frequencyOptions.map((option) => {
                  const selected = value.frequency === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`${styles.frequency} ${selected ? styles.frequencySelected : ""}`}
                      onClick={() => update({ frequency: option.value })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <TagInput
              label="Job categories to alert me about"
              name="alert-categories"
              tags={value.preferredCategories}
              suggestions={jobCategories}
              onChange={(preferredCategories) => update({ preferredCategories })}
              placeholder="e.g. Internships"
            />

            <TagInput
              label="Locations to alert me about"
              name="alert-locations"
              tags={value.preferredLocations}
              suggestions={counties}
              onChange={(preferredLocations) => update({ preferredLocations })}
              placeholder="e.g. Nairobi"
            />
          </div>
        ) : null}
      </div>

      <p className={styles.privacyNote}>
        <Mail size={14} aria-hidden="true" />
        Marketing emails are never sent without the opt-in above. Transactional
        messages about your account (verification, application updates) are
        always sent because they are needed to use the service.
      </p>
    </div>
  );
}
