import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ADMIN_SECTIONS } from "../admin-data";
import { AdminSectionPage } from "../components/AdminSectionPage";
import styles from "../admin.module.css";

export default function AdminSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  return (
    <Suspense fallback={<main className={styles.content}><div className={styles.loadingPage}>Loading admin records…</div></main>}>
      <AdminSectionContent params={params} />
    </Suspense>
  );
}

async function AdminSectionContent({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const data = ADMIN_SECTIONS[section];
  if (!data) notFound();
  return <AdminSectionPage section={data} />;
}
