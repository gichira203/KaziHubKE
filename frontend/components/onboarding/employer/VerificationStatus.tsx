"use client";

/**
 * Employer onboarding step 4 — verification status.
 *
 * An employer is NEVER shown as verified unless the backend confirms it. This
 * screen renders the five possible states and, when a document is required,
 * requests it through the same secure upload used for CVs (validated, staged
 * locally, no claims made about the outcome).
 */
import { useState } from "react";
import { BadgeCheck, Clock, FileWarning, Send, ShieldAlert, XCircle } from "lucide-react";
import FileUpload from "@/components/common/FileUpload";
import StatusMessage from "@/components/common/StatusMessage";
import { CV_ALLOWED_EXTENSIONS, CV_ALLOWED_TYPES, CV_MAX_SIZE } from "@/lib/validation";
import { verificationStatusLabels } from "@/lib/kenya-data";
import type { EmployerVerification, VerificationStatus } from "@/lib/onboarding-types";
import styles from "./VerificationStatus.module.css";

type VerificationStatusProps = {
  value: EmployerVerification;
  onChange: (value: EmployerVerification) => void;
};

const statusStyles: Record<VerificationStatus, { className: string; icon: typeof BadgeCheck }> = {
  "not-submitted": { className: "statusNeutral", icon: ShieldAlert },
  "pending-review": { className: "statusPending", icon: Clock },
  verified: { className: "statusVerified", icon: BadgeCheck },
  "more-info-required": { className: "statusWarning", icon: FileWarning },
  rejected: { className: "statusRejected", icon: XCircle },
};

const statusCopy: Record<VerificationStatus, string> = {
  "not-submitted":
    "Your account is not verified yet. Verification lets candidates trust your vacancies and unlocks posting.",
  "pending-review":
    "Our team is reviewing your submission. This usually takes 1–3 business days. You will get an email when it is done.",
  verified:
    "Your organization is verified. Verified employers get a badge on their vacancies and priority in candidate search.",
  "more-info-required":
    "We need a bit more information before we can verify your organization. Check the note below and re-submit.",
  rejected:
    "We could not verify your organization with the details provided. Review the reason below and contact support if you believe this is a mistake.",
};

export default function VerificationStatus({ value, onChange }: VerificationStatusProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const statusStyle = statusStyles[value.status];
  const StatusIcon = statusStyle.icon;

  const handleSubmit = () => {
    setSubmitting(true);
    // Backend integration point: POST apiEndpoints.employerVerification with
    // the document. Until then, the request is only staged locally and the
    // status is NOT changed to pending on a false promise.
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h2 className={styles.title} id="onboarding-step-title">
          Verification
        </h2>
        <p className={styles.lead}>
          Verified employers build more trust with candidates. Nothing is
          verified automatically — our team reviews every submission.
        </p>
      </div>

      {/* ---- current status ---- */}
      <div className={`${styles.statusCard} ${styles[statusStyle.className]}`}>
        <span className={styles.statusIcon} aria-hidden="true">
          <StatusIcon size={20} />
        </span>
        <div className={styles.statusBody}>
          <p className={styles.statusLabel}>{verificationStatusLabels[value.status]}</p>
          <p className={styles.statusText}>{statusCopy[value.status]}</p>
          {value.submittedAt ? (
            <p className={styles.statusMeta}>Submitted {new Date(value.submittedAt).toLocaleDateString("en-KE")}</p>
          ) : null}
          {value.notes ? <p className={styles.statusNotes}>{value.notes}</p> : null}
        </div>
      </div>

      {/* ---- what we may ask for ---- */}
      <div className={styles.requirements}>
        <p className={styles.requirementsTitle}>What we may ask for</p>
        <ul>
          <li>Business registration certificate or PIN</li>
          <li>Proof that you represent the organization (e.g. a letterhead email)</li>
          <li>Company contact details we can call to confirm</li>
        </ul>
        <p className={styles.requirementsNote}>
          We only ask for documents we actually need, and we never ask for
          anything sensitive beyond these.
        </p>
      </div>

      {/* ---- document upload ---- */}
      {value.status === "not-submitted" || value.status === "more-info-required" ? (
        <div className={styles.submitBlock}>
          <FileUpload
            label="Supporting document"
            accept={CV_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            allowedTypes={CV_ALLOWED_TYPES}
            maxSize={CV_MAX_SIZE}
            kindLabel="Document"
            value={value.documentName ? { fileName: value.documentName, fileSize: value.documentSize } : null}
            onChange={(file) =>
              onChange({
                ...value,
                documentName: file?.fileName ?? "",
                documentSize: file?.fileSize ?? 0,
              })
            }
            helperText="PDF or Word document. Upload only what we asked for."
          />

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!value.documentName || submitting || submitted}
          >
            <Send size={15} aria-hidden="true" />
            {submitted
              ? "Submission staged"
              : submitting
                ? "Submitting…"
                : value.status === "more-info-required"
                  ? "Re-submit for verification"
                  : "Submit for verification"}
          </button>

          {submitted ? (
            <StatusMessage type="info">
              <strong>Ready to submit — waiting on the backend.</strong>
              <p>
                Your document is validated and staged on this device. Submitting
                it for review needs the verification service, which is not
                connected in this preview. Your status stays “Not submitted” until
                the backend confirms the review.
              </p>
            </StatusMessage>
          ) : (
            <StatusMessage type="info">
              <strong>Verification is not connected yet.</strong>
              <p>
                You can prepare and stage your document now. The actual review,
                status changes and approval emails all require the verification
                backend.
              </p>
            </StatusMessage>
          )}
        </div>
      ) : null}
    </div>
  );
}
