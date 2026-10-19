"use client";

/**
 * Step 6 — CV. Three routes: fill in manually, upload an existing CV
 * (PDF/DOCX), or build one from scratch.
 *
 * The uploaded file is validated and held locally; its contents are never put in
 * sessionStorage. When a CV parsing service is connected, extracted fields are
 * presented for review BEFORE anything overwrites the profile — see the
 * "review extracted details" panel, which stays disabled until a parser exists.
 */
import { useState } from "react";
import { FileText, PenLine, Sparkles, Upload } from "lucide-react";
import FileUpload from "@/components/common/FileUpload";
import StatusMessage from "@/components/common/StatusMessage";
import { CV_ALLOWED_EXTENSIONS, CV_ALLOWED_TYPES, CV_MAX_SIZE } from "@/lib/validation";
import { isBackendConfigured } from "@/lib/auth-config";
import type { CvMethod, JobSeekerCv } from "@/lib/onboarding-types";
import styles from "./CVUpload.module.css";

type CVUploadProps = {
  value: JobSeekerCv;
  onChange: (value: JobSeekerCv) => void;
  onOpenBuilder: () => void;
};

const methods: Array<{ id: CvMethod; icon: typeof PenLine; title: string; description: string }> = [
  {
    id: "manual",
    icon: PenLine,
    title: "Fill in the information manually",
    description: "Answer a few questions below and we structure it into a CV for you.",
  },
  {
    id: "upload",
    icon: Upload,
    title: "Upload an existing CV",
    description: "Already have a CV? Upload your PDF or Word document.",
  },
  {
    id: "build",
    icon: Sparkles,
    title: "Build a CV from scratch",
    description: "Guided, section by section, with a live preview as you type.",
  },
];

export default function CVUpload({ value, onChange, onOpenBuilder }: CVUploadProps) {
  const [parseRequested, setParseRequested] = useState(false);
  const parserAvailable = isBackendConfigured();

  const update = (patch: Partial<JobSeekerCv>) => onChange({ ...value, ...patch });

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          CV &amp; resume
        </h2>
        <p className={styles.lead}>
          Three ways to get your career profile ready. None of them are required
          to keep using KaziHub KE — you can finish this later.
        </p>
      </div>

      {/* ---- method chooser ---- */}
      <div className={styles.methods} role="radiogroup" aria-label="Choose how to create your CV">
        {methods.map((method) => {
          const selected = value.method === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${styles.method} ${selected ? styles.methodSelected : ""}`}
              onClick={() => update({ method: method.id })}
            >
              <span className={`${styles.methodIcon} ${selected ? styles.methodIconSelected : ""}`}>
                <method.icon size={18} aria-hidden="true" />
              </span>
              <span className={styles.methodBody}>
                <span className={styles.methodTitle}>{method.title}</span>
                <span className={styles.methodDescription}>{method.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- manual ---- */}
      {value.method === "manual" ? (
        <div className={styles.manual}>
          <label className={styles.textareaLabel} htmlFor="cv-professional-summary">
            Professional summary
            <span className={styles.optional}> (optional)</span>
          </label>
          <textarea
            id="cv-professional-summary"
            className={styles.textarea}
            value={value.professionalSummary}
            onChange={(event) => update({ professionalSummary: event.target.value })}
            placeholder="A short paragraph about what you do, your strengths and what you are looking for."
            rows={4}
          />

          <div className={styles.twoCol}>
            <div>
              <label className={styles.textareaLabel} htmlFor="cv-projects">
                Projects
                <span className={styles.optional}> (optional)</span>
              </label>
              <textarea
                id="cv-projects"
                className={styles.textarea}
                value={value.projects}
                onChange={(event) => update({ projects: event.target.value })}
                placeholder="Projects you are proud of, with links where possible."
                rows={4}
              />
            </div>
            <div>
              <label className={styles.textareaLabel} htmlFor="cv-references">
                References
                <span className={styles.optional}> (optional)</span>
              </label>
              <textarea
                id="cv-references"
                className={styles.textarea}
                value={value.references}
                onChange={(event) => update({ references: event.target.value })}
                placeholder="Name, role and contact details. Add 'Available on request' if you prefer."
                rows={4}
              />
            </div>
          </div>

          <p className={styles.manualNote}>
            Education, work experience and skills are already captured in the
            earlier steps and will be included in your CV automatically.
          </p>
        </div>
      ) : null}

      {/* ---- upload ---- */}
      {value.method === "upload" ? (
        <div className={styles.upload}>
          <FileUpload
            label="Upload your CV"
            accept={CV_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            allowedTypes={CV_ALLOWED_TYPES}
            maxSize={CV_MAX_SIZE}
            kindLabel="CV"
            value={value.upload}
            onChange={(file) =>
              update({
                upload: file
                  ? { ...file, uploadedAt: new Date().toISOString(), parsedSummary: "", reviewed: false }
                  : null,
              })
            }
            helperText="PDF or Word document. Your file stays private — employers only see the version you allow."
          />

          {value.upload ? (
            <div className={styles.parseBlock}>
              <button
                type="button"
                className={styles.parseButton}
                onClick={() => setParseRequested(true)}
                disabled={!parserAvailable || parseRequested}
              >
                <FileText size={15} aria-hidden="true" />
                {parseRequested ? "Parsing requested" : "Extract details from this CV"}
              </button>

              {parserAvailable ? (
                <StatusMessage type="info">
                  <strong>Review before anything is saved.</strong>
                  <p>
                    Extracted details are shown for you to check, edit and approve.
                    Nothing overwrites your profile without your confirmation.
                  </p>
                </StatusMessage>
              ) : (
                <StatusMessage type="info">
                  <strong>CV parsing is not connected yet.</strong>
                  <p>
                    Your file is validated and staged on this device. Automatic
                    extraction requires a backend CV parsing service — until then,
                    use manual entry or the CV builder.
                  </p>
                </StatusMessage>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ---- build from scratch ---- */}
      {value.method === "build" ? (
        <div className={styles.build}>
          <p className={styles.buildText}>
            The CV builder walks you through each section — summary, experience,
            education, skills, projects and references — with a live preview.
          </p>
          <button type="button" className={styles.builderButton} onClick={onOpenBuilder}>
            <Sparkles size={16} aria-hidden="true" />
            Open the CV builder
          </button>
          {value.draftSavedAt ? (
            <p className={styles.draftNote}>
              Draft saved {new Date(value.draftSavedAt).toLocaleString("en-KE")}. You can come back to it any time.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
