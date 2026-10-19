import type { Metadata } from "next";
import InfoShell from "@/components/layout/InfoShell";
import { ListSections } from "@/components/layout/InfoSections";
import { guidelineSections, legalUpdated } from "@/data/legal";

export const metadata: Metadata = {
  title: "Community Guidelines — KaziHub KE",
  description:
    "How to use KaziHub KE honestly and respectfully — and what happens when the rules are broken.",
};

export default function CommunityGuidelinesPage() {
  return (
    <InfoShell
      eyebrow="Community"
      title="Community Guidelines"
      description="KaziHub KE works because people are honest with each other. These guidelines keep it that way."
      updated={legalUpdated}
    >
      <ListSections sections={guidelineSections} />
    </InfoShell>
  );
}
