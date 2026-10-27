"use client";

/**
 * Employer verification — the documented, configurable workflow.
 *
 * States: not started · submitted · pending review · action required ·
 * verified · rejected, with progress, requirements, upload controls,
 * submission confirmation and status history. The frontend NEVER approves
 * verification: the server stores submissions as pending review and
 * says so — no backend review has occurred.
 */
import { useEffect, useState } from "react";
import { History, Send, ShieldCheck } from "lucide-react";
import InputField from "@/components/common/InputField";
import SelectField from "@/components/common/SelectField";
import FileUpload from "@/components/common/FileUpload";
import Button from "@/components/common/Button";
import StatusMessage from "@/components/common/StatusMessage";
import VerificationStatusCard from "@/components/dashboard/VerificationStatusCard";
import PageLoading from "@/components/dashboard/PageLoading";
import { getEmployerOverview, type EmployerOverview } from "@/lib/dashboard-service";
import {
  employerVerificationPolicy,
  submitEmployerVerification,
  validateEmployerVerification,
  type EmployerVerificationSubmission,
} from "@/lib/verification-service";
import { canSubmitVerification } from "@/lib/permissions";
import { organizationTypes } from "@/lib/kenya-data";
import { apiBaseUrl } from "@/lib/auth-config";

const representativeRoles = [
  "Owner / Director",
  "HR Manager",
  "Recruitment Manager",
  "Operations Manager",
  "Finance Manager",
  "Other authorized representative",
];

const documentAccept = ".pdf,.jpg,.jpeg,.png";
const documentTypes = ["pdf", "jpg", "jpeg", "png"];

export default function EmployerVerificationPage() {
  const [overview, setOverview] = useState<EmployerOverview | null>(null);
  const [submission, setSubmission] = useState<EmployerVerificationSubmission>({
    legalName: "",
    organizationType: "",
    representativeName: "",
    representativeRole: "",
    officialEmail: "",
    website: "",
    registrationNumber: "",
    documentName: "",
  });
  const [document, setDocument] = useState<{ fileName: string; fileSize: number; storageKey?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getEmployerOverview().then((data) => {
      if (!active) return;
      setOverview(data);
      // Pre-fill from the saved company profile where it exists — never invented.
      setSubmission((previous) => ({
        ...previous,
        legalName: data.company.companyName || previous.legalName,
        organizationType: data.company.organizationType || previous.organizationType,
        officialEmail: data.recruitment.contactEmail || previous.officialEmail,
        website: data.company.website || previous.website,
      }));
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : "Could not load employer verification.");
    });
    return () => {
      active = false;
    };
  }, []);

  const reload = () => {
    getEmployerOverview().then(setOverview);
  };

  if (!overview && loadError) return <p role="alert" className="rounded-lg bg-danger-bg p-4 text-sm text-error">{loadError}</p>;
  if (!overview) return <PageLoading label="Loading verification…" />;

  const { session } = overview;
  const permission = canSubmitVerification(session);

  const update = (patch: Partial<EmployerVerificationSubmission>) =>
    setSubmission((previous) => ({ ...previous, ...patch }));

  const uploadDocument = async (file: File): Promise<string> => {
    if (!apiBaseUrl) throw new Error("The employer API is not configured.");
    const response = await fetch(`${apiBaseUrl}/storage/employer-verification`, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/octet-stream", "x-file-content-type": file.type },
      body: file,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || "Document upload failed.");
    return payload.key as string;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    const response = await submitEmployerVerification({
      ...submission,
      documentName: document?.fileName ?? "",
      documentKey: document?.storageKey ?? "",
    });
    if (!response.ok) {
      setErrors(validateEmployerVerification(submission));
      setResult({ ok: false, message: response.message });
    } else {
      setErrors({});
      setResult({ ok: true, message: response.message });
      reload();
    }
    setSubmitting(false);
  };

  const fieldStatus = (id: string): boolean => {
    switch (id) {
      case "legalName":
        return Boolean(submission.legalName.trim());
      case "organizationType":
        return Boolean(submission.organizationType);
      case "representativeName":
        return Boolean(submission.representativeName.trim());
      case "representativeRole":
        return Boolean(submission.representativeRole);
      case "officialEmail":
        return Boolean(submission.officialEmail.trim());
      case "website":
        return Boolean(submission.website.trim());
      case "registrationNumber":
        return Boolean(submission.registrationNumber.trim());
      case "document":
        return Boolean(document);
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <VerificationStatusCard
        variant="employer"
        status={session.verificationStatus}
        submittedAt={session.verificationSubmittedAt || undefined}
      />

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <ShieldCheck size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Verification policy</h2>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              {employerVerificationPolicy.summary}
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {employerVerificationPolicy.fields.map((field) => {
            const complete = fieldStatus(field.id);
            return (
              <li
                key={field.id}
                className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface p-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">
                    {field.label}
                    {field.required ? null : (
                      <span className="ml-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-soft">
                        optional
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{field.why}</p>
                </div>
                <span
                  className={
                    complete
                      ? "flex-shrink-0 self-start rounded-full border border-[#C8E6D2] bg-success-bg px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-success sm:self-auto"
                      : "flex-shrink-0 self-start rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em] text-muted sm:self-auto"
                  }
                >
                  {complete ? "Provided" : field.required ? "Required" : "Not provided"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <form
        className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        noValidate
      >
        <h2 className="text-[15px] font-bold tracking-tight text-ink">
          {session.verificationStatus === "action-required"
            ? "Update and resubmit your information"
            : "Submit verification information"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Organization legal or registered name"
            name="verify-legal-name"
            value={submission.legalName}
            onChange={(value) => update({ legalName: value })}
            required
            error={errors.legalName}
          />
          <SelectField
            label="Organization type"
            name="verify-org-type"
            value={submission.organizationType}
            options={organizationTypes}
            onChange={(value) => update({ organizationType: value })}
            required
            error={errors.organizationType}
          />
          <InputField
            label="Authorized representative's name"
            name="verify-rep-name"
            value={submission.representativeName}
            onChange={(value) => update({ representativeName: value })}
            required
            error={errors.representativeName}
          />
          <SelectField
            label="Authorized representative's role"
            name="verify-rep-role"
            value={submission.representativeRole}
            options={representativeRoles}
            onChange={(value) => update({ representativeRole: value })}
            required
            error={errors.representativeRole}
          />
          <InputField
            label="Official organization email or contact evidence"
            name="verify-email"
            type="email"
            value={submission.officialEmail}
            onChange={(value) => update({ officialEmail: value })}
            required
            error={errors.officialEmail}
          />
          <InputField
            label="Website or other organization information"
            name="verify-website"
            type="url"
            value={submission.website}
            onChange={(value) => update({ website: value })}
          />
          <InputField
            label="Business registration number"
            name="verify-reg-number"
            value={submission.registrationNumber}
            onChange={(value) => update({ registrationNumber: value })}
          />
        </div>

        <FileUpload
          label="Supporting document (only if required)"
          accept={documentAccept}
          allowedTypes={documentTypes}
          maxSize={5 * 1024 * 1024}
          kindLabel="document"
          value={document}
          onChange={setDocument}
          onUploadFile={uploadDocument}
          helperText="Upload a relevant business document if requested. The file is stored privately and only administrators can review it."
        />

        {result ? (
          <StatusMessage type={result.ok ? "success" : "error"}>
            <strong>{result.ok ? "Submitted." : "Could not submit."}</strong>
            <p>{result.message}</p>
          </StatusMessage>
        ) : null}

        <div>
          <Button type="submit" disabled={!permission.allowed || submitting}>
            <Send size={15} aria-hidden="true" />
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
          {!permission.allowed ? (
            <p className="mt-2 text-[12px] text-muted">{permission.reason}</p>
          ) : null}
        </div>
      </form>

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <History size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Status history</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Current verification details are saved on the platform and reviewed by an administrator.
            </p>
          </div>
        </div>

        {session.verificationHistory.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-line bg-surface p-3.5 text-[12.5px] text-muted">
            No verification activity yet — the status changes you make appear here.
          </p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2">
            {session.verificationHistory.map((event, index) => (
              <li
                key={`${event.status}-${event.at}-${index}`}
                className="rounded-lg border border-line bg-surface p-3.5"
              >
                <p className="text-[13px] font-bold capitalize text-ink">
                  {event.status.replace("-", " ")}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  {new Date(event.at).toLocaleString("en-KE")} — {event.note}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-[11.5px] leading-snug text-muted">
        Saved company details from your profile are pre-filled above. Verification decisions are
        made by the backend — the frontend can never approve verification, and a verified badge only
        ever comes from a confirmed backend status.
      </p>
    </div>
  );
}
