"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CardNav from "@/components/ui/navigation/CardNav";
import { submitQuickRegistration } from "@/app/lib/api";
import type { CardNavItem } from "@/components/ui/navigation/CardNav";
import styles from "@/app/register/register.module.css";

type MessageType = "success" | "error" | null;

const navItems: CardNavItem[] = [
  {
    label: "Home",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Back to Home", href: "/", ariaLabel: "Go to home page" },
    ],
  },
  {
    label: "Event",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "About", href: "/#about", ariaLabel: "Learn about the event" },
      { label: "Speakers", href: "/#speakers", ariaLabel: "View speakers" },
    ],
  },
  {
    label: "Connect",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Contact", href: "/#contact", ariaLabel: "Contact us" },
    ],
  },
];

const STUDENT_YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Master's",
  "PhD",
] as const;

export default function QuickRegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    academic_year: "",
    major: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: MessageType; text: string }>({
    type: null,
    text: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    setLoading(true);

    try {
      const form = new FormData();
      form.append("first_name", formData.first_name);
      if (formData.middle_name) form.append("middle_name", formData.middle_name);
      form.append("last_name", formData.last_name);
      form.append("email", formData.email);
      form.append("academic_year", formData.academic_year);
      form.append("major", formData.major);
      if (resumeFile) form.append("resume", resumeFile);

      const response = await submitQuickRegistration(form);

      if (response.success) {
        setMessage({
          type: "success",
          text:
            (response.data as { message?: string })?.message ||
            "Registration submitted! Check your email for your QR code.",
        });
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          academic_year: "",
          major: "",
        });
        setResumeFile(null);
        const fileInput = document.getElementById("resume") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      } else {
        const errorText = response.errors
          ? `${response.error}\n${Object.entries(response.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join("\n")}`
          : response.error || "Registration failed";
        setMessage({ type: "error", text: errorText });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <CardNav
        items={navItems}
        baseColor="transparent"
        menuColor="#fff"
        buttonBgColor="#6a1740"
        buttonTextColor="#fff"
        buttonLabel="Home"
        onButtonClick={() => (window.location.href = "/")}
      />

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.formCard}
        >
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>
              Walk-In <span className={styles.titleAccent}>Registration</span>
            </h1>
            <p className={styles.subtitle}>
              Register on-site and receive your QR code by email instantly
            </p>
          </div>

          {/* Messages */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.message} ${
                message.type === "success" ? styles.success : styles.error
              }`}
            >
              {message.text.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Name Row */}
            <div className={styles.nameRow}>
              <div className={styles.formGroup}>
                <label htmlFor="first_name" className={styles.label}>
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  required
                  className={styles.input}
                  placeholder="John"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="middle_name" className={styles.label}>
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  className={styles.input}
                  placeholder="(Optional)"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="last_name" className={styles.label}>
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  required
                  className={styles.input}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                maxLength={1000}
                required
                className={styles.input}
                placeholder="you@asu.edu"
              />
              <p className={styles.hint}>Must be @asu.edu or @gmail.com</p>
            </div>

            {/* Academic Year */}
            <div className={styles.formGroup}>
              <label htmlFor="academic_year" className={styles.label}>
                Academic Year *
              </label>
              <select
                id="academic_year"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                required
                className={styles.input}
              >
                <option value="">Select your academic year...</option>
                {STUDENT_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Major */}
            <div className={styles.formGroup}>
              <label htmlFor="major" className={styles.label}>
                Major *
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                maxLength={1000}
                required
                className={styles.input}
                placeholder="Computer Science"
              />
            </div>

            {/* Resume (optional) */}
            <div className={styles.formGroup}>
              <label htmlFor="resume" className={styles.label}>
                Resume (PDF, optional)
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept="application/pdf"
                className={styles.fileInput}
              />
              <p className={styles.hint}>
                Max 5MB, PDF only. Upload if you want to be considered by
                recruiters and for future opportunities.
                {resumeFile && (
                  <span className={styles.fileSelected}>
                    {" "}
                    ✓ {resumeFile.name}
                  </span>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Submitting...
                </span>
              ) : (
                "Register & Get QR Code"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className={styles.footerLink}>
            Want to register in advance?{" "}
            <Link href="/register" className={styles.link}>
              Full registration
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
