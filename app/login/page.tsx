"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create Basic Auth header
      const credentials = btoa(`${username}:${password}`);

      // Test authentication with a request to the backend
      // const res = await fetch("/api/admin/validate", {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Basic ${credentials}`,
      //   },
      // });

      localStorage.setItem("adminAuth", credentials);
      router.push("/admin");
      // if (res.ok) {
      //   // Store the credentials in localStorage
      //   localStorage.setItem("adminAuth", credentials);
      //   router.push("/admin");
      // } else {
      //   setError("Invalid username or password");
      // }
    } catch (error) {
      setError("Connection error. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Admin Login</h1>
          <p>Access the AI Summit Admin Panel</p>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Contact the administrator if you don't have login credentials</p>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.decoration1}></div>
      <div className={styles.decoration2}></div>
    </div>
  );
}
