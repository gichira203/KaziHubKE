"use client";

/**
 * CareerProfileCard — "Your Career Profile" / "My CV".
 *
 * Offers the three honest routes for an incomplete account: upload an
 * existing CV, build one manually, or complete the professional profile
 * first. No fake upload success: the file is validated and staged in the
 * browser, and only its metadata is remembered (contents never touch
 * storage). Preview stays unavailable until a secure backend exists.
 */
import { useState } from "react";
import Link from "next/link";
import { FileText, PenLine, Sparkles, Upload } from "lucide-react";
import FileUpload from "@/components/common/FileUpload";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import {
  CV_ALLOWED_EXTENSIONS,
  CV_ALLOWED_TYPES,
  CV_MAX_SIZE,
} from "@/lib/validation";
import type { JobSeekerCv } from "@/lib/onboarding-types";

type CareerProfileCardProps = {
  cv: JobSeekerCv;
  variant?: "overview" | "full";
  /** Full variant: report a staged upload so the page can persist metadata. */
  onUploadChange?: (file: { fileName: string; fileSize: number } | null) => void;
};

export default function CareerProfileCard({
  cv,
  variant = "overview",
  onUploadChange,
}: CareerProfileCardProps) {
  const [staged, setStaged] = useState<{ fileName: string; fileSize: number } | null>(null);

  const savedUpload = cv.upload;
  const manualSummary = cv.professionalSummary.trim().length > 0;

  const handleUpload = (file: { fileName: string; fileSize: number } | null) => {
    setStaged(file);
    onUploadChange?.(file);
  };

  const status =
    savedUpload
      ? { label: "CV uploaded", tone: "success" as const }
      : manualSummary
        ? { label: "CV in progress", tone: "warning" as const }
        : { label: "No CV yet", tone: "neutral" as const };

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <FileText size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">
              {variant === "full" ? "My CV" : "Your Career Profile"}
            </h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted">
              Most applications ask for a CV. Choose how you want to get yours ready — you can
              change this at any time.
            </p>
          </div>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>

      {savedUpload ? (
        <p className="mt-3 text-[12.5px] text-muted">
          Saved: <strong className="font-semibold text-ink">{savedUpload.fileName}</strong> · last
          updated {new Date(savedUpload.uploadedAt).toLocaleDateString("en-KE")}
        </p>
      ) : null}

      {variant === "overview" ? (
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <li>
            <Link
              href="/dashboard/cv"
              className="flex h-full items-start gap-2.5 rounded-lg border border-line bg-surface p-3 transition hover:border-brand hover:bg-white"
            >
              <Upload size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand" />
              <span>
                <span className="block text-[13px] font-bold text-ink">Upload an existing CV</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                  PDF or DOCX, up to 5 MB.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/cv"
              className="flex h-full items-start gap-2.5 rounded-lg border border-line bg-surface p-3 transition hover:border-brand hover:bg-white"
            >
              <Sparkles size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand" />
              <span>
                <span className="block text-[13px] font-bold text-ink">Build a CV manually</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                  Guided section by section.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/onboarding/job-seeker"
              className="flex h-full items-start gap-2.5 rounded-lg border border-line bg-surface p-3 transition hover:border-brand hover:bg-white"
            >
              <PenLine size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand" />
              <span>
                <span className="block text-[13px] font-bold text-ink">
                  Complete the professional profile first
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                  Add experience and skills, then decide on your CV.
                </span>
              </span>
            </Link>
          </li>
        </ul>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <FileUpload
            label="Upload your CV"
            accept={CV_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            allowedTypes={CV_ALLOWED_TYPES}
            maxSize={CV_MAX_SIZE}
            kindLabel="CV"
            value={staged}
            onChange={handleUpload}
            helperText="PDF and DOCX supported. The file is validated in your browser and its metadata is remembered for this session — contents are never stored."
          />

          <div className="flex flex-wrap gap-2.5">
            <Button href="/onboarding/job-seeker" variant="outline">
              <PenLine size={15} aria-hidden="true" />
              Build or edit my CV manually
            </Button>
            <Button href="/onboarding/job-seeker" variant="ghost">
              Edit my professional profile
            </Button>
          </div>

          <dl className="grid grid-cols-1 gap-2 rounded-lg border border-line bg-surface p-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
                CV status
              </dt>
              <dd className="mt-0.5 text-[13px] text-ink">
                {savedUpload
                  ? `Uploaded — ${savedUpload.fileName}`
                  : manualSummary
                    ? "Manual CV in progress"
                    : "No CV yet"}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Last updated
              </dt>
              <dd className="mt-0.5 text-[13px] text-ink">
                {savedUpload
                  ? new Date(savedUpload.uploadedAt).toLocaleDateString("en-KE")
                  : manualSummary && cv.draftSavedAt
                    ? new Date(cv.draftSavedAt).toLocaleDateString("en-KE")
                    : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Preview
              </dt>
              <dd className="mt-0.5 text-[13px] text-muted">
                Available once a secure document service is connected.
              </dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Replace
              </dt>
              <dd className="mt-0.5 text-[13px] text-muted">
                Use the upload control above to replace your file.
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
