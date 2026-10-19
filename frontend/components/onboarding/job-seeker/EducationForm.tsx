"use client";

/**
 * Step 3 — Education. Repeatable records covering university, college, TVET,
 * secondary school, professional qualifications and other training.
 * "Currently studying" is mutually exclusive with a graduation year.
 */
import { useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import { qualifications, studyStatusLabels } from "@/lib/kenya-data";
import { validateYear } from "@/lib/validation";
import { createRowId, type EducationEntry, type StudyStatus } from "@/lib/onboarding-types";
import styles from "./EducationForm.module.css";

type EducationFormProps = {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
};

const statusOptions = Object.entries(studyStatusLabels) as Array<[StudyStatus, string]>;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear + 6 - 1980 + 1 }, (_, i) => String(currentYear + 6 - i));

function emptyEntry(): EducationEntry {
  return {
    id: createRowId("edu"),
    institution: "",
    qualification: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    status: "completed",
    achievements: "",
  };
}

export default function EducationForm({ entries, onChange }: EducationFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EducationEntry | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const startNew = () => {
    setDraft(emptyEntry());
    setEditingId(null);
    setErrors({});
  };

  const startEdit = (entry: EducationEntry) => {
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
      institution: draft.institution.trim() ? null : "Enter the institution name.",
      qualification: draft.qualification ? null : "Select a qualification.",
      startYear: validateYear(draft.startYear, "start year"),
      endYear: draft.status === "completed" ? validateYear(draft.endYear, "graduation year") : null,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (editingId) {
      onChange(entries.map((entry) => (entry.id === editingId ? draft : entry)));
    } else {
      onChange([...entries, draft]);
    }
    cancel();
  };

  const remove = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id));
  };

  const update = (patch: Partial<EducationEntry>) => {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
    setErrors((previous) => {
      const cleared = { ...previous };
      for (const key of Object.keys(patch)) delete cleared[key];
      return cleared;
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Education
        </h2>
        <p className={styles.lead}>
          Add your qualifications — university, college, TVET, secondary school,
          professional certificates or any other training. You can add more than
          one.
        </p>
      </div>

      {entries.length > 0 ? (
        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id} className={styles.card}>
              <div className={styles.cardMain}>
                <p className={styles.cardTitle}>
                  {entry.qualification}
                  {entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ""}
                </p>
                <p className={styles.cardMeta}>{entry.institution}</p>
                <p className={styles.cardMeta}>
                  {entry.startYear || "—"}
                  {entry.status === "completed"
                    ? ` – ${entry.endYear || "—"}`
                    : ` · ${studyStatusLabels[entry.status]}`}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => startEdit(entry)}
                  aria-label={`Edit ${entry.institution}`}
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.institution}`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <GraduationCap size={22} />
          </span>
          <p className={styles.emptyTitle}>No education added yet</p>
          <p className={styles.emptyText}>
            You can skip this step and add your qualifications later from your
            dashboard.
          </p>
        </div>
      )}

      {draft ? (
        <div className={styles.editor}>
          <p className={styles.editorTitle}>{editingId ? "Edit education" : "Add education"}</p>

          <InputField
            label="Institution name"
            name="edu-institution"
            value={draft.institution}
            onChange={(institution) => update({ institution })}
            placeholder="e.g. University of Nairobi"
            required
            error={errors.institution}
          />

          <SelectField
            label="Qualification"
            name="edu-qualification"
            value={draft.qualification}
            options={qualifications}
            placeholder="Select a qualification"
            onChange={(qualification) => update({ qualification })}
            helperText="Includes TVET, secondary and professional qualifications."
            required
            error={errors.qualification}
          />

          <InputField
            label="Course or field of study"
            name="edu-field"
            value={draft.fieldOfStudy}
            onChange={(fieldOfStudy) => update({ fieldOfStudy })}
            placeholder="e.g. Computer Science"
          />

          <div className={styles.yearRow}>
            <SelectField
              label="Start year"
              name="edu-start-year"
              value={draft.startYear}
              options={yearOptions}
              placeholder="Select year"
              onChange={(startYear) => update({ startYear })}
              required
              error={errors.startYear}
            />
            <SelectField
              label="Graduation year"
              name="edu-end-year"
              value={draft.endYear}
              options={yearOptions}
              placeholder="Select year"
              disabled={draft.status !== "completed"}
              onChange={(endYear) => update({ endYear })}
              helperText={draft.status === "completed" ? undefined : "Applies when you have completed the course."}
              error={errors.endYear}
            />
          </div>

          <SelectField
            label="Study status"
            name="edu-status"
            value={draft.status}
            options={statusOptions.map(([, label]) => label)}
            onChange={(label) => {
              const found = statusOptions.find(([, l]) => l === label);
              if (found) update({ status: found[0] });
            }}
            placeholder="Select status"
          />

          <InputField
            label="Relevant achievements"
            name="edu-achievements"
            value={draft.achievements}
            onChange={(achievements) => update({ achievements })}
            placeholder="e.g. First class honours, Dean's list"
            helperText="Optional."
          />

          <div className={styles.editorActions}>
            <button type="button" className={styles.secondary} onClick={cancel}>
              Cancel
            </button>
            <button type="button" className={styles.primary} onClick={save}>
              {editingId ? "Save changes" : "Add education"}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.addButton} onClick={startNew}>
          <Plus size={16} aria-hidden="true" />
          Add education
        </button>
      )}
    </div>
  );
}
