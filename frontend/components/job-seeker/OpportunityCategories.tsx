/**
 * OpportunityCategories — the eight discovery cards a new job seeker can
 * browse BEFORE completing their profile. Counts are clearly-labelled sample
 * figures; each card routes to the matching filter on the opportunities page.
 */
import Link from "next/link";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Landmark,
  Laptop,
  PenTool,
  School,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { opportunityCategories, type OpportunityCategory } from "@/data/categories";

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

/** Dashboard destinations — the home page anchors are replaced by real routes. */
const categoryHrefs: Record<string, string> = {
  "online-jobs": "/dashboard/opportunities?cat=online",
  "government-jobs": "/dashboard/opportunities?cat=government",
  internships: "/dashboard/opportunities?cat=internship",
  "industrial-attachments": "/dashboard/opportunities?cat=attachment",
  "private-sector-jobs": "/dashboard/opportunities?cat=private",
  "remote-jobs": "/dashboard/opportunities?cat=remote",
  "freelance-work": "/dashboard/opportunities?cat=freelance",
  "social-media-tasks": "/dashboard/tasks",
};

export default function OpportunityCategories() {
  return (
    <section aria-labelledby="explore-opportunities-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="explore-opportunities-title"
          className="text-[16px] font-bold tracking-tight text-ink"
        >
          Explore Opportunities
        </h2>
        <p className="text-[11.5px] text-muted">Counts are sample figures for this preview.</p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {opportunityCategories.map((category) => {
          const Icon = icons[category.icon];
          return (
            <li key={category.id}>
              <Link
                href={categoryHrefs[category.id] ?? "/dashboard/opportunities"}
                className="flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-bg text-brand">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-[13.5px] font-bold text-ink">{category.name}</h3>
                <p className="mt-1 flex-1 text-[12px] leading-relaxed text-muted">
                  {category.description}
                </p>
                <p className="mt-2.5 text-[11.5px] font-semibold text-muted-soft">
                  {category.count.toLocaleString("en-KE")} listed (sample)
                </p>
                <span className="mt-1.5 text-[12.5px] font-bold text-brand-dark">Browse →</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
