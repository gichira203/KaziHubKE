"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function EarningsSummaryCard() {
  const [amount, setAmount] = useState<number | null>(null);
  useEffect(() => { apiRequest<{available:number}>('/wallet').then((wallet) => setAmount(wallet.available)).catch(() => setAmount(null)); }, []);
  return <Link href="/dashboard/earnings" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-success-bg p-4 text-inherit no-underline"><span><strong className="block text-sm text-brand-dark">Task earnings</strong><span className="mt-1 block text-xs text-charcoal">{amount === null ? "Check approved rewards and withdrawal requests" : `KES ${amount.toLocaleString('en-KE')} available to withdraw`}</span></span><span className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">View wallet</span></Link>;
}
