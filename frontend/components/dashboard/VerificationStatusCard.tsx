/**
 * VerificationStatusCard — shows account verification INDEPENDENTLY of
 * profile completion.
 *
 * States: not started · submitted · pending review · action required ·
 * verified · rejected. `verified` only ever arrives from the backend — there
 * is no frontend code path that produces it, and no fake verified badge is
 * ever shown. Job seekers are not asked for identity documents by default.
 */
import Link from "next/link";
import {
  BadgeCheck,
  CircleAlert,
  Clock,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  verificationStatusLabels,
  verificationStatusTones,
  type VerificationStatus,
} from "@/lib/account-types";

type VerificationStatusCardProps = {
  variant: "seeker" | "employer";
  status: VerificationStatus;
  submittedAt?: string;
};

interface StateCopy {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

function copyFor(variant: "seeker" | "employer", status: VerificationStatus): StateCopy {
  if (variant === "seeker") {
    switch (status) {
      case "verified":
        return {
          icon: BadgeCheck,
          title: "Your identity is verified",
          body: "Verified by KaziHub KE. You can apply for opportunities that require verified identity.",
        };
      case "pending-review":
        return {
          icon: Clock,
          title: "Verification is awaiting review",
          body: "Your information has been submitted and is awaiting review. You will be notified when a decision is made.",
        };
      case "action-required":
        return {
          icon: CircleAlert,
          title: "Action required",
          body: "Some information needs correction. Review the requested changes before resubmitting.",
          actionLabel: "Review requested changes",
          actionHref: "/dashboard/verification",
        };
      case "rejected":
        return {
          icon: ShieldAlert,
          title: "Verification was not approved",
          body: "Your verification could not be approved. The reason and next steps are shown on the verification page.",
          actionLabel: "See next steps",
          actionHref: "/dashboard/verification",
        };
      case "submitted":
        return {
          icon: FileSearch,
          title: "Verification submitted",
          body: "Your information has been submitted and is awaiting review.",
        };
      default:
        return {
          icon: ShieldCheck,
          title: "Verification not started",
          body: "Identity verification is not required to browse or apply for most opportunities. When an opportunity requires verified identity, KaziHub KE will ask for it at that point — you never need to upload sensitive documents just to use your dashboard.",
          actionLabel: "Learn what verification involves",
          actionHref: "/dashboard/verification",
        };
    }
  }

  switch (status) {
    case "verified":
      return {
        icon: BadgeCheck,
        title: "Your organization is verified",
        body: "Confirmed by KaziHub KE. You can publish listings, receive applications and search candidates.",
      };
    case "pending-review":
      return {
        icon: Clock,
        title: "Verification submitted — awaiting review",
        body: "Your information has been submitted and is awaiting review. Publishing stays locked until verification is confirmed.",
        actionLabel: "View verification status",
        actionHref: "/employer/dashboard/verification",
      };
    case "action-required":
      return {
        icon: CircleAlert,
        title: "Action required",
        body: "Some information needs correction. Review the requested changes before resubmitting.",
        actionLabel: "Review requested changes",
        actionHref: "/employer/dashboard/verification",
      };
    case "rejected":
      return {
        icon: ShieldAlert,
        title: "Verification was not approved",
        body: "Your verification could not be approved. The reason and next steps are shown on the verification page.",
        actionLabel: "See next steps",
        actionHref: "/employer/dashboard/verification",
      };
    case "submitted":
      return {
        icon: FileSearch,
        title: "Verification submitted",
        body: "Your information has been submitted and is awaiting review.",
      };
    default:
      return {
        icon: ShieldCheck,
        title: "Verification not started",
        body: "Verification lets you publish listings, receive applications and search candidates. You can prepare your company profile and job drafts now — publishing unlocks after verification and moderation.",
        actionLabel: "Start verification",
        actionHref: "/employer/dashboard/verification",
      };
  }
}

export default function VerificationStatusCard({
  variant,
  status,
  submittedAt,
}: VerificationStatusCardProps) {
  const copy = copyFor(variant, status);
  const Icon = copy.icon;

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
            <Icon size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Account Verification</h2>
            <p className="mt-1 text-[13.5px] font-semibold text-ink">{copy.title}</p>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted">{copy.body}</p>
            {submittedAt ? (
              <p className="mt-1.5 text-[11.5px] text-muted">
                Submitted {new Date(submittedAt).toLocaleString("en-KE")} (local demo — no backend
                review has occurred).
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge
          label={verificationStatusLabels[status]}
          tone={verificationStatusTones[status]}
        />
      </div>

      {copy.actionLabel && copy.actionHref ? (
        <div className="mt-4">
          <Link
            href={copy.actionHref}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-brand-dark transition hover:border-brand hover:bg-success-bg"
          >
            {copy.actionLabel}
          </Link>
        </div>
      ) : null}

      <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-snug text-muted">
        Verification status is independent of profile completion. Only a confirmed backend status
        shows a verified badge.
      </p>
    </section>
  );
}
