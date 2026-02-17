"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CardNav from "@/components/ui/navigation/CardNav";
import { submitRegistration } from "@/app/lib/api";
import type { CardNavItem } from "@/components/ui/navigation/CardNav";
import styles from "./register.module.css";
import { MIN_WHY_ATTEND_LENGTH } from "@/lib/constants";

type MessageType = "success" | "error" | null;
type RegistrationType = "student" | "staff";

const navItems: CardNavItem[] = [
  {
    label: "Home",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Back to Home", href: "/", ariaLabel: "Go to home page" },
    ]
  },
  {
    label: "Event",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "About", href: "/#about", ariaLabel: "Learn about the event" },
      { label: "Speakers", href: "/#speakers", ariaLabel: "View speakers" }
    ]
  },
  {
    label: "Connect",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Contact", href: "/#contact", ariaLabel: "Contact us" },
    ]
  }
];

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<RegistrationType>("student");
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    academic_year: "",
    major: "",
    why_attend: "",
    relevant_courses: "",
    prior_work_exp: "",
    photo_release: false,
  });

  const [message, setMessage] = useState<{ type: MessageType; text: string }>({
    type: null,
    text: "",
  });
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "why_attend") {
      setCharCount(value.length);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    setLoading(true);

    try {
      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email ||
        !formData.photo_release
      ) {
        setMessage({
          type: "error",
          text: "Please fill in all required fields",
        });
        setLoading(false);
        return;
      }

      if (registrationType === "student") {
        if (!formData.academic_year || !formData.major || charCount < 500 || !resumeFile) {
          setMessage({
            type: "error",
            text: "Please fill in all required fields and meet minimum requirements",
          });
          setLoading(false);
          return;
        }
      }

      const form = new FormData();
      form.append("first_name", formData.first_name);
      if (formData.middle_name)
        form.append("middle_name", formData.middle_name);
      form.append("last_name", formData.last_name);
      form.append("email", formData.email);

      if (registrationType === "student") {
        form.append("academic_year", formData.academic_year);
        form.append("major", formData.major);
        form.append("why_attend", formData.why_attend);
        if (formData.relevant_courses)
          form.append("relevant_courses", formData.relevant_courses);
        if (formData.prior_work_exp)
          form.append("prior_work_exp", formData.prior_work_exp);
        if (resumeFile) {
          form.append("resume", resumeFile);
        }
      } else {
        form.append("academic_year", "Staff");
      }

      form.append("photo_release", "true");

      const response = await submitRegistration(form);

      if (response.success) {
        setMessage({
          type: "success",
          text:
            response.data?.message || "Registration submitted successfully!",
        });
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          academic_year: "",
          major: "",
          why_attend: "",
          relevant_courses: "",
          prior_work_exp: "",
          photo_release: false,
        });
        setResumeFile(null);
        setCharCount(0);
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
        onButtonClick={() => window.location.href = "/"}
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
              Register for <span className={styles.titleAccent}>AI Summit</span>
            </h1>
            <p className={styles.subtitle}>
              Join Arizona State University&apos;s premier AI conference
            </p>
          </div>

          {/* Registration Type Tabs */}
          <div className={styles.tabsContainer}>
            <button
              type="button"
              onClick={() => setRegistrationType("student")}
              className={`${styles.tab} ${registrationType === "student" ? styles.tabActive : ""}`}
            >
              Students
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType("staff")}
              className={`${styles.tab} ${registrationType === "staff" ? styles.tabActive : ""}`}
            >
              Staff
            </button>
          </div>

          {/* Messages */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.message} ${message.type === "success" ? styles.success : styles.error}`}
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
              <p className={styles.hint}>
                Must be @asu.edu or @gmail.com
              </p>
            </div>

            {/* Academic Year - Students only */}
            {registrationType === "student" && (
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
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Master's">Master&apos;s</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            )}

            {/* Conditional fields for students */}
            {registrationType === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.conditionalFields}
              >
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

                <div className={styles.formGroup}>
                  <label htmlFor="why_attend" className={styles.label}>
                    Why do you want to attend? *
                  </label>
                  <textarea
                    id="why_attend"
                    name="why_attend"
                    value={formData.why_attend}
                    onChange={handleInputChange}
                    maxLength={10000}
                    rows={5}
                    className={styles.textarea}
                    placeholder="Tell us about your interest in AI and what you hope to gain from attending..."
                  />
                  <div className={styles.charCountRow}>
                    <span className={styles.hint}>Minimum {MIN_WHY_ATTEND_LENGTH}0 characters</span>
                    <span className={charCount >= MIN_WHY_ATTEND_LENGTH ? styles.charCountMet : styles.charCount}>
                      {charCount} / {MIN_WHY_ATTEND_LENGTH}0
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="resume" className={styles.label}>
                    Resume (PDF) *
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    required
                    className={styles.fileInput}
                  />
                  <p className={styles.hint}>
                    Max 5MB, PDF only
                    {resumeFile && (
                      <span className={styles.fileSelected}>
                        {" "}✓ {resumeFile.name}
                      </span>
                    )}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="relevant_courses" className={styles.label}>
                    Relevant Courses
                  </label>
                  <input
                    type="text"
                    id="relevant_courses"
                    name="relevant_courses"
                    value={formData.relevant_courses}
                    onChange={handleInputChange}
                    maxLength={1000}
                    className={styles.input}
                    placeholder="e.g., Machine Learning, Data Science, Neural Networks"
                  />
                  <p className={styles.hint}>
                    Comma-separated list (optional)
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prior_work_exp" className={styles.label}>
                    Prior Work Experience
                  </label>
                  <textarea
                    id="prior_work_exp"
                    name="prior_work_exp"
                    value={formData.prior_work_exp}
                    onChange={handleInputChange}
                    maxLength={10000}
                    rows={3}
                    className={styles.textarea}
                    placeholder="Brief description of relevant work experience (optional)"
                  />
                </div>
              </motion.div>
            )}

            {/* Photo Release */}
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="photo_release"
                  checked={formData.photo_release}
                  onChange={handleCheckboxChange}
                  required
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  I acknowledge and agree to the photo release policy. Photos
                  and videos taken during the event may be used for promotional
                  purposes. *
                </span>
              </label>
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
                "Submit Registration"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className={styles.footerLink}>
            Already registered?{" "}
            <Link href="/" className={styles.link}>
              Return to home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
