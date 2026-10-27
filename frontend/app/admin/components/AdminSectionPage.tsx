"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { AdminSection } from "../admin-data";
import { apiRequest } from "@/lib/api";
import { apiBaseUrl } from "@/lib/auth-config";
import styles from "../admin.module.css";

type AdminRow = Record<string, string> & { _id: string };
type LiveSection = AdminSection & { filters: string[] };

const actionsBySection: Record<string, string[]> = {
  "employer-verification": ["Approve", "Reject", "Request information"],
  "job-listings": ["Approve", "Reject", "Request edits", "Pause"],
  "government-jobs": ["Approve", "Reject", "Request edits", "Pause"],
  internships: ["Approve", "Reject", "Request edits", "Pause"],
  "online-tasks": ["Approve", "Reject", "Pause", "Close"],
  "task-submissions": ["Approve", "Reject"],
  users: ["Suspend", "Reinstate"],
  "job-seekers": ["Suspend", "Reinstate"],
  employers: ["Suspend", "Reinstate"],
  reports: ["Investigate", "Resolve", "Dismiss"],
  "support-tickets": ["Mark in progress", "Resolve"],
};

export function AdminSectionPage({ section: initialSection }: { section: AdminSection }) {
  const [section, setSection] = useState<LiveSection>(initialSection);
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [pendingAction, setPendingAction] = useState<{ row: AdminRow; action: string } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [fundingConfirmed, setFundingConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const result = await apiRequest<{ section: LiveSection }>(`/admin/sections/${initialSection.slug}`);
    setSection(result.section);
    setRows(result.section.rows as AdminRow[]);
  }

  useEffect(() => {
    let active = true;
    apiRequest<{ section: LiveSection }>(`/admin/sections/${initialSection.slug}`)
      .then((result) => {
        if (!active) return;
        setSection(result.section);
        setRows(result.section.rows as AdminRow[]);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message || "Could not load records from the platform database.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialSection.slug]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = Object.values(row).some((value) => value.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch && (status === "All statuses" || row.Status === status);
  }), [rows, search, status]);

  async function confirmAction() {
    if (!pendingAction) return;
    if (["Reject", "Request information", "Request edits"].includes(pendingAction.action) && !actionReason.trim()) {
      setError("Add a reason for this decision.");
      return;
    }
    if (section.slug === "online-tasks" && pendingAction.action === "Approve" && !fundingConfirmed) {
      setError("Confirm that the campaign budget has been received before approving it.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (section.slug === "online-tasks") {
        const reviewByAction: Record<string, string> = { Approve: "approved", Reject: "rejected" };
        const statusByAction: Record<string, string> = { Pause: "paused", Close: "closed" };
        await apiRequest(`/admin/tasks/${pendingAction.row._id}`, {
          method: "PATCH",
          body: JSON.stringify(reviewByAction[pendingAction.action]
            ? { reviewStatus: reviewByAction[pendingAction.action], ...(pendingAction.action === "Approve" ? { fundingConfirmed: true } : {}) }
            : { status: statusByAction[pendingAction.action] }),
        });
      } else {
        await apiRequest("/admin/actions", {
          method: "POST",
          body: JSON.stringify({
            section: section.slug,
            id: pendingAction.row._id,
            action: pendingAction.action,
            reason: actionReason,
          }),
        });
      }
      setPendingAction(null);
      setActionReason("");
      setFundingConfirmed(false);
      setNotice(`${pendingAction.action} saved to the platform database.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this decision.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={styles.content}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>ADMIN MANAGEMENT</p><h1>{section.title}</h1><p>{section.description}</p></div></div>
    {notice && <div className={styles.actionNotice} role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button></div>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <section className={styles.tablePanel}>
      <div className={styles.tableToolbar}><div className={styles.searchBox}><Search size={17} /><input placeholder={`Search ${section.title.toLowerCase()}â€¦`} value={search} onChange={(event) => setSearch(event.target.value)} /></div><label className={styles.filterSelect}>Status <select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{section.filters.map((filter) => <option key={filter}>{filter}</option>)}</select></label><span className={styles.recordCount}>{loading ? "Loadingâ€¦" : `${filteredRows.length} records`}</span></div>
      <div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr>{section.columns.map((column) => <th key={column}>{column}</th>)}<th>Actions</th></tr></thead><tbody>
        {filteredRows.map((row) => <tr key={row._id}>{section.columns.map((column) => <td key={column}>{column === "Status" || column.toLowerCase().includes("status") ? <span className={`${styles.statusBadge} ${/pending|open|review|draft/i.test(row[column] || "") ? styles.statusPending : /suspend|reject/i.test(row[column] || "") ? styles.statusDanger : styles.statusGood}`}>{row[column]}</span> : row[column]}</td>)}<td><div className={styles.rowActions}><button onClick={() => setSelected(row)}>View</button>{actionsBySection[section.slug]?.length ? <button onClick={() => { setError(""); setActionReason(""); setFundingConfirmed(false); setPendingAction({ row, action: actionsBySection[section.slug][0] }); }}>Manage</button> : null}</div></td></tr>)}
        {!loading && !filteredRows.length && <tr><td className={styles.noResults} colSpan={section.columns.length + 1}><strong>{error ? "Records unavailable" : "No matching records"}</strong><span>{error ? "Confirm the API and database are configured, then reload." : "Records will appear here when they are created."}</span></td></tr>}
      </tbody></table></div>
    </section>
    {selected && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="record-title"><button className={styles.modalClose} onClick={() => setSelected(null)} aria-label="Close details"><X size={18} /></button><p className={styles.eyebrow}>DATABASE RECORD</p><h2 id="record-title">{Object.values(selected)[1] || Object.values(selected)[0]}</h2><div className={styles.detailList}>{Object.entries(selected).filter(([key]) => key !== "_id").map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>{section.slug === "employer-verification" && selected.Document !== "Not provided" && apiBaseUrl && <a className={styles.primaryButton} href={`${apiBaseUrl}/storage/employer-verification/${encodeURIComponent(selected._id)}`} target="_blank" rel="noopener noreferrer">Open private document</a>}<button className={styles.primaryButton} onClick={() => setSelected(null)}>Done</button></section></div>}
    {pendingAction && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className={styles.modalClose} onClick={() => setPendingAction(null)} aria-label="Close action"><X size={18} /></button><p className={styles.eyebrow}>DATABASE ACTION</p><h2 id="confirm-title">Manage this record</h2><label className={styles.modalLabel}>Action<select className={styles.modalSelect} value={pendingAction.action} onChange={(event) => { setPendingAction({ ...pendingAction, action: event.target.value }); setFundingConfirmed(false); }}>{(actionsBySection[section.slug] || []).map((action) => <option key={action}>{action}</option>)}</select></label>{section.slug === "online-tasks" && pendingAction.action === "Approve" && <><p className={styles.loginIntro}>The app does not collect campaign payments. Confirm the employer's reward budget has been received through the platform's payment channel before approving.</p><label className={styles.modalLabel}><span><input type="checkbox" checked={fundingConfirmed} onChange={(event) => setFundingConfirmed(event.target.checked)} /> I have confirmed the campaign funds were received.</span></label></>}{["Reject", "Request information", "Request edits"].includes(pendingAction.action) && <label className={styles.modalLabel}>Reason<textarea className={styles.reasonInput} value={actionReason} onChange={(event) => setActionReason(event.target.value)} placeholder="Add a reason for this decision" required /></label>}<p className={styles.loginIntro}>This decision will be saved to the platform database and recorded in the audit log.</p><div className={styles.modalActions}><button className={styles.secondaryButton} disabled={busy} onClick={() => setPendingAction(null)}>Cancel</button><button className={styles.primaryButton} disabled={busy} onClick={() => void confirmAction()}>{busy ? "Savingâ€¦" : "Save decision"}</button></div></section></div>}
  </main>;
}
