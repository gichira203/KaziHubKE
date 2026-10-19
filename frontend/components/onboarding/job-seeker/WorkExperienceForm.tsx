"use client";

/**
 * Step 4 — Work experience. Repeatable employment history with "current role"
 * support. Users who have no formal experience tick the explicit option instead
 * of being blocked — first-time job seekers can move on.
 */
import { useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import InputField from "@/components/common/InputField";
import CheckboxField from "@/components/common/CheckboxField";
import TagInput from "@/components/common/TagInput";
import { suggestedSkills } from "@/lib/kenya-data";
import { createRowId, type ExperienceEntry } from "@/lib/onboarding-types";
import styles from "./WorkExperienceForm.module.css";

type WorkExperienceFormProps = {
  entries: ExperienceEntry[];
  /** True when the user has explicitly said they have no work experience. */
  noExperience: boolean;
  onChange: (entries: ExperienceEntry[], noExperience: boolean) => void;
};

function emptyEntry(): ExperienceEntry {
  return {
    id: createRowId("exp"),
    employer: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    responsibilities: "",
    achievements: "",
    skills: [],
  };
}

const monthOptions = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function WorkExperienceForm({ entries, noExperience, onChange }: WorkExperienceFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExperienceEntry | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const startNew = () => {
    if (noExperience) onChange([], false);
    setDraft(emptyEntry());
    setEditingId(null);
    setErrors({});
  };

  const startEdit = (entry: ExperienceEntry) => {
    setDraft({ ...entry });
    setEditingId(entry.id);
    setErrors({});
  };

  const cancel = () => {
    setDraft(null);
    setEditingId(null);
    setErrors({});
  };

  const save = () => {
    if (!draft) return;
    const nextErrors: Record<string, string | null> = {
      employer: draft.employer.trim() ? null : "Enter the employer or organisation name.",
      jobTitle: draft.jobTitle.trim() ? null : "Enter your job title.",
      startDate: draft.startDate ? null : "Select a start month.",
      endDate: draft.isCurrent ? null : draft.endDate ? null : "Select an end month or mark the role as current.",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (editingId) {
      onChange(
        entries.map((entry) => (entry.id === editingId ? draft : entry)),
        false,
      );
    } else {
      onChange([...entries, draft], false);
    }
    cancel();
  };

  const remove = (id: string) => {
    const remaining = entries.filter((entry) => entry.id !== id);
    onChange(remaining, remaining.length === 0 ? noExperience : false);
  };

  const update = (patch: Partial<ExperienceEntry>) => {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
    setErrors((previous) => {
      const cleared = { ...previous };
      for (const key of Object.keys(patch)) delete cleared[key];
      return cleared;
    });
  };

  const showList = !draft && entries.length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Work experience
        </h2>
        <p className={styles.lead}>
          Add your employment history, including attachments and voluntary work.
          If you have not worked formally yet, tick the option below — it will
          not hold you back.
        </p>
      </div>

      <div className={styles.noExperienceCard}>
        <CheckboxField
          name="no-experience"
          checked={noExperience}
          onChange={(checked) => {
            if (checked) onChange([], true);
            else onChange(entries, false);
          }}
          label="I have no formal work experience yet"
          helperText="Tick this if you are a student, fresh graduate or looking for your first job."
        />
      </div>

      {noExperience && entries.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <Briefcase size={22} />
          </span>
          <p className={styles.emptyTitle}>No work experience added</p>
          <p className={styles.emptyText}>
            That is completely fine. Employers offering entry-level roles and
            attachments will still be able to find you.
          </p>
        </div>
      ) : null}

      {showList ? (
        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id} className={styles.card}>
              <div className={styles.cardMain}>
                <p className={styles.cardTitle}>{entry.jobTitle}</p>
                <p className={styles.cardMeta}>{entry.employer}</p>
                <p className={styles.cardMeta}>
                  {entry.startDate} – {entry.isCurrent ? "Present" : entry.endDate}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => startEdit(entry)}
                  aria-label={`Edit ${entry.jobTitle} at ${entry.employer}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.jobTitle} at ${entry.employer}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {draft ? (
        <div className={styles.editor}>
          <p className={styles.editorTitle}>{editingId ? "Edit work experience" : "Add work experience"}</p>

          <div className={styles.twoCol}>
            <InputField
              label="Employer / organisation"
              name="exp-employer"
              value={draft.employer}
              onChange={(employer) => update({ employer })}
              placeholder="e.g. Safaricom PLC"
              required
              error={errors.employer}
            />
            <InputField
              label="Job title"
              name="exp-job-title"
              value={draft.jobTitle}
              onChange={(jobTitle) => update({ jobTitle })}
              placeholder="e.g. Software Developer"
              required
              error={errors.jobTitle}
            />
          </div>

          <div className={styles.twoCol}>
            <SelectMonth
              label="Start month"
              name="exp-start"
              value={draft.startDate}
              onChange={(startDate) => update({ startDate })}
              required
              error={errors.startDate}
            />
            <SelectMonth
              label="End month"
              name="exp-end"
              value={draft.endDate}
              onChange={(endDate) => update({ endDate })}
              disabled={draft.isCurrent}
              error={errors.endDate}
              helperText={draft.isCurrent ? "Current role — leave blank." : undefined}
            />
          </div>

          <CheckboxField
            name="exp-current"
            checked={draft.isCurrent}
            onChange={(isCurrent) => update({ isCurrent, endDate: isCurrent ? "" : draft.endDate })}
            label="This is my current role"
          />

          <label className={styles.textareaLabel} htmlFor="exp-responsibilities">
            Responsibilities
            <span className={styles.optional}> (optional)</span>
          </label>
          <textarea
            id="exp-responsibilities"
            className={styles.textarea}
            value={draft.responsibilities}
            onChange={(event) => update({ responsibilities: event.target.value })}
            placeholder="What did you do day to day?"
            rows={3}
          />

          <label className={styles.textareaLabel} htmlFor="exp-achievements">
            Achievements
            <span className={styles.optional}> (optional)</span>
          </label>
          <textarea
            id="exp-achievements"
            className={styles.textarea}
            value={draft.achievements}
            onChange={(event) => update({ achievements: event.target.value })}
            placeholder="Results you delivered, e.g. cut processing time by 40%"
            rows={3}
          />

          <TagInput
            label="Skills used in this role"
            name="exp-skills"
            tags={draft.skills}
            suggestions={suggestedSkills}
            onChange={(skills) => update({ skills })}
            placeholder="e.g. React"
          />

          <div className={styles.editorActions}>
            <button type="button" className={styles.secondary} onClick={cancel}>
              Cancel
            </button>
            <button type="button" className={styles.primary} onClick={save}>
              {editingId ? "Save changes" : "Add experience"}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.addButton} onClick={startNew}>
          <Plus size={16} aria-hidden="true" />
          Add work experience
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Month + year select                                                 */
/* ------------------------------------------------------------------ */

function SelectMonth({
  label,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  helperText?: string;
}) {
  const currentYear = new Date().getFullYear();
  const [month, year] = value ? value.split(" ") : ["", ""];

  const setMonth = (nextMonth: string) => onChange([nextMonth || "Jan", year || String(currentYear)].join(" "));
  const setYear = (nextYear: string) => onChange([month || "Jan", nextYear || String(currentYear)].join(" "));

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`${name}-month`}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}> (optional)</span>
        )}
      </label>

      <div className={styles.dateRow}>
        <select
          id={`${name}-month`}
          className={styles.select}
          value={month}
          disabled={disabled}
          onChange={(event) => setMonth(event.target.value)}
          aria-label={`${label} — month`}
        >
          <option value="">Month</option>
          {monthOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={year}
          disabled={disabled}
          onChange={(event) => setYear(event.target.value)}
          aria-label={`${label} — year`}
        >
          <option value="">Year</option>
          {Array.from({ length: 45 }, (_, i) => String(currentYear - i)).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {helperText ? <p className={styles.helper}>{helperText}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
