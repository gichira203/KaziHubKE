"use client";

/**
 * Step 6 — CV. Three routes: fill in manually, upload an existing CV
 * (PDF/DOCX), or build one from scratch.
 *
 * CVs are stored privately by the API, then parsed to suggest profile fields.
 * Suggestions fill empty fields and remain editable before the profile is saved.
 */
import { useState } from "react";
import { FileText, PenLine, Sparkles, Upload } from "lucide-react";
import FileUpload from "@/components/common/FileUpload";
import StatusMessage from "@/components/common/StatusMessage";
import { CV_ALLOWED_EXTENSIONS, CV_ALLOWED_TYPES, CV_MAX_SIZE } from "@/lib/validation";
import { apiBaseUrl } from "@/lib/auth-config";
import { autofillFromCv, uploadCvFile, type CvAutofill } from "@/lib/cv-service";
import type { CvMethod, JobSeekerCv } from "@/lib/onboarding-types";
import styles from "./CVUpload.module.css";

type CVUploadProps = {
  value: JobSeekerCv;
  onChange: (value: JobSeekerCv) => void;
  onOpenBuilder: () => void;
  onAutofill: (profile: CvAutofill) => void;
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

export default function CVUpload({ value, onChange, onOpenBuilder, onAutofill }: CVUploadProps) {
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parseMessage, setParseMessage] = useState("");

  const update = (patch: Partial<JobSeekerCv>) => onChange({ ...value, ...patch });

  const parseCv = async () => {
    if (!value.upload?.storageKey) return;
    setParsing(true);
    setParseError("");
    setParseMessage("");
    try {
      const result = await autofillFromCv(value.upload.storageKey);
      onAutofill(result.profile);
      setParseMessage(result.aiAvailable
        ? "AI filled the profile fields it identified. Review each section and correct anything that needs changing."
        : "We extracted the profile fields we could identify. Review each section and correct anything that needs changing. AI is not enabled on the API yet.");
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Could not read this CV. Try a text-based PDF or DOCX.");
    } finally {
      setParsing(false);
    }
  };

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
            onUploadFile={apiBaseUrl ? uploadCvFile : undefined}
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
                onClick={() => void parseCv()}
                disabled={!apiBaseUrl || !value.upload.storageKey || parsing}
              >
                <FileText size={15} aria-hidden="true" />
                {parsing ? "Reading your CV…" : "Autofill my profile from this CV"}
              </button>

              {!apiBaseUrl ? (
                <StatusMessage type="warning">
                  <strong>Connect the KaziHub API to read your CV.</strong>
                  <p>CV uploads require the API and private object storage.</p>
                </StatusMessage>
              ) : parseMessage ? (
                <StatusMessage type="info">
                  <strong>Review the suggested details.</strong>
                  <p>{parseMessage} Existing profile details were left unchanged. Save your profile to keep the updates.</p>
                </StatusMessage>
              ) : (
                <StatusMessage type="info">
                  <strong>Read this CV to prefill your profile.</strong>
                  <p>CV text is extracted by the KaziHub API. Neon AI Gateway can structure experience and education when enabled.</p>
                </StatusMessage>
              )}
              {parseError ? <StatusMessage type="error"><strong>CV autofill failed.</strong><p>{parseError}</p></StatusMessage> : null}
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
