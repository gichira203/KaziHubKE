"use client";

/**
 * Help and Support (employer).
 */
import { LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/constants";

const faqs = [
  {
    question: "Why can't I publish my job listing?",
    answer:
      "Publishing requires a verified organization and platform moderation. You can prepare and save drafts now; publishing unlocks after verification is confirmed.",
  },
  {
    question: "What does organization verification involve?",
    answer:
      "The documented policy collects only what is needed for your organization type — legal name, type, an authorized representative, and official contact evidence. Documents are requested only when necessary.",
  },
  {
    question: "When do applications arrive?",
    answer:
      "Applications appear after an eligible, published listing receives them. Your drafts stay private until then.",
  },
  {
    question: "Can I see candidate CVs?",
    answer:
      "Only for candidates who applied to your listings and whose visibility settings allow it — and only for verified employers. Private CVs and contact details are never exposed.",
  },
];

export default function EmployerHelpPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand">
            <LifeBuoy size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Help and Support</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Questions about verification, listings or candidates? Reach the KaziHub KE employer
              team.
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

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
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
