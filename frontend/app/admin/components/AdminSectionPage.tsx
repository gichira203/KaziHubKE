"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { AdminSection } from "../admin-data";
import styles from "../admin.module.css";

export function AdminSectionPage({ section }: { section: AdminSection }) {
  const [rows, setRows] = useState(section.rows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "", direction: "asc" });
  const [selected, setSelected] = useState<Record<string, string> | null>(null);
  const [pendingAction, setPendingAction] = useState<{ row: Record<string, string>; action: string } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [notice, setNotice] = useState("");
  const pageSize = 5;
  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = Object.values(row).some((value) => value.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch && (status === "All statuses" || row.Status === status);
  }).sort((left, right) => {
    if (!sort.key) return 0;
    const comparison = (left[sort.key] || "").localeCompare(right[sort.key] || "", undefined, { numeric: true });
    return sort.direction === "asc" ? comparison : -comparison;
  }), [rows, search, status, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  function confirmAction() {
    if (!pendingAction) return;
    if (["Reject", "Request information", "Request edits"].includes(pendingAction.action) && !actionReason.trim()) {
      setNotice("Enter a reason before continuing this demo action.");
      return;
    }
    const index = rows.indexOf(pendingAction.row);
    if (index >= 0) {
      const updated = [...rows];
      const result = pendingAction.action === "Review" ? "Reviewed (demo)" : pendingAction.action === "Approve" ? "Approved (demo)" : "Updated (demo)";
      updated[index] = { ...updated[index], Status: result };
      setRows(updated);
    }
    setNotice(`${pendingAction.action} shown for this preview only. No database record changed${actionReason.trim() ? ` · Reason: ${actionReason.trim()}` : ""}.`);
    setActionReason("");
    setPendingAction(null);
  }

  function availableActions() {
    if (section.slug === "employer-verification") return ["Approve", "Reject", "Request information"];
    if (section.slug === "job-listings" || section.slug === "government-jobs" || section.slug === "internships") return ["Approve", "Reject", "Request edits", "Pause"];
    if (section.slug === "task-submissions") return ["Approve", "Reject"];
    if (section.slug === "users" || section.slug === "job-seekers" || section.slug === "employers") return ["Suspend", "Reinstate"];
    if (section.slug === "reports") return ["Investigate", "Resolve", "Dismiss"];
    if (section.slug === "support-tickets") return ["Assign", "Mark in progress", "Resolve"];
    if (section.slug === "notifications") return ["Publish", "Pause", "Edit"];
    return ["Edit", "Update status"];
  }

  function toggleSort(column: string) {
    setSort((current) => ({ key: column, direction: current.key === column && current.direction === "asc" ? "desc" : "asc" }));
  }

  return <main className={styles.content}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>ADMIN MANAGEMENT</p><h1>{section.title}</h1><p>{section.description}</p></div><span className={styles.mockPill}>Mock data</span></div>
    <div className={styles.mockBanner}><SlidersHorizontal size={16} /><div><strong>Frontend preview only</strong><span>Examples and actions on this page are local mock behavior and do not update platform records.</span></div></div>
    {notice && <div className={styles.actionNotice} role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button></div>}
    <section className={styles.tablePanel}>
      <div className={styles.tableToolbar}><div className={styles.searchBox}><Search size={17} /><input placeholder={`Search ${section.title.toLowerCase()}…`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><label className={styles.filterSelect}>Status <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option>All statuses</option>{section.filters.map((filter) => <option key={filter}>{filter}</option>)}</select></label><span className={styles.recordCount}>{filteredRows.length} demo records</span></div>
      <div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr>{section.columns.map((column) => <th key={column}><button className={styles.sortButton} onClick={() => toggleSort(column)}>{column}{sort.key === column ? (sort.direction === "asc" ? " ↑" : " ↓") : " ↕"}</button></th>)}<th>Actions</th></tr></thead><tbody>
        {visibleRows.map((row, index) => <tr key={`${index}-${Object.values(row).join(":")}`}>{section.columns.map((column) => <td key={column}>{column.toLowerCase().includes("status") || column === "Status" ? <span className={`${styles.statusBadge} ${/pending|open|review|draft/i.test(row[column]) ? styles.statusPending : /suspend|reject/i.test(row[column]) ? styles.statusDanger : styles.statusGood}`}>{row[column]}</span> : row[column]}</td>)}<td><div className={styles.rowActions}><button onClick={() => setSelected(row)}>View</button><button onClick={() => { setActionReason(""); setPendingAction({ row, action: availableActions()[0] }); }}>Manage</button></div></td></tr>)}
        {!visibleRows.length && <tr><td className={styles.noResults} colSpan={section.columns.length + 1}><strong>No matching records</strong><span>Try another search or status filter.</span></td></tr>}
      </tbody></table></div>
      <div className={styles.tableFooter}><span>Showing {filteredRows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div>
    </section>
    {selected && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="record-title"><button className={styles.modalClose} onClick={() => setSelected(null)} aria-label="Close details"><X size={18} /></button><p className={styles.eyebrow}>DEMO RECORD DETAILS</p><h2 id="record-title">{Object.values(selected)[0]}</h2><div className={styles.detailList}>{Object.entries(selected).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div><p className={styles.modalDisclaimer}>Mock content only. Sensitive profile fields and documents are not connected.</p><button className={styles.primaryButton} onClick={() => setSelected(null)}>Done</button></section></div>}
    {pendingAction && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className={styles.modalClose} onClick={() => setPendingAction(null)} aria-label="Close action"><X size={18} /></button><p className={styles.eyebrow}>DEMO ACTION</p><h2 id="confirm-title">Manage this record</h2><label className={styles.modalLabel}>Action<select className={styles.modalSelect} value={pendingAction.action} onChange={(event) => setPendingAction({ ...pendingAction, action: event.target.value })}>{availableActions().map((action) => <option key={action}>{action}</option>)}</select></label>{["Reject", "Request information", "Request edits"].includes(pendingAction.action) && <label className={styles.modalLabel}>Reason<textarea className={styles.reasonInput} value={actionReason} onChange={(event) => setActionReason(event.target.value)} placeholder="Add a reason for this decision" required /></label>}<p className={styles.loginIntro}>This only changes the local preview state. It will not save to the platform.</p><div className={styles.modalActions}><button className={styles.secondaryButton} onClick={() => setPendingAction(null)}>Cancel</button><button className={styles.primaryButton} onClick={confirmAction}>Continue demo</button></div></section></div>}
  </main>;
}
