import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobDetailContent from "@/components/jobs/JobDetailContent";
import { getJobById } from "@/lib/jobs-service";
import { jobs } from "@/data/jobs";
import styles from "./job.module.css";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Opportunity not found — KaziHub KE" };
  return {
    title: `${job.title} at ${job.employer} — KaziHub KE`,
    description: job.description,
  };
}

/**
 * Public job detail — readable without an account; applying requires one.
 * The article is streamed inside Suspense because the open/closed state
 * is compared against the current date and cannot be prerendered.
 */
export default function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <>
      <Navbar />
      <main id="main-content" className={styles.main}>
        <Suspense fallback={<p className={styles.loading}>Loading opportunity…</p>}>
          <JobDetailContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
