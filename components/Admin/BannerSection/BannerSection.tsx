"use client";

import { useState } from "react";
import styles from "./BannerSection.module.css";

interface BannerSectionProps {
  authHeaders: Record<string, string>;
}

export default function BannerSection({ authHeaders }: BannerSectionProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Banner saved successfully!" });
        e.currentTarget.reset();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save banner",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Manage Banner</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="banner_title">Banner Title *</label>
          <input
            type="text"
            id="banner_title"
            name="banner_title"
            required
            maxLength={1000}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="banner_description">Banner Description *</label>
          <textarea
            id="banner_description"
            name="banner_description"
            required
            maxLength={10000}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="banner_image">Banner Image *</label>
          <input
            type="file"
            id="banner_image"
            name="banner_image"
            required
            accept="image/*"
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Saving..." : "Save Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}
