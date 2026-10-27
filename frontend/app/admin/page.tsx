"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import styles from "./admin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = new FormData(event.currentTarget);
    const email = String(values.get("username") || "").trim();
    const password = String(values.get("password") || "");
    try {
      const result = await apiRequest<{ user: { role?: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.user?.role !== "admin") {
        await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
        setError("This account does not have administrator access.");
        return;
      }
      router.replace("/admin/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Administrator sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <Image className={styles.loginLogo} src="/website%20logo.png" alt="KaziHub KE" width={220} height={72} priority />
        <div className={styles.loginIcon}><LockKeyhole size={23} /></div>
        <p className={styles.eyebrow}>ADMINISTRATOR WORKSPACE</p>
        <h1>Welcome back</h1>
        <p className={styles.loginIntro}>Sign in to manage the KaziHub platform.</p>
        <div className={styles.demoWarning}><strong>Secure administrator sign in</strong><span>Use your administrator account. Access is verified by the platform API.</span></div>
        <form className={styles.loginForm} onSubmit={submit}>
          <label htmlFor="username">Username or email</label>
          <input className={styles.loginInput} id="username" name="username" type="text" autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <div className={styles.passwordInput}><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.primaryButton} disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
        </form>
        <Link className={styles.backLink} href="/">← Back to KaziHub</Link>
      </section>
    </main>
  );
}
