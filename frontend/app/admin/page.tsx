"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEMO_ADMIN_SESSION } from "./admin-data";
import styles from "./admin.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const username = String(values.get("username") || "").trim();
    const password = String(values.get("password") || "");
    if (!username || !password) {
      setError("Enter a username and password to continue.");
      return;
    }
    // DEVELOPMENT DEMO ONLY: this local flag is not authentication.
    window.sessionStorage.setItem(DEMO_ADMIN_SESSION, username);
    router.push("/admin/dashboard");
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <Image className={styles.loginLogo} src="/website%20logo.png" alt="KaziHub KE" width={220} height={72} priority />
        <div className={styles.loginIcon}><LockKeyhole size={23} /></div>
        <p className={styles.eyebrow}>ADMINISTRATOR WORKSPACE</p>
        <h1>Welcome back</h1>
        <p className={styles.loginIntro}>Sign in to manage the KaziHub platform.</p>
        <div className={styles.demoWarning}><strong>Development demo</strong><span>Any non-empty username and password will open this frontend preview. This does not authenticate you.</span></div>
        <form className={styles.loginForm} onSubmit={submit}>
          <label htmlFor="username">Username</label>
          <input className={styles.loginInput} id="username" name="username" autoComplete="username" required />
          <label htmlFor="password">Password</label>
          <div className={styles.passwordInput}><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.primaryButton}>Login</button>
        </form>
        <Link className={styles.backLink} href="/">← Back to KaziHub</Link>
      </section>
    </main>
  );
}
