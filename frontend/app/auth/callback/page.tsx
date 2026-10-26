"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exchangeSocialCode } from "@/lib/auth-config";
import { createSocialSession } from "@/lib/session";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let active = true;
    const code = new URLSearchParams(window.location.hash.slice(1)).get("code");
    if (!code) {
      router.replace("/login?oauth_error=provider");
      return;
    }
    void exchangeSocialCode(code).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setMessage(result.error);
        window.setTimeout(() => router.replace("/login?oauth_error=provider"), 1800);
        return;
      }
      if (result.data) {
        createSocialSession(result.data);
        router.replace("/dashboard");
        return;
      }
      setMessage("Sign-in could not be completed.");
      window.setTimeout(() => router.replace("/login?oauth_error=provider"), 1800);
    });
    return () => { active = false; };
  }, [router]);

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}><p role="status">{message}</p></main>;
}
