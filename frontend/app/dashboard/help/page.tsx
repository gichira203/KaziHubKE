"use client";

/**
 * Help and Support — where to get help and the answers a new job seeker
 * asks most.
 */
import { LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/constants";

const faqs = [
  {
    question: "Do I need to complete my profile before applying?",
    answer:
      "No. You can browse and apply while your profile is incomplete — we simply ask you to complete the required fields on an application when you make it.",
  },
  {
    question: "Is identity verification required?",
    answer:
      "Not for most opportunities. When an opportunity requires verified identity, KaziHub KE asks for it at that point through the official verification flow.",
  },
  {
    question: "Who can see my CV?",
    answer:
      "Only employers you apply to, and only when your visibility settings allow. Your CV is never public.",
  },
  {
    question: "Are the online task rewards guaranteed?",
    answer:
      "No. Rewards are added to your available earnings after your submission is approved. Withdrawal requests are processed manually; automatic M-Pesa payouts are not enabled.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <LifeBuoy size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Help and Support</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Questions about your account, applications or verification? Reach the KaziHub KE team
              directly.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <Mail size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Email
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {site.contact.email}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <Phone size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Phone
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {site.contact.phone}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <MessageCircle size={16} aria-hidden="true" className="flex-shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold uppercase tracking-wide text-muted">
                Location
              </span>
              <span className="block truncate text-[13px] font-medium text-ink">
                {site.contact.location}
              </span>
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">Common questions</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {faqs.map((faq) => (
            <li key={faq.question} className="rounded-lg border border-line bg-surface p-3.5">
              <p className="text-[13px] font-bold text-ink">{faq.question}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
