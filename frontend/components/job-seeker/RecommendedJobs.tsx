/**
 * RecommendedJobs — "Opportunities You Can Explore".
 *
 * These are GENERAL sample listings, honestly labelled: with an incomplete
 * profile there is nothing to personalize from yet, and the section says so
 * instead of pretending the recommendations are tailored.
 */
import Link from "next/link";
import { Compass } from "lucide-react";
import JobCard from "@/components/common/JobCard";
import type { Job } from "@/data/jobs";

type RecommendedJobsProps = {
  jobs: Job[];
};

export default function RecommendedJobs({ jobs }: RecommendedJobsProps) {
  return (
    <section aria-labelledby="recommended-jobs-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="recommended-jobs-title"
            className="text-[16px] font-bold tracking-tight text-ink"
          >
            Opportunities You Can Explore
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            General sample listings while your profile is incomplete — completing your profile
            improves how relevant these become.
          </p>
        </div>
        <Link
          href="/dashboard/opportunities"
          className="text-[13px] font-bold text-brand-dark hover:underline"
        >
          View all opportunities →
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.id} className="flex">
            <JobCard job={job} detailHref="/dashboard/opportunities" />
          </li>
        ))}
      </ul>

      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted">
        <Compass size={13} aria-hidden="true" />
        Sample listings — demonstration data, not verified live vacancies.
      </p>
    </section>
  );
}
