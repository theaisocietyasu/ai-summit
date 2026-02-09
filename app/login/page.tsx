"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { method: "GET" });
        if (res.ok) {
          router.push("/admin");
          return;
        }
      } catch {
        // Ignore; show login button below.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className={styles.container}>
      <a href="/" className={styles.logo}>
        <img src="/logo.png" alt="AIS Logo" className={styles.logoImage} />
      </a>

      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Admin Login</h1>
          <p>Access the AI Summit Admin Panel</p>
        </div>

        <div className={styles.form}>
          <a
            className={styles.submitBtn}
            href="/api/auth/discord"
            aria-disabled={loading}
            onClick={(e) => {
              if (loading) e.preventDefault();
            }}
          >
            {loading ? "Checking session..." : "Continue with Discord"}
          </a>
        </div>

        <div className={styles.footer}>
          <p>You must be in the Discord and have an allowed role.</p>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.decoration1}></div>
      <div className={styles.decoration2}></div>
    </div>
  );
}
