"use client";

import { useState, useEffect } from "react";
import styles from "./AdminEventsSection.module.css";
import { normalizeTag } from "@/lib/normalizeTag";

interface Event {
  _id?: string;
  title: string;
  description: string;
  tags?: string[];
  thumbnail?: string;
}

export default function AdminEventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const payload = await res.json();
        const rawEvents = Array.isArray(payload)
          ? payload
          : (payload?.events ?? payload?.data?.events);

        const normalized: Event[] = Array.isArray(rawEvents)
          ? rawEvents.map((e: any) => ({
              _id: e?._id,
              title: e?.title ?? e?.event_title ?? "",
              description: e?.description ?? e?.event_description ?? "",
              tags: Array.isArray(e?.tags) ? e.tags : [],
              thumbnail: e?.thumbnail ?? e?.thumbnail_url,
            }))
          : [];

        setEvents(normalized);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
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

  const handleAddTag = () => {
    const normalized = normalizeTag(tagInput);
    if (normalized && formData.tags && !formData.tags.includes(normalized)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), normalized],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("tags", JSON.stringify(formData.tags || []));

    const fileInput = e.currentTarget.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formDataObj.append("thumbnail", fileInput.files[0]);
    }

    try {
      const url = editingId
        ? `/api/admin/event/${editingId}`
        : "/api/admin/event";
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
            ? "Event updated successfully!"
            : "Event added successfully!",
        });
        setFormData({ title: "", description: "", tags: [] });
        setEditingId(null);
        setShowForm(false);
        setTagInput("");
        fileInput.value = "";
        fetchEvents();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save event",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setFormData(event);
    setEditingId(event._id || null);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admin/event/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Event deleted successfully!" });
        fetchEvents();
      } else {
        setMessage({ type: "error", text: "Failed to delete event" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", tags: [] });
    setEditingId(null);
    setShowForm(false);
    setTagInput("");
    setMessage(null);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Manage Events</h2>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + Add Event
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
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Event Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tags</label>
            <div className={styles.tagInput}>
              <input
                type="text"
                placeholder="Add tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                className={styles.tagBtn}
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className={styles.tags}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="thumbnail">Event Thumbnail</label>
            <input type="file" id="thumbnail" accept="image/*" />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Event" : "Add Event"}
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

      <div className={styles.eventsList}>
        {events.map((event) => (
          <div key={event._id} className={styles.card}>
            <div className={styles.cardContent}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              {event.tags && event.tags.length > 0 && (
                <div className={styles.cardTags}>
                  {event.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.cardActions}>
              <button
                className={styles.editBtn}
                onClick={() => handleEdit(event)}
              >
                Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(event._id!)}
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
