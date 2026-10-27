"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";
import PageLoading from "@/components/dashboard/PageLoading";

type Wallet = { currency: string; earned: number; available: number; submissions: {id:string;task_title:string;status:string;reward_status:string;reward_amount:string;created_at:string}[]; withdrawals: {id:string;amount:string;currency:string;mpesa_phone:string;status:string;admin_note:string;created_at:string}[] };
const kes = (value: number | string) => `KES ${Number(value || 0).toLocaleString('en-KE', {maximumFractionDigits: 2})}`;

export default function EarningsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() { setWallet(await apiRequest<Wallet>('/wallet')); }
  useEffect(() => { refresh().catch((reason: Error) => { setError(reason.message); setWallet({currency:"KES",earned:0,available:0,submissions:[],withdrawals:[]}); }); }, []);
  async function withdraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await apiRequest<{message:string}>('/wallet/withdrawals', {method:'POST', body:JSON.stringify({amount:form.get('amount'),mpesaPhone:form.get('mpesaPhone')})});
      setNotice(result.message); formElement.reset(); await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Withdrawal request failed.'); }
    finally { setBusy(false); }
  }
  if (!wallet) return <PageLoading label="Loading your earnings…" />;
  return <div className="flex flex-col gap-5">
    <section className="grid gap-3 sm:grid-cols-2"><article className="rounded-xl border border-line bg-white p-5 shadow-sm"><p className="text-sm text-muted">Approved task earnings</p><strong className="mt-2 block text-2xl text-ink">{kes(wallet.earned)}</strong></article><article className="rounded-xl border border-brand/20 bg-success-bg p-5 shadow-sm"><p className="text-sm text-brand-dark">Available to withdraw</p><strong className="mt-2 block text-2xl text-brand-dark">{kes(wallet.available)}</strong></article></section>
    {error && <p role="alert" className="rounded-lg bg-danger-bg p-3 text-sm text-error">{error}</p>}{notice && <p role="status" className="rounded-lg bg-success-bg p-3 text-sm text-brand-dark">{notice}</p>}
    <form onSubmit={withdraw} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-5 shadow-sm"><div><h2 className="font-bold text-ink">Request an M-Pesa withdrawal</h2><p className="mt-1 text-xs text-muted">Minimum withdrawal: KES 100. The request is queued for manual processing.</p></div><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-sm font-semibold text-charcoal">Amount (KES)<input name="amount" type="number" min="100" step="1" max={wallet.available} required className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label><label className="grid gap-1 text-sm font-semibold text-charcoal">M-Pesa phone number<input name="mpesaPhone" type="tel" required placeholder="07XXXXXXXX or +2547XXXXXXXX" className="rounded-lg border border-line px-3 py-2.5 font-normal" /></label></div><button disabled={busy || wallet.available < 100} className="self-start rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Sending request…' : 'Request withdrawal'}</button><p className="text-xs text-muted">This request does not transfer money automatically. KaziHub has no M-Pesa payout integration configured.</p></form>
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="font-bold text-ink">Task submissions</h2>{wallet.submissions.length ? <div className="mt-3 divide-y divide-line">{wallet.submissions.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><strong className="text-ink">{item.task_title}</strong><span className="ml-2 capitalize text-muted">{item.status.replace('-', ' ')}</span></span><span className="font-semibold text-charcoal">{kes(item.reward_amount)}{item.status !== 'approved' ? ' · pending approval' : ''}</span></div>)}</div> : <p className="mt-3 text-sm text-muted">Your submitted task rewards will appear here after you complete tasks.</p>}</section>
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="font-bold text-ink">Withdrawal requests</h2>{wallet.withdrawals.length ? <div className="mt-3 divide-y divide-line">{wallet.withdrawals.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{kes(item.amount)} · {item.mpesa_phone}</span><span className="font-semibold capitalize text-charcoal">{item.status}</span>{item.admin_note && <p className="w-full text-xs text-muted">{item.admin_note}</p>}</div>)}</div> : <p className="mt-3 text-sm text-muted">No withdrawal requests yet.</p>}</section>
  </div>;
}
