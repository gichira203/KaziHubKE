/**
 * Shared authentication shell with a clear, branded backdrop and a readable
 * white form card.
 */
import Logo from "@/components/common/Logo";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  /** Card title, e.g. "Log in to KaziHub KE". */
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  /** Rendered under the card — back link, legal note, etc. */
  footer?: React.ReactNode;
  backgroundImage?: "login" | "register";
  layout?: "standard" | "login";
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  backgroundImage = "login",
  layout = "standard",
}: AuthLayoutProps) {
  return (
    <div
      className={`${styles.page} ${layout === "login" ? styles.loginPage : ""}`}
      style={{ "--auth-background": `url('/${backgroundImage}.png')` } as React.CSSProperties}
    >
      {/* ---- form column ---- */}
      <main className={styles.main} id="main-content">
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Logo href="/" height={44} />
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          {children}
          {footer ? <div className={styles.cardFooter}>{footer}</div> : null}
        </div>
      </main>

    </div>
  );
}
