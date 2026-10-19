/** Inline spinner used inside buttons and step panels. */
import styles from "./LoadingSpinner.module.css";

type LoadingSpinnerProps = {
  size?: number;
  label?: string;
};

export default function LoadingSpinner({ size = 16, label = "Loading" }: LoadingSpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 8) }}
      role="status"
      aria-label={label}
    />
  );
}
