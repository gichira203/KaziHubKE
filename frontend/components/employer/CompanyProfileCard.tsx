/**
 * CompanyProfileCard — the employer's public profile preview.
 *
 * An incomplete account shows honest placeholders ("Not added yet") for
 * every field rather than invented values. A company is only ever shown as
 * verified from a confirmed backend status.
 */
import { Building2, Globe, MapPin, Pencil, Users } from "lucide-react";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import {
  verificationStatusLabels,
  verificationStatusTones,
  type VerificationStatus,
} from "@/lib/account-types";
import type { EmployerCompany } from "@/lib/onboarding-types";

type CompanyProfileCardProps = {
  company: EmployerCompany;
  verificationStatus: VerificationStatus;
  editHref: string;
};

const NOT_SET = "Not added yet";

export default function CompanyProfileCard({
  company,
  verificationStatus,
  editHref,
}: CompanyProfileCardProps) {
  const location = [company.city, company.county].filter(Boolean).join(", ");

  const details: { label: string; value: string; icon: typeof Building2 }[] = [
    { label: "Industry", value: company.industry || NOT_SET, icon: Building2 },
    { label: "Location", value: location || NOT_SET, icon: MapPin },
    { label: "Company size", value: company.companySize || NOT_SET, icon: Users },
    {
      label: "Website",
      value: company.website || NOT_SET,
      icon: Globe,
    },
  ];

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Logo placeholder — never a fabricated logo. */}
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-surface text-muted-soft">
            <Building2 size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">
              {company.companyName || "Your company profile is incomplete"}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {company.organizationType || NOT_SET} ·{" "}
              {company.logoName ? "Logo added" : "No logo yet"}
            </p>
          </div>
        </div>
        <StatusBadge
          label={verificationStatusLabels[verificationStatus]}
          tone={verificationStatusTones[verificationStatus]}
        />
      </div>

      <p className="mt-3 rounded-lg border border-line bg-surface p-3 text-[12.5px] leading-relaxed text-muted">
        {company.companyName && company.description.trim()
          ? company.description
          : "Your company profile is not complete yet. Add your organization details to prepare your employer profile — candidates see this on every listing."}
      </p>

      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="rounded-lg border border-line bg-surface p-3">
            <dt className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">
              <detail.icon size={12} aria-hidden="true" />
              {detail.label}
            </dt>
            <dd className="mt-1 text-[13px] font-medium text-ink">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <Button href={editHref} variant="outline">
          <Pencil size={14} aria-hidden="true" />
          Edit Company Profile
        </Button>
      </div>
    </section>
  );
}
