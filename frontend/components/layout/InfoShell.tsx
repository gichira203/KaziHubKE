import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import styles from "./InfoShell.module.css";

/**
 * InfoShell — shared frame for the public informational pages
 * (About, How It Works, Services, Contact, Privacy, Terms, Community
 * Guidelines, Help, Safety). Pages supply only their own content.
 */
export default function InfoShell({
  eyebrow,
  title,
  description,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Shown on legal pages, e.g. "Last updated: …". */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lede}>{description}</p>
            {updated && <p className={styles.updated}>{updated}</p>}
          </header>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
