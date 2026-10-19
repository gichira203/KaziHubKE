import type { Metadata } from "next";
import InfoShell from "@/components/layout/InfoShell";
import { ParagraphSections } from "@/components/layout/InfoSections";
import { aboutSections } from "@/data/info";

export const metadata: Metadata = {
  title: "About KaziHub KE",
  description:
    "KaziHub KE brings jobs, internships, industrial attachments, government vacancies, remote work and eligible online microtasks together for Kenyans — with honest listings and no employment guarantees.",
};

export default function AboutPage() {
  return (
    <InfoShell
      eyebrow="About Us"
      title="One place for every kind of opportunity"
      description="KaziHub KE connects job seekers, students, employers and online earners across Kenya — and is honest about what a platform can and cannot promise."
    >
      <ParagraphSections sections={aboutSections} />
    </InfoShell>
  );
}
