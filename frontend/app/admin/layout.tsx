import { ReactNode, Suspense } from "react";
import { AdminShell } from "./AdminShell";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className={styles.loadingPage}>Loading admin page…</main>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
