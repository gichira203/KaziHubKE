"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PageLoading from "@/components/dashboard/PageLoading";
import { apiRequest } from "@/lib/api";
import type { OnlineTask } from "@/data/tasks";

type Submission = { id: string; taskId: string; taskTitle: string; status: string; rewardStatus: string; evidence: string; createdAt: string };

export default function TasksPage() {
  const [tasks, setTasks] = useState<OnlineTask[] | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [proof, setProof] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  async function refresh() {
    const [taskData, submissionData] = await Promise.all([
      apiRequest<{items: OnlineTask[]}>('/tasks'),
      apiRequest<{items: Submission[]}>('/task-submissions'),
    ]);
    setTasks(taskData.items);
    setSubmissions(submissionData.items);
  }
  useEffect(() => { refresh().catch((reason: Error) => { setError(reason.message); setTasks([]); }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault(); setBusy(taskId); setError(""); setNotice("");
    try {
      await apiRequest(`/tasks/${taskId}/submissions`, { method: 'POST', body: JSON.stringify({ evidence: proof[taskId] }) });
      setProof((old) => ({ ...old, [taskId]: "" })); setNotice("Submission received. The reward will appear as available after review and approval."); await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Submission failed.'); }
    finally { setBusy(""); }
  }
  if (!tasks) return <PageLoading label="Loading paid tasks…" />;
  return <div className="flex flex-col gap-5">
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">Paid online tasks</h2><p className="mt-1 text-sm text-muted">Complete the action, submit proof and track review here.</p></div><Link href="/dashboard/earnings" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand">View earnings</Link></div></section>
    {error && <p role="alert" className="rounded-lg bg-danger-bg p-3 text-sm text-error">{error}</p>}{notice && <p role="status" className="rounded-lg bg-success-bg p-3 text-sm text-brand-dark">{notice}</p>}
    {tasks.length === 0 ? <p className="rounded-xl border border-line bg-white p-5 text-sm text-muted">No paid tasks are available yet. Check back later.</p> : <div className="grid gap-4 lg:grid-cols-2">{tasks.map((task) => {
      const submitted = submissions.some((submission) => submission.taskId === task.id);
      return <article key={task.id} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-ink">{task.title}</h3><p className="mt-1 text-sm text-muted">{task.platform} · {task.time}</p></div><strong className="whitespace-nowrap rounded-full bg-success-bg px-3 py-1.5 text-sm text-brand-dark">KES {Number(task.rewardAmount || 0).toLocaleString('en-KE')}</strong></div><p className="text-sm leading-relaxed text-charcoal">{task.action}</p><p className="text-xs text-muted">Eligibility: {task.eligibility}</p>{task.targetUrl && <a href={task.targetUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand underline">Open {task.platform} task</a>}{submitted ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">You submitted this task. Check Earnings &amp; withdrawals for its review status.</p> : <form onSubmit={(event) => submit(event, task.id)} className="flex flex-col gap-2 border-t border-line pt-3"><label className="text-xs font-semibold text-muted">Proof link or description<textarea required maxLength={4000} value={proof[task.id] || ""} onChange={(event) => setProof((old) => ({...old, [task.id]: event.target.value}))} rows={2} placeholder="Paste a link to your public comment or describe the completed task" className="mt-1 w-full rounded-lg border border-line p-3 text-sm font-normal text-ink" /></label><button disabled={busy === task.id} className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy === task.id ? 'Submitting…' : 'Submit task proof'}</button></form>}</article>;
    })}</div>}
    <p className="rounded-lg bg-surface p-3 text-xs leading-relaxed text-muted">Rewards are not guaranteed until a submission is reviewed and approved. Withdrawal requests are processed manually; automatic M-Pesa payouts are not connected.</p>
  </div>;
}
