import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Landmark, GraduationCap, School, Building2, Laptop, PenTool, Share2, type LucideIcon } from "lucide-react";
import InfoShell from "@/components/layout/InfoShell";
import { opportunityCategories, type CategoryId } from "@/data/categories";
import { serviceGroups } from "@/data/info";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Services & Opportunity Categories",
  description:
    "Jobs, government vacancies, internships, industrial attachments, remote work, freelance gigs and eligible online microtasks — everything KaziHub KE lists.",
};

const icons: Record<CategoryId, LucideIcon> = {
  "online-jobs": Briefcase,
  "government-jobs": Landmark,
  internships: GraduationCap,
  "industrial-attachments": School,
  "private-sector-jobs": Building2,
  "remote-jobs": Laptop,
  "freelance-work": PenTool,
  "social-media-tasks": Share2,
};

/** Map each category card to its public listing filter. */
const categoryFilter: Record<CategoryId, string> = {
  "online-jobs": "/jobs?category=online",
  "government-jobs": "/jobs?category=government",
  internships: "/jobs?category=internship",
  "industrial-attachments": "/jobs?category=attachment",
  "private-sector-jobs": "/jobs?category=private",
  "remote-jobs": "/jobs?category=online",
  "freelance-work": "/jobs?category=online",
  "social-media-tasks": "/#online-tasks",
};

export default function ServicesPage() {
  return (
    <InfoShell
      eyebrow="Services"
      title="What you can do on KaziHub KE"
      description="Nine opportunity categories and one account — browse everything without registering, and apply or post once you have an account."
    >
      <div className={styles.grid}>
        {opportunityCategories.map((category) => {
          const Icon = icons[category.id];
          return (
            <Link key={category.id} href={categoryFilter[category.id]} className={styles.card}>
              <span className={styles.icon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <h2 className={styles.cardTitle}>{category.name}</h2>
              <p className={styles.cardText}>{category.description}</p>
            </Link>
          );
        })}
      </div>

      {serviceGroups.map((group) => (
        <section key={group.title} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.title}</h2>
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </InfoShell>
  );
}
