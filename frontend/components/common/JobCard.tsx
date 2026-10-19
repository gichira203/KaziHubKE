import { CalendarClock, Building2, MapPin, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/data/jobs";
import styles from "./JobCard.module.css";

function formatDate(iso: string | null): string {
  if (!iso) return "Not specified";
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const categoryLabels: Record<Job["category"], string> = {
  online: "Online",
  government: "Government",
  internship: "Internship",
  attachment: "Attachment",
  private: "Private Sector",
};

type JobCardProps = {
  job: Job;
  /** Detail link target — the public listing page or a home anchor. */
  detailHref?: string;
};

export default function JobCard({ job, detailHref = "#latest-jobs" }: JobCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.badge}>{categoryLabels[job.category]}</span>
        {job.remote && <span className={styles.remoteBadge}>Remote</span>}
      </div>

      <h3 className={styles.title}>{job.title}</h3>
      <p className={styles.employer}>
        <Building2 size={15} aria-hidden="true" />
        {job.employer}
      </p>

      <ul className={styles.meta}>
        <li>
          <FileText size={14} aria-hidden="true" />
          {job.employmentType}
        </li>
        <li>
          <MapPin size={14} aria-hidden="true" />
          {job.location}
        </li>
        <li>
          <CalendarClock size={14} aria-hidden="true" />
          Deadline: {formatDate(job.deadline)}
        </li>
      </ul>

      <p className={styles.description}>{job.description}</p>

      <div className={styles.footer}>
        <span className={styles.posted}>Posted {formatDate(job.postedAt)}</span>
        <Link href={detailHref} className={styles.action}>
          View Details
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
