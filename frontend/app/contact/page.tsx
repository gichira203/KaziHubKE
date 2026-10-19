import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import InfoShell from "@/components/layout/InfoShell";
import ContactForm from "@/components/layout/ContactForm";
import { contactReasons } from "@/data/info";
import { site } from "@/lib/constants";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact KaziHub KE",
  description:
    "Get in touch with the KaziHub KE team for general enquiries, account help, reporting a listing or fraudulent employer, or employer support.",
};

export default function ContactPage() {
  return (
    <InfoShell
      eyebrow="Contact Us"
      title="Talk to the KaziHub KE team"
      description="Questions, account trouble, or something suspicious to report — reach us through any of the channels below."
    >
      <div className={styles.layout}>
        <div className={styles.details}>
          <ul className={styles.channels}>
            <li className={styles.channel}>
              <span className={styles.channelIcon}>
                <Mail size={16} aria-hidden="true" />
              </span>
              <div>
                <p className={styles.channelLabel}>Email</p>
                <a className={styles.channelValue} href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </div>
            </li>
            <li className={styles.channel}>
              <span className={styles.channelIcon}>
                <Phone size={16} aria-hidden="true" />
              </span>
              <div>
                <p className={styles.channelLabel}>Phone</p>
                <p className={styles.channelValue}>{site.contact.phone}</p>
              </div>
            </li>
            <li className={styles.channel}>
              <span className={styles.channelIcon}>
                <MapPin size={16} aria-hidden="true" />
              </span>
              <div>
                <p className={styles.channelLabel}>Location</p>
                <p className={styles.channelValue}>{site.contact.location}</p>
              </div>
            </li>
          </ul>

          <div className={styles.reasons}>
            <h2 className={styles.reasonsTitle}>What can we help with?</h2>
            <ul className={styles.reasonList}>
              {contactReasons.map((reason) => (
                <li key={reason.title} className={styles.reason}>
                  <p className={styles.reasonTitle}>{reason.title}</p>
                  <p className={styles.reasonText}>{reason.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ContactForm />
      </div>
    </InfoShell>
  );
}
