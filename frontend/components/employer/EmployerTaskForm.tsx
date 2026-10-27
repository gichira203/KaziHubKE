"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function EmployerTaskForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/employer/tasks', { method: 'POST', body: JSON.stringify({ title: form.get('title'), platform: form.get('platform'), category: form.get('category'), action: form.get('action'), targetUrl: form.get('targetUrl'), time: form.get('time'), rewardAmount: form.get('rewardAmount'), budgetAmount: form.get('budgetAmount'), maxSubmissions: form.get('maxSubmissions'), eligibility: form.get('eligibility') }) });
      router.push('/employer/dashboard/tasks'); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create the campaign.'); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm">
    <div><h2 className="text-lg font-bold text-ink">Create a paid online task</h2><p className="mt-1 text-sm text-muted">Add the action, social media destination and reward paid per approved submission.</p></div>
    {error && <p role="alert" className="rounded-lg bg-danger-bg p-3 text-sm text-error">{error}</p>}
    <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Task title<input name="title" required maxLength={160} placeholder="Watch and comment on our video" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Platform<input name="platform" required placeholder="YouTube, Instagram, TikTok…" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Task type<select name="category" className="rounded-lg border border-line bg-white px-3 py-2.5 font-normal"><option value="youtube">YouTube video</option><option value="social-follow">Follow an account</option><option value="engagement">Like or comment</option><option value="survey">Survey</option><option value="testing">Product testing</option><option value="research">Research</option></select></label>
    </div>
    <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Social media or task link<input name="targetUrl" type="url" required placeholder="https://www.youtube.com/watch?v=…" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
    <label className="grid gap-1.5 text-sm font-semibold text-charcoal">What should the participant do?<textarea name="action" required minLength={20} maxLength={2000} rows={4} placeholder="Watch the full video, like it, and leave a genuine comment…" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Reward per approved submission (KES)<input name="rewardAmount" type="number" min="1" max="100000" step="1" required placeholder="50" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Total campaign budget (KES)<input name="budgetAmount" type="number" min="1" max="100000000" step="1" required placeholder="5000" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Participant slots<input name="maxSubmissions" type="number" min="1" max="100000" step="1" required placeholder="100" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Estimated time<input name="time" required placeholder="5–10 minutes" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
    </div>
    <label className="grid gap-1.5 text-sm font-semibold text-charcoal">Eligibility or extra requirements<textarea name="eligibility" rows={2} placeholder="Kenyan residents, one submission per person…" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label>
    <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Only verified employers can publish a campaign. The reward is a stated campaign amount; employer funding collection and automatic payouts are not connected yet.</p>
    <button disabled={saving} className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Publish online task'}</button>
  </form>;
}
