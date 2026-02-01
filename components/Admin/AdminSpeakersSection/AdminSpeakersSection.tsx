"use client";

import { useState, useEffect } from "react";
import styles from "./AdminSpeakersSection.module.css";

interface Speaker {
  _id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  bio: string;
  speakerImage?: string;
}

export default function AdminSpeakersSection() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Speaker>({
    firstName: "",
    middleName: "",
    lastName: "",
    bio: "",
  });

  const fetchSpeakers = async () => {
    try {
      const res = await fetch("/api/speakers");
      if (res.ok) {
        const payload = await res.json();
        const rawSpeakers = Array.isArray(payload)
          ? payload
          : (payload?.speakers ?? payload?.data?.speakers);

        const normalized: Speaker[] = Array.isArray(rawSpeakers)
          ? rawSpeakers.map((s: any) => ({
              _id: s?._id,
              firstName: s?.firstName ?? s?.first_name ?? "",
              middleName: s?.middleName ?? s?.middle_name ?? "",
              lastName: s?.lastName ?? s?.last_name ?? "",
              bio: s?.bio ?? "",
              speakerImage: s?.speakerImage ?? s?.headshot_img_url,
            }))
          : [];

        setSpeakers(normalized);
      }
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("firstName", formData.firstName);
    formDataObj.append("middleName", formData.middleName || "");
    formDataObj.append("lastName", formData.lastName);
    formDataObj.append("bio", formData.bio);

    const fileInput = e.currentTarget.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formDataObj.append("speakerImage", fileInput.files[0]);
    }

    try {
      const url = editingId
        ? `/api/admin/speaker/${editingId}`
        : "/api/admin/speaker";
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
            ? "Speaker updated successfully!"
            : "Speaker added successfully!",
        });
        setFormData({ firstName: "", middleName: "", lastName: "", bio: "" });
        setEditingId(null);
        setShowForm(false);
        fileInput.value = "";
        fetchSpeakers();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save speaker",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (speaker: Speaker) => {
    setFormData(speaker);
    setEditingId(speaker._id || null);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admin/speaker/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Speaker deleted successfully!" });
        fetchSpeakers();
      } else {
        setMessage({ type: "error", text: "Failed to delete speaker" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const handleCancel = () => {
    setFormData({ firstName: "", middleName: "", lastName: "", bio: "" });
    setEditingId(null);
    setShowForm(false);
    setMessage(null);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Manage Speakers</h2>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + Add Speaker
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
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio *</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="speakerImage">Speaker Image</label>
            <input type="file" id="speakerImage" accept="image/*" />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Speaker"
                  : "Add Speaker"}
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

      <div className={styles.speakersList}>
        {speakers.map((speaker) => (
          <div key={speaker._id} className={styles.card}>
            <div className={styles.cardContent}>
              <h3>
                {speaker.firstName} {speaker.middleName} {speaker.lastName}
              </h3>
              <p>{speaker.bio}</p>
            </div>
            <div className={styles.cardActions}>
              <button
                className={styles.editBtn}
                onClick={() => handleEdit(speaker)}
              >
                Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(speaker._id!)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
