"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type EmployerTask = { id: string; title: string; platform: string; targetUrl: string; rewardAmount: number; rewardCurrency: string; budgetAmount: number | null; maxSubmissions: number | null; status: string; reviewStatus: string };
type TaskSubmission = {id:string;taskId:string;taskTitle:string;candidateName:string;status:string;rewardAmount:number;evidence:string;createdAt:string};

export default function EmployerTasksManager() {
  const [tasks, setTasks] = useState<EmployerTask[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [error, setError] = useState("");
  async function refresh() {
    const [taskData, submissionData] = await Promise.all([apiRequest<{items: EmployerTask[]}>('/employer/tasks'), apiRequest<{items: TaskSubmission[]}>('/employer/task-submissions')]);
    setTasks(taskData.items); setSubmissions(submissionData.items);
  }
  useEffect(() => { refresh().catch((reason: Error) => setError(reason.message)); }, []);
  async function review(id: string, status: "approved" | "rejected") {
    try { await apiRequest(`/employer/task-submissions/${id}`, {method:"PATCH",body:JSON.stringify({status})}); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not review this submission."); }
  }
  return <section className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[16px] font-bold text-ink">Online task campaigns</h2><p className="mt-1 text-[13px] text-muted">Create paid YouTube, social media, survey or testing tasks.</p></div><Link className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white" href="/employer/dashboard/tasks/new">Create online task</Link></div>
    {error && <p role="alert" className="rounded-lg bg-danger-bg p-3 text-sm text-error">{error}</p>}
    {tasks.length === 0 ? <p className="rounded-lg bg-surface p-4 text-sm text-muted">No online campaigns yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-muted"><th className="p-3">Campaign</th><th className="p-3">Platform</th><th className="p-3">Reward / person</th><th className="p-3">Budget and slots</th><th className="p-3">Status</th><th className="p-3">Link</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-b border-line"><td className="p-3 font-semibold text-ink">{task.title}</td><td className="p-3">{task.platform}</td><td className="p-3">KES {Number(task.rewardAmount).toLocaleString('en-KE')}</td><td className="p-3">{task.budgetAmount ? `KES ${task.budgetAmount.toLocaleString('en-KE')} · ${task.maxSubmissions} slots` : '—'}</td><td className="p-3">{task.status}</td><td className="p-3"><a className="text-brand underline" href={task.targetUrl} target="_blank" rel="noreferrer">Open target</a></td></tr>)}</tbody></table></div>}
    <div><h3 className="mb-2 font-bold text-ink">Participant submissions</h3>{submissions.length === 0 ? <p className="rounded-lg bg-surface p-4 text-sm text-muted">No submissions to review yet.</p> : <div className="flex flex-col gap-3">{submissions.map((submission) => <article key={submission.id} className="rounded-lg border border-line p-4"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-ink">{submission.taskTitle}</strong><span className="text-xs capitalize text-muted">{submission.status} · KES {Number(submission.rewardAmount).toLocaleString('en-KE')}</span></div><p className="mt-1 text-xs text-muted">{submission.candidateName} · {new Date(submission.createdAt).toLocaleDateString('en-KE')}</p><p className="mt-2 break-words text-sm text-charcoal">{submission.evidence}</p>{submission.status === 'pending' && <div className="mt-3 flex gap-2"><button onClick={() => review(submission.id,'approved')} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">Approve reward</button><button onClick={() => review(submission.id,'rejected')} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-charcoal">Reject</button></div>}</article>)}</div>}</div>
    <p className="text-xs leading-relaxed text-muted">The campaign budget and participant slots cap how many people can submit. KaziHub currently records rewards and withdrawal requests; it does not collect campaign funds or send automated M-Pesa payouts.</p>
  </section>;
}
