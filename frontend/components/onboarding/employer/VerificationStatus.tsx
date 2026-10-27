"use client";

import { ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";
import StatusMessage from "@/components/common/StatusMessage";
import { verificationStatusLabels } from "@/lib/kenya-data";
import type { EmployerVerification } from "@/lib/onboarding-types";

export default function VerificationStatus({ value }: { value: EmployerVerification }) {
  const tone = value.status === "verified"
    ? "success"
    : value.status === "pending-review"
      ? "info"
      : value.status === "rejected"
        ? "error"
        : "warning";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-ink" id="onboarding-step-title">
          Employer verification
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Submit organization details and any requested evidence in the verification centre. An administrator reviews each submission.
        </p>
      </div>
      <StatusMessage type={tone}>
        <strong><ShieldCheck size={15} className="mr-1 inline" aria-hidden="true" />{verificationStatusLabels[value.status]}</strong>
        <p>{value.status === "pending-review" ? "Your submission is waiting for an administrator." : value.notes || "Verification is managed separately from your company profile."}</p>
      </StatusMessage>
      {value.submittedAt ? <p className="text-xs text-muted">Submitted {new Date(value.submittedAt).toLocaleDateString("en-KE")}</p> : null}
      <Button href="/employer/dashboard/verification" variant="primary">
        Open verification centre
      </Button>
    </div>
  );
}
