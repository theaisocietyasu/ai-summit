"use client";

import { useState, useEffect } from "react";
import styles from "./AdminSponsorsSection.module.css";

interface Sponsor {
  _id?: string;
  sponsorName: string;
  sponsorTier: "platinum" | "gold" | "silver" | "bronze";
  sponsorLogo?: string;
}

const TIER_OPTIONS: Array<{ value: Sponsor["sponsorTier"]; label: string }> = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
];

export default function AdminSponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Sponsor>({
    sponsorName: "",
    sponsorTier: "platinum",
  });

  const fetchSponsors = async () => {
    try {
      const res = await fetch("/api/sponsors");
      if (res.ok) {
        const payload = await res.json();
        const rawSponsors = Array.isArray(payload)
          ? payload
          : (payload?.sponsors ?? payload?.data?.sponsors);

        const normalized: Sponsor[] = Array.isArray(rawSponsors)
          ? rawSponsors.map((s: any) => ({
              _id: s?._id,
              sponsorName: s?.sponsorName ?? s?.sponsor_name ?? "",
              sponsorTier: (s?.sponsorTier ?? s?.sponsor_tier ?? "platinum") as Sponsor["sponsorTier"],
              sponsorLogo: s?.sponsorLogo ?? s?.sponsor_logo,
            }))
          : [];

        setSponsors(normalized);
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sponsorTier" ? (value as Sponsor["sponsorTier"]) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("sponsorName", formData.sponsorName);
    formDataObj.append("sponsorTier", formData.sponsorTier);

    const fileInput = e.currentTarget.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formDataObj.append("sponsorLogo", fileInput.files[0]);
    }

    try {
      const url = editingId
        ? `/api/admin/sponsor/${editingId}`
        : "/api/admin/sponsor";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: editingId
            ? "Sponsor updated successfully!"
            : "Sponsor added successfully!",
        });
        setFormData({ sponsorName: "", sponsorTier: "platinum" });
        setEditingId(null);
        setShowForm(false);
        fileInput.value = "";
        fetchSponsors();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save sponsor",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setFormData(sponsor);
    setEditingId(sponsor._id || null);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admin/sponsor/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Sponsor deleted successfully!" });
        fetchSponsors();
      } else {
        setMessage({ type: "error", text: "Failed to delete sponsor" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const handleCancel = () => {
    setFormData({ sponsorName: "", sponsorTier: "platinum" });
    setEditingId(null);
    setShowForm(false);
    setMessage(null);
  };

  // Group sponsors by tier
  const sponsorsByTier = TIER_OPTIONS.reduce(
    (acc, tier) => {
      acc[tier.value] = sponsors.filter((s) => s.sponsorTier === tier.value);
      return acc;
    },
    {} as Record<Sponsor["sponsorTier"], Sponsor[]>,
  );

  return (
    <div>
      <div className={styles.header}>
        <h2>Manage Sponsors</h2>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + Add Sponsor
          </button>
        )}
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="sponsorName">Sponsor Name *</label>
            <input
              type="text"
              id="sponsorName"
              name="sponsorName"
              value={formData.sponsorName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sponsorTier">Sponsor Tier *</label>
            <select
              id="sponsorTier"
              name="sponsorTier"
              value={formData.sponsorTier}
              onChange={handleInputChange}
              required
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sponsorLogo">Sponsor Logo</label>
            <input type="file" id="sponsorLogo" accept="image/*" />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Sponsor"
                  : "Add Sponsor"}
            </button>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.sponsorsByTier}>
        {TIER_OPTIONS.map((tier) => (
          <div key={tier.value} className={styles.tierSection}>
            <h3 className={styles.tierTitle}>{tier.label} Sponsors</h3>
            {sponsorsByTier[tier.value].length > 0 ? (
              <div className={styles.sponsorsList}>
                {sponsorsByTier[tier.value].map((sponsor) => (
                  <div
                    key={sponsor._id}
                    className={`${styles.card} ${styles[tier.value]}`}
                  >
                    <div className={styles.cardContent}>
                      <h4>{sponsor.sponsorName}</h4>
                      <p className={styles.tier}>{tier.label}</p>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(sponsor)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(sponsor._id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                No {tier.label.toLowerCase()} sponsors yet
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
