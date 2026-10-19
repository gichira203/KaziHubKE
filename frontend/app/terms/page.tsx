import type { Metadata } from "next";
import InfoShell from "@/components/layout/InfoShell";
import { ListSections } from "@/components/layout/InfoSections";
import { termsSections, legalUpdated } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Service — KaziHub KE",
  description:
    "The rules for using KaziHub KE: accounts, listings, applications, tasks and rewards, acceptable use, suspension and liability. Governed by the laws of Kenya.",
};

export default function TermsPage() {
  return (
    <InfoShell
      eyebrow="Legal"
      title="Terms of Service"
      description="The agreement between you and KaziHub KE when you use the platform."
      updated={legalUpdated}
    >
      <ListSections sections={termsSections} />
    </InfoShell>
  );
}
