import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  Building2,
  MapPin,
  FileText,
  CalendarClock,
  ArrowLeft,
  Laptop,
  Info,
} from "lucide-react";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import { getJobById, isDeadlinePassed } from "@/lib/jobs-service";
import { disclaimers } from "@/lib/constants";
import styles from "./JobDetailContent.module.css";

const categoryLabels: Record<string, string> = {
  online: "Online",
  government: "Government",
  internship: "Internship",
  attachment: "Attachment",
  private: "Private Sector",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Not specified";
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * JobDetailContent — the params-reading part of the public job detail
 * page, streamed inside a Suspense boundary (the open/closed state is
 * compared against the current date, so it cannot be prerendered).
 */
export default async function JobDetailContent({
  params,
}: {
  params: PageProps<"/jobs/[id]">["params"];
}) {
  // Opt this subtree out of prerendering: the open/closed state below is
  // compared against the current date (see Next's "blocking-prerender-
  // current-time" guidance).
  await connection();
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const closed = isDeadlinePassed(job.deadline);

  return (
    <div className={styles.container}>
      <Link href="/jobs" className={styles.back}>
        <ArrowLeft size={15} aria-hidden="true" />
        All opportunities
      </Link>

      <article className={styles.card}>
        <header className={styles.head}>
          <div className={styles.badges}>
            <span className={styles.category}>{categoryLabels[job.category]}</span>
            {job.remote && (
              <span className={styles.remote}>
                <Laptop size={13} aria-hidden="true" />
                Remote
              </span>
            )}
            <StatusBadge
              label={closed ? "Applications closed" : "Open for applications"}
              tone={closed ? "neutral" : "success"}
            />
          </div>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.employer}>
            <Building2 size={16} aria-hidden="true" />
            {job.employer}
          </p>
        </header>

        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt>
              <FileText size={14} aria-hidden="true" />
              Employment type
            </dt>
            <dd>{job.employmentType}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>
              <MapPin size={14} aria-hidden="true" />
              Location
            </dt>
            <dd>{job.location}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt>
              <CalendarClock size={14} aria-hidden="true" />
              Application deadline
            </dt>
            <dd>{formatDate(job.deadline)}</dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About this opportunity</h2>
          <p className={styles.body}>{job.description}</p>
          <p className={styles.posted}>Posted {formatDate(job.postedAt)}</p>
        </section>

        {job.category === "government" && (
          <p className={styles.govNote}>
            <Info size={15} aria-hidden="true" />
            Government listings are informational. KaziHub KE does not confirm that any listing is
            an official vacancy — always verify against the hiring body&rsquo;s official announcement
            before applying.
          </p>
        )}

        <div className={styles.apply}>
          <div>
            <p className={styles.applyTitle}>
              {closed ? "Applications for this listing have closed" : "Interested in this role?"}
            </p>
            <p className={styles.applyText}>
              {closed
                ? "Browse other open opportunities on KaziHub KE."
                : "Create a free account or log in to submit your application and track its status."}
            </p>
          </div>
          {closed ? (
            <Button href="/jobs" variant="primary">
              Browse opportunities
            </Button>
          ) : (
            <Button href="/login" variant="primary">
              Log in to apply
            </Button>
          )}
        </div>

        <p className={styles.disclaimer}>{disclaimers.jobs}</p>
      </article>
    </div>
  );
}
