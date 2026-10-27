import {
  Briefcase,
  Landmark,
  GraduationCap,
  School,
  Building2,
  Laptop,
  PenTool,
  Share2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { OpportunityCategory } from "@/data/categories";
import styles from "./OpportunityCard.module.css";

const icons: Record<OpportunityCategory["icon"], LucideIcon> = {
  briefcase: Briefcase,
  landmark: Landmark,
  graduationCap: GraduationCap,
  school: School,
  building: Building2,
  laptop: Laptop,
  penTool: PenTool,
  share: Share2,
};

type OpportunityCardProps = {
  category: OpportunityCategory;
};

export default function OpportunityCard({ category }: OpportunityCardProps) {
  const Icon = icons[category.icon];

  return (
    <article className={styles.card}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon size={22} />
      </span>

      <h3 className={styles.name}>{category.name}</h3>
      <p className={styles.description}>{category.description}</p>

      <a href={category.href} className={styles.action}>
        Explore Opportunities
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </article>
  );
}
