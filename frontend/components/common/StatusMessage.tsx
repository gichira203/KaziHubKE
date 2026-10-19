"use client";

/**
 * Inline status message for error / info / success banners.
 * Rendered with role="alert" so screen readers announce it immediately.
 */
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import styles from "./StatusMessage.module.css";

type StatusMessageProps = {
  type: "error" | "info" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
};

const icons = {
  error: XCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

export default function StatusMessage({ type, children, className = "" }: StatusMessageProps) {
  const Icon = icons[type];
  return (
    <div
      className={`${styles.message} ${styles[type]} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
