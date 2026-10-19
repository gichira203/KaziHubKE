import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobsResults from "@/components/jobs/JobsResults";
import styles from "./jobs.module.css";

export const metadata: Metadata = {
  title: "Find Jobs & Opportunities in Kenya",
  description:
    "Search jobs, internships, industrial attachments, government vacancies and remote roles on KaziHub KE. Filter by category, sort by deadline and browse without registering.",
};

/**
 * Public opportunities listing — searchable and filterable without an
 * account. Filters live in the URL so views are shareable; the first
 * server render carries the results, which keeps the page SEO-friendly.
 *
 * Next 16 requires the `searchParams` read to sit inside a Suspense
 * boundary, so the filterable results are a child component with a
 * loading fallback.
 */
export default function JobsPage({ searchParams }: PageProps<"/jobs">) {
  return (
    <>
      <Navbar />
      <main id="main-content" className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Opportunities</p>
            <h1 className={styles.title}>Find Jobs, Internships &amp; Online Roles</h1>
            <p className={styles.lede}>
              Browse verified-category listings from employers across Kenya — jobs, government
              vacancies, internships, industrial attachments and remote work. No account needed to
              browse; register to apply.
            </p>
          </header>

          <Suspense fallback={<p className={styles.loading}>Loading opportunities…</p>}>
            <JobsResults searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
