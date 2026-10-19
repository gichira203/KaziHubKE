import SectionHeading from "@/components/common/SectionHeading";
import OpportunityCard from "@/components/common/OpportunityCard";
import { opportunityCategories } from "@/data/categories";
import { disclaimers } from "@/lib/constants";
import styles from "./OpportunityCategories.module.css";

/**
 * Grid of the platform's main opportunity categories.
 * `id="services"` is the target of the navbar "Services" link.
 */
export default function OpportunityCategories() {
  return (
    <section className={styles.section} id="services" aria-labelledby="categories-title">
      <div className={styles.container}>
        <div id="categories-title">
          <SectionHeading
            eyebrow="Our Services"
            title="Explore Every Kind of Opportunity"
            description="From full-time employment and student placements to government vacancies and eligible online tasks — KaziHub KE brings them together in one place."
          />
        </div>

        {opportunityCategories.length === 0 ? (
          <p className={styles.empty}>No opportunity categories are available right now.</p>
        ) : (
          <div className={styles.grid}>
            {opportunityCategories.map((category) => (
              <OpportunityCard key={category.id} category={category} />
            ))}
          </div>
        )}

        <p className={styles.note}>{disclaimers.jobs}</p>
      </div>
    </section>
  );
}
