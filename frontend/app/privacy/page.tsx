import type { Metadata } from "next";
import InfoShell from "@/components/layout/InfoShell";
import { ListSections } from "@/components/layout/InfoSections";
import { privacySections, legalUpdated } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — KaziHub KE",
  description:
    "How KaziHub KE collects, uses, stores and protects your personal data under Kenya's Data Protection Act, No. 24 of 2019 — and the rights you have over it.",
};

export default function PrivacyPage() {
  return (
    <InfoShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="What we collect, why we collect it, how long we keep it, and the control you have over your data."
      updated={legalUpdated}
    >
      <ListSections sections={privacySections} />
    </InfoShell>
  );
}
