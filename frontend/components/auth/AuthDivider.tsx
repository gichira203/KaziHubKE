/** Horizontal rule with centered label, e.g. "or continue with email". */
import styles from "./AuthDivider.module.css";

export default function AuthDivider({ label }: { label: string }) {
  return (
    <div className={styles.divider} role="separator">
      <span className={styles.line} />
      <span className={styles.label}>{label}</span>
      <span className={styles.line} />
    </div>
  );
}
