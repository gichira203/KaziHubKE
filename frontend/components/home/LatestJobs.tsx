"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import JobCard from "@/components/common/JobCard";
import { jobs } from "@/data/jobs";
import { jobFilters, type JobFilterId } from "@/data/categories";
import { disclaimers } from "@/lib/constants";
import styles from "./LatestJobs.module.css";

/** Category groups each filter matches. "online" includes remote roles. */
const filterGroups: Record<JobFilterId, string[]> = {
  all: ["online", "government", "internship", "attachment", "private"],
  online: ["online"],
  government: ["government"],
  internship: ["internship"],
  attachment: ["attachment"],
  private: ["private"],
};

export default function LatestJobs() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<JobFilterId>("all");

  const visibleJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const inFilter = filterGroups[activeFilter].includes(job.category);
      if (!inFilter) return false;
      if (!needle) return true;
      return (
        job.title.toLowerCase().includes(needle) ||
        job.employer.toLowerCase().includes(needle) ||
        job.location.toLowerCase().includes(needle) ||
        job.employmentType.toLowerCase().includes(needle)
      );
    });
  }, [query, activeFilter]);

  return (
    <section className={styles.section} id="latest-jobs" aria-labelledby="jobs-title">
      <div className={styles.container}>
        <div id="jobs-title">
          <SectionHeading
            eyebrow="Latest Openings"
            title="Latest Job Opportunities"
            description="Browse the most recent jobs, internships, attachments, government vacancies and remote roles added to KaziHub KE."
          />
        </div>

        {/* Search + filters (frontend demonstration) */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              className={styles.search}
              placeholder="Search by title, employer or location…"
              aria-label="Search job opportunities"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className={styles.filters} role="group" aria-label="Filter opportunities by category">
            {jobFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`${styles.filter} ${
                  activeFilter === filter.id ? styles.filterActive : ""
                }`}
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {visibleJobs.length === 0 ? (
          <p className={styles.empty} role="status">
            No opportunities match your search. Try a different keyword or category.
          </p>
        ) : (
          <div className={styles.grid}>
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} detailHref={`/jobs/${job.id}`} />
            ))}
          </div>
        )}

        <p className={styles.note}>{disclaimers.jobs}</p>
      </div>
    </section>
  );
}
