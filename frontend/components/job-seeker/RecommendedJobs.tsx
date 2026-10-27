import Link from "next/link";
import JobCard from "@/components/common/JobCard";
import type { Job } from "@/data/jobs";

type RecommendedJobsProps = { jobs: Job[] };

export default function RecommendedJobs({ jobs }: RecommendedJobsProps) {
  return (
    <section aria-labelledby="recommended-jobs-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="recommended-jobs-title" className="text-[16px] font-bold tracking-tight text-ink">
            Opportunities You Can Explore
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Published opportunities from employers on KaziHub KE.
          </p>
        </div>
        <Link href="/dashboard/opportunities" className="text-[13px] font-bold text-brand-dark hover:underline">
          View all opportunities →
        </Link>
      </div>
      {jobs.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => <li key={job.id} className="flex"><JobCard job={job} detailHref={`/jobs/${job.id}`} /></li>)}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-white p-5 text-sm text-muted">
          No published opportunities are available yet. Check back later.
        </p>
      )}
    </section>
  );
}
