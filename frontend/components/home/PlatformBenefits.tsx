import {
  Layers,
  Search,
  GraduationCap,
  Landmark,
  MousePointerClick,
  Smartphone,
  ClipboardCheck,
  FileBadge,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import styles from "./PlatformBenefits.module.css";

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: Layers,
    title: "Everything in one place",
    description:
      "Multiple opportunity categories — jobs, attachments, government vacancies and online tasks — on a single platform.",
  },
  {
    icon: Search,
    title: "Easy discovery",
    description:
      "Search and filter openings quickly to find the jobs and internships that match your goals.",
  },
  {
    icon: GraduationCap,
    title: "Student attachments",
    description:
      "Dedicated internship and industrial attachment listings for college and university students.",
  },
  {
    icon: Landmark,
    title: "Government information",
    description:
      "Access public-sector vacancies and official recruitment announcements in one feed.",
  },
  {
    icon: MousePointerClick,
    title: "Online microtasks",
    description:
      "Discover eligible digital tasks with clearly stated actions, rewards and conditions.",
  },
  {
    icon: Smartphone,
    title: "Mobile-friendly",
    description:
      "A responsive experience that works smoothly on phones, tablets and desktops.",
  },
  {
    icon: ClipboardCheck,
    title: "Clear requirements",
    description:
      "Every opportunity lists its eligibility, deadlines and required actions up front.",
  },
  {
    icon: FileBadge,
    title: "Career and CV support",
    description:
      "Guidance to help you prepare a professional CV and present your profile well.",
  },
];

export default function PlatformBenefits() {
  return (
    <section className={styles.section} aria-labelledby="benefits-title">
      <div className={styles.container}>
        <div id="benefits-title">
          <SectionHeading
            eyebrow="Why KaziHub KE"
            title="Platform Benefits"
            description="Built to make finding work, placements and online earning opportunities straightforward and transparent."
          />
        </div>

        <div className={styles.grid}>
          {benefits.map((benefit) => (
            <article key={benefit.title} className={styles.card}>
              <span className={styles.iconWrap} aria-hidden="true">
                <benefit.icon size={20} />
              </span>
              <div>
                <h3 className={styles.title}>{benefit.title}</h3>
                <p className={styles.description}>{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
