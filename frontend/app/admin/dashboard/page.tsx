"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, FileText, Flag, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";
import styles from "../admin.module.css";

type Overview = {
  stats: Record<string, number>;
  recentUsers: { id: string; name: string; email: string; accountType: string; status: string }[];
  recentJobs: { id: string; title: string; employer: string; status: string }[];
  recentReports: { id: string; subject: string; status: string; createdAt: string }[];
};

const cards = [
  ["Total registered users", "totalUsers", Users],
  ["Job seekers", "jobSeekers", Users],
  ["Employers", "employers", Building2],
  ["Employers awaiting verification", "employersAwaitingVerification", ClipboardCheck],
  ["Published jobs", "publishedJobs", BriefcaseBusiness],
  ["Jobs pending approval", "jobsPendingApproval", FileText],
  ["Applications", "totalApplications", FileText],
  ["Active online tasks", "activeTasks", CheckCircle2],
  ["Task submissions to review", "taskSubmissionsToReview", ClipboardCheck],
  ["Open reports", "openReports", Flag],
] as const;

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<Overview>("/admin/overview")
      .then((result) => { if (active) setOverview(result); })
      .catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, []);

  return <main className={styles.content}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>ADMIN OVERVIEW</p><h1>Platform activity</h1><p>Live account, opportunity, task and review counts.</p></div></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <section className={styles.statGrid} aria-label="Live platform statistics">{cards.map(([label, key, Icon]) => <article className={styles.statCard} key={key}><div className={styles.statTop}><span className={styles.statIcon}><Icon size={18} /></span></div><p>{label}</p><strong>{overview?.stats[key] ?? "—"}</strong></article>)}</section>
    <div className={styles.dashboardGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent job listings</h2><p>Latest employer submissions and publication status</p></div><Link href="/admin/job-listings">Review listings →</Link></div>{overview?.recentJobs.length ? <div className={styles.simpleRows}>{overview.recentJobs.map((job) => <div key={job.id}><span>{job.title}</span><small>{job.employer}</small><b className={/pending|rejected/i.test(job.status) ? styles.pending : ""}>{job.status}</b></div>)}</div> : <p className={styles.emptyState}>No job listings have been posted.</p>}</section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent accounts</h2><p>Newly registered platform users</p></div><Link href="/admin/users">View users →</Link></div>{overview?.recentUsers.length ? <div className={styles.compactRows}>{overview.recentUsers.map((user) => <div key={user.id}><span className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</span><p><b>{user.name}</b><small>{user.email} · {user.accountType}</small></p><em>{user.status}</em></div>)}</div> : <p className={styles.emptyState}>No accounts have been created.</p>}</section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Reports needing attention</h2><p>Open reports from the database</p></div><Link href="/admin/reports">Review reports →</Link></div>{overview?.recentReports.length ? <div className={styles.simpleRows}>{overview.recentReports.map((report) => <div key={report.id}><span>{report.subject}</span><small>{new Date(report.createdAt).toLocaleDateString("en-KE")}</small><b className={styles.pending}>{report.status}</b></div>)}</div> : <p className={styles.emptyState}>No reports are awaiting review.</p>}</section>
    </div>
  </main>;
}
