"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, BriefcaseBusiness, Building2, CheckCircle2, ClipboardCheck, FileWarning, FileText, Flag, Users } from "lucide-react";
import styles from "../admin.module.css";

const stats = [
  ["Total registered users", "2,486", Users], ["Total job seekers", "2,104", Users],
  ["Total employers", "382", Building2], ["Incomplete profiles", "641", Activity],
  ["Employers awaiting verification", "18", ClipboardCheck], ["Published jobs", "146", BriefcaseBusiness],
  ["Jobs pending approval", "12", FileText], ["Total applications", "3,812", FileText],
  ["Active online tasks", "24", CheckCircle2], ["Task submissions to review", "37", ClipboardCheck],
  ["Open reports", "9", Flag], ["Open support tickets", "16", FileWarning],
] as const;

const registrationBars = [35, 54, 43, 68, 51, 74, 61, 86, 70, 94, 77, 100];
const categoryBars = [["Technology", 78], ["Business", 62], ["Healthcare", 49], ["Education", 38], ["Design", 29]] as const;

export default function AdminDashboardPage() {
  const [range, setRange] = useState("Last 30 days");
  return <main className={styles.content}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>ADMIN OVERVIEW</p><h1>Welcome back</h1><p>Here’s a snapshot of activity across KaziHub KE.</p></div><label className={styles.rangeFilter}>Date range <select value={range} onChange={(event) => setRange(event.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select></label></div>
    <div className={styles.mockBanner}><Activity size={16} /><div><strong>Frontend demo data</strong><span>All figures and records on this dashboard are illustrative mock data. No live database is connected.</span></div></div>
    <section className={styles.statGrid} aria-label="Mock platform statistics">{stats.map(([label, value, Icon]) => <article className={styles.statCard} key={label}><div className={styles.statTop}><span className={styles.statIcon}><Icon size={18} /></span><span className={styles.mockTag}>MOCK</span></div><p>{label}</p><strong>{value}</strong><small>Example value · {range.toLowerCase()}</small></article>)}</section>
    <div className={styles.dashboardGrid}>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>User registrations</h2><p>Illustrative sign-ups across the selected period</p></div><span className={styles.mockTag}>MOCK DATA</span></div><div className={styles.chartBars} aria-label="Mock user registration bar chart">{registrationBars.map((height, index) => <div className={styles.chartColumn} key={index}><div className={styles.chartBar} style={{ height: `${height}%` }} /><small>{["W1", "W2", "W3", "W4"][index % 4]}</small></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Jobs by category</h2><p>Example published listing distribution</p></div><span className={styles.mockTag}>MOCK DATA</span></div><div className={styles.categoryChart}>{categoryBars.map(([label, value]) => <div className={styles.categoryRow} key={label}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><b>{Math.round(value * 1.46)}</b></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Verification status</h2><p>Sample employer review queue</p></div><Link href="/admin/employer-verification">View queue →</Link></div><div className={styles.verificationRows}><div><span className={`${styles.statusDot} ${styles.dotAmber}`} />Awaiting review <b>18</b></div><div><span className={`${styles.statusDot} ${styles.dotGreen}`} />Approved <b>246</b></div><div><span className={`${styles.statusDot} ${styles.dotRed}`} />Needs more information <b>7</b></div></div></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent registrations</h2><p>Sample accounts created recently</p></div><Link href="/admin/users">View users →</Link></div><div className={styles.compactRows}><div><span className={styles.avatar}>AW</span><p><b>Amina Wanjiku</b><small>Job seeker · Today</small></p><em>Active</em></div><div><span className={styles.avatar}>PM</span><p><b>Peter Mwangi</b><small>Employer · Yesterday</small></p><em className={styles.pending}>Pending</em></div><div><span className={styles.avatar}>GA</span><p><b>Grace Atieno</b><small>Job seeker · Oct 19</small></p><em>Active</em></div></div></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Recent job submissions</h2><p>Sample moderation queue</p></div><Link href="/admin/job-listings">View listings →</Link></div><div className={styles.simpleRows}><div><span>Graduate Product Designer</span><small>Pamoja Health · Oct 20</small><b className={styles.pending}>Pending</b></div><div><span>Accounts Assistant</span><small>Soko Fresh Ltd · Oct 19</small><b className={styles.needsReview}>Needs edits</b></div><div><span>Junior Software Engineer</span><small>Kifaru Digital · Oct 18</small><b>Published</b></div></div></section>
      <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Reports needing attention</h2><p>Sample reports submitted by users</p></div><Link href="/admin/reports">Review reports →</Link></div><div className={styles.simpleRows}><div><span>Expired job listing</span><small>Job post · Received today</small><b className={styles.pending}>Open</b></div><div><span>Suspicious employer</span><small>Employer · Received yesterday</small><b className={styles.needsReview}>Investigating</b></div></div></section>
    </div>
    <section className={styles.quickActions}><strong>Quick actions</strong><Link href="/admin/employer-verification">Review employers <span>→</span></Link><Link href="/admin/job-listings">Review job listings <span>→</span></Link><Link href="/admin/reports">Handle reports <span>→</span></Link></section>
  </main>;
}
