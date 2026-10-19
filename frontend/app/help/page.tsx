import type { Metadata } from "next";
import Link from "next/link";
import InfoShell from "@/components/layout/InfoShell";
import { helpTopics } from "@/data/info";
import styles from "./help.module.css";

export const metadata: Metadata = {
  title: "Help Centre — KaziHub KE",
  description:
    "Answers about accounts, applications, online tasks and rewards, and employer verification on KaziHub KE.",
};

export default function HelpPage() {
  return (
    <InfoShell
      eyebrow="Help Centre"
      title="Frequently asked questions"
      description="Quick answers to the questions we hear most. Can't find yours? Contact the team."
    >
      {helpTopics.map((topic) => (
        <section key={topic.title} className={styles.topic}>
          <h2 className={styles.topicTitle}>{topic.title}</h2>
          <ul className={styles.entries}>
            {topic.entries.map((entry) => (
              <li key={entry.q} className={styles.entry}>
                <h3 className={styles.question}>{entry.q}</h3>
                <p className={styles.answer}>{entry.a}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className={styles.more}>
        <p className={styles.moreText}>Still stuck?</p>
        <div className={styles.moreLinks}>
          <Link href="/contact" className={styles.moreLink}>
            Contact the team
          </Link>
          <Link href="/safety" className={styles.moreLink}>
            Safety & reporting
          </Link>
        </div>
      </div>
    </InfoShell>
  );
}
