"use client";

import { useState } from "react";
import styles from "./RegistrationModal.module.css";

interface Registration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  academicYear: string;
  status: "Pending" | "Approved" | "Waitlisted" | "Rejected";
  resume?: string;
  [key: string]: any;
}

interface RegistrationModalProps {
  registration: Registration;
  onClose: () => void;
  authHeaders: Record<string, string>;
}

export default function RegistrationModal({
  registration,
  onClose,
  authHeaders,
}: RegistrationModalProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const handleViewResume = async () => {
    if (!registration.resume) return;
    setPdfLoading(true);
    try {
      // The resume field contains the file ID for GridFS
      // The API should serve PDFs from /api/file/:id
      setShowPdf(true);
    } catch (error) {
      console.error("Error loading resume:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <div className={styles.header}>
          <h2>{`${registration.firstName} ${registration.lastName}`}</h2>
          <span
            className={styles.statusBadge}
            style={{
              background:
                registration.status === "Approved"
                  ? "rgba(34, 197, 94, 0.2)"
                  : registration.status === "Rejected"
                    ? "rgba(239, 68, 68, 0.2)"
                    : registration.status === "Waitlisted"
                      ? "rgba(96, 165, 250, 0.2)"
                      : "rgba(251, 191, 36, 0.2)",
              color:
                registration.status === "Approved"
                  ? "#86efac"
                  : registration.status === "Rejected"
                    ? "#fca5a5"
                    : registration.status === "Waitlisted"
                      ? "#60a5fa"
                      : "#fbbf24",
            }}
          >
            {registration.status}
          </span>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{registration.email}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.label}>Academic Year:</span>
            <span className={styles.value}>{registration.academicYear}</span>
          </div>

          {/* Display all additional registration fields */}
          {Object.entries(registration).map(([key, value]) => {
            // Skip standard fields and file references
            if (
              [
                "_id",
                "firstName",
                "lastName",
                "email",
                "academicYear",
                "status",
                "resume",
              ].includes(key)
            ) {
              return null;
            }

            // Format key for display
            const displayKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

            return (
              <div key={key} className={styles.detailRow}>
                <span className={styles.label}>{displayKey}:</span>
                <span className={styles.value}>{String(value)}</span>
              </div>
            );
          })}

          {registration.resume && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Resume:</span>
              <button
                className={styles.resumeBtn}
                onClick={handleViewResume}
                disabled={pdfLoading}
              >
                {pdfLoading ? "Loading..." : "View Resume"}
              </button>
            </div>
          )}
        </div>

        {showPdf && registration.resume && (
          <div className={styles.pdfContainer}>
            <iframe
              src={`/api/file/${registration.resume}?type=resume`}
              title="Resume PDF"
              className={styles.pdfFrame}
            />
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
