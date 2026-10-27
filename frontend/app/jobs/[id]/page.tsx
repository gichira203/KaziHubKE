import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobDetailContent from "@/components/jobs/JobDetailContent";
import { getJobById } from "@/lib/jobs-service";
import styles from "./job.module.css";

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  await connection();
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
type JobDetailParams = Pick<PageProps<"/jobs/[id]">, "params">;

async function JobDetailFrame({ params }: JobDetailParams) {
  await connection();
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

export default function JobDetailPage({ params }: JobDetailParams) {
  return <Suspense fallback={<main className={styles.main}><p className={styles.loading}>Loading opportunity...</p></main>}><JobDetailFrame params={params} /></Suspense>;
}
