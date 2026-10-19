"use client";

/**
 * Guided CV builder — section by section with a live preview.
 * Drafts are saved to session storage (via the parent) so users can return
 * later. The preview is rendered from the same data the forms hold; export to
 * PDF requires a server-side renderer and is clearly marked as such.
 */
import { useEffect, useRef, useState } from "react";
import { Download, FileText, Save } from "lucide-react";

import TagInput from "@/components/common/TagInput";
import { suggestedSkills } from "@/lib/kenya-data";
import type { EducationEntry, ExperienceEntry, JobSeekerPersonal, JobSeekerSkills } from "@/lib/onboarding-types";
import styles from "./CVBuilder.module.css";

type CVBuilderProps = {
  personal: JobSeekerPersonal;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: JobSeekerSkills;
  summary: string;
  onSummaryChange: (summary: string) => void;
  onSaveDraft: () => void;
  onClose: () => void;
};

const sections = [
  { id: "summary", label: "Professional summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
] as const;

export default function CVBuilder({
  personal,
  education,
  experience,
  skills,
  summary,
  onSummaryChange,
  onSaveDraft,
  onClose,
}: CVBuilderProps) {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>("summary");
  const [saved, setSaved] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const savedTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
  }, []);

  const handleSave = () => {
    onSaveDraft();
    setSaved(true);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 2500);
  };

  const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(" ");

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <p className={styles.toolbarTitle}>
          <FileText size={16} aria-hidden="true" />
          CV builder
        </p>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            <Save size={15} aria-hidden="true" />
            Save draft
          </button>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {saved ? (
        <p className={styles.savedNote} role="status">
          Draft saved. You can return to it any time.
        </p>
      ) : null}

      {/* ---- section tabs ---- */}
      <div className={styles.tabs} role="tablist" aria-label="CV sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={`${styles.tab} ${activeSection === section.id ? styles.tabActive : ""}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {/* ---- editing column ---- */}
        <div className={styles.form} role="tabpanel" aria-label={sections.find((s) => s.id === activeSection)?.label}>
          {activeSection === "summary" ? (
            <>
              <label className={styles.label} htmlFor="builder-summary">
                Professional summary
              </label>
              <textarea
                id="builder-summary"
                className={styles.textarea}
                value={summary}
                onChange={(event) => onSummaryChange(event.target.value)}
                placeholder="Two or three sentences about who you are professionally and what you bring."
                rows={6}
              />
              <p className={styles.hint}>
                Tip: mention your role, years of experience and what you are looking for.
              </p>
            </>
          ) : null}

          {activeSection === "experience" ? (
            <div className={styles.stacked}>
              {experience.length ? (
                experience.map((entry) => (
                  <div key={entry.id} className={styles.entryCard}>
                    <p className={styles.entryTitle}>{entry.jobTitle}</p>
                    <p className={styles.entryMeta}>
                      {entry.employer} · {entry.startDate} – {entry.isCurrent ? "Present" : entry.endDate}
                    </p>
                    {entry.responsibilities ? <p className={styles.entryText}>{entry.responsibilities}</p> : null}
                    {entry.achievements ? <p className={styles.entryText}>{entry.achievements}</p> : null}
                  </div>
                ))
              ) : (
                <p className={styles.empty}>
                  No work experience added yet. Go back to step 4 to add some, or mark that you have no
                  formal experience.
                </p>
              )}
            </div>
          ) : null}

          {activeSection === "education" ? (
            <div className={styles.stacked}>
              {education.length ? (
                education.map((entry) => (
                  <div key={entry.id} className={styles.entryCard}>
                    <p className={styles.entryTitle}>
                      {entry.qualification}
                      {entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ""}
                    </p>
                    <p className={styles.entryMeta}>
                      {entry.institution} · {entry.startYear}
                      {entry.status === "completed" ? ` – ${entry.endYear}` : ""}
                    </p>
                    {entry.achievements ? <p className={styles.entryText}>{entry.achievements}</p> : null}
                  </div>
                ))
              ) : (
                <p className={styles.empty}>No education added yet. Go back to step 3 to add some.</p>
              )}
            </div>
          ) : null}

          {activeSection === "skills" ? (
            <div className={styles.stacked}>
              <TagInput
                label="Skills to feature"
                name="builder-skills"
                tags={skills.technicalSkills}
                suggestions={suggestedSkills}
                onChange={() => undefined}
                helperText="Edit your skills on the Skills & certifications step — they appear here automatically."
              />
              <p className={styles.hint}>
                {skills.technicalSkills.length + skills.professionalSkills.length} skills will appear on your CV.
              </p>
            </div>
          ) : null}
        </div>

        {/* ---- live preview ---- */}
        <div className={styles.previewCol} aria-label="CV preview">
          <div className={styles.preview} ref={previewRef}>
            <p className={styles.previewName}>{fullName || "Your Name"}</p>
            {personal.headline ? <p className={styles.previewHeadline}>{personal.headline}</p> : null}
            <p className={styles.previewContact}>
              {[personal.town, personal.county].filter(Boolean).join(", ")}
              {personal.phone ? ` · ${personal.phone}` : ""}
            </p>

            {summary ? (
              <section className={styles.previewSection}>
                <h3 className={styles.previewHeading}>Professional summary</h3>
                <p className={styles.previewText}>{summary}</p>
              </section>
            ) : null}

            {experience.length ? (
              <section className={styles.previewSection}>
                <h3 className={styles.previewHeading}>Experience</h3>
                {experience.map((entry) => (
                  <div key={entry.id} className={styles.previewItem}>
                    <p className={styles.previewItemTitle}>
                      {entry.jobTitle} — {entry.employer}
                    </p>
                    <p className={styles.previewItemMeta}>
                      {entry.startDate} – {entry.isCurrent ? "Present" : entry.endDate}
                    </p>
                    {entry.responsibilities ? (
                      <p className={styles.previewText}>{entry.responsibilities}</p>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : null}

            {education.length ? (
              <section className={styles.previewSection}>
                <h3 className={styles.previewHeading}>Education</h3>
                {education.map((entry) => (
                  <div key={entry.id} className={styles.previewItem}>
                    <p className={styles.previewItemTitle}>
                      {entry.qualification}
                      {entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ""}
                    </p>
                    <p className={styles.previewItemMeta}>
                      {entry.institution} · {entry.startYear}
                      {entry.status === "completed" ? ` – ${entry.endYear}` : ""}
                    </p>
                  </div>
                ))}
              </section>
            ) : null}

            {skills.technicalSkills.length || skills.professionalSkills.length ? (
              <section className={styles.previewSection}>
                <h3 className={styles.previewHeading}>Skills</h3>
                <p className={styles.previewText}>
                  {[...skills.technicalSkills, ...skills.professionalSkills].join(" · ")}
                </p>
              </section>
            ) : null}
          </div>

          <p className={styles.exportNote}>
            <Download size={13} aria-hidden="true" />
            PDF export needs the backend document service. The preview above is
            exactly what will be generated.
          </p>
        </div>
      </div>
    </div>
  );
}
