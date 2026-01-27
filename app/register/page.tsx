"use client";

import { useState, useEffect } from "react";
import styles from "./register.module.css";
import { submitRegistration } from "@/app/lib/api";

type MessageType = "success" | "error" | null;

export default function RegisterPage() {
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
  const [isStaff, setIsStaff] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    setIsStaff(formData.academic_year === "Staff");
  }, [formData.academic_year]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
      // Validate required fields
      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email ||
        !formData.academic_year
      ) {
        setMessage({
          type: "error",
          text: "Please fill in all required fields",
        });
        setLoading(false);
        return;
      }

      if (!isStaff) {
        if (!formData.major || charCount < 500 || !formData.photo_release) {
          setMessage({
            type: "error",
            text: "Please fill in all required fields and meet minimum requirements",
          });
          setLoading(false);
          return;
        }
        if (!resumeFile) {
          setMessage({
            type: "error",
            text: "Resume is required for non-staff registrations",
          });
          setLoading(false);
          return;
        }
      }

      if (!formData.photo_release) {
        setMessage({
          type: "error",
          text: "You must acknowledge the photo release policy",
        });
        setLoading(false);
        return;
      }

      // Build FormData for multipart request
      const form = new FormData();
      form.append("first_name", formData.first_name);
      if (formData.middle_name)
        form.append("middle_name", formData.middle_name);
      form.append("last_name", formData.last_name);
      form.append("email", formData.email);
      form.append("academic_year", formData.academic_year);
      if (!isStaff) {
        form.append("major", formData.major);
        form.append("why_attend", formData.why_attend);
        if (formData.relevant_courses)
          form.append("relevant_courses", formData.relevant_courses);
        if (formData.prior_work_exp)
          form.append("prior_work_exp", formData.prior_work_exp);
      }
      form.append("photo_release", "true");
      if (resumeFile) {
        form.append("resume", resumeFile);
      }

      const response = await submitRegistration(form);

      if (response.success) {
        setMessage({
          type: "success",
          text:
            response.data?.message || "Registration submitted successfully!",
        });
        // Reset form
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
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <a href="/" className={styles.logo}>
            AI Summit
          </a>
          <ul className={styles.navLinks}>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
            <li>
              <a href="/login">Admin</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className={styles.container}>
        <section className={styles.section}>
          <div className={styles.formContainer}>
            <h1>Register for AI Summit</h1>

            {message.text && (
              <div
                className={`${styles.message} ${styles[message.type || "error"]}`}
              >
                {message.text.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  maxLength={1000}
                  required
                />
                <p className={styles.formHint}>
                  Must be @asu.edu or @gmail.com
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="academic_year">Academic Year *</label>
                <select
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your academic year...</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {!isStaff && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="major">Major *</label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      maxLength={1000}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="why_attend">
                      Why do you want to attend? *
                    </label>
                    <textarea
                      id="why_attend"
                      name="why_attend"
                      value={formData.why_attend}
                      onChange={handleInputChange}
                      maxLength={10000}
                    />
                    <p className={styles.formHint}>Minimum 500 characters</p>
                    <p
                      className={styles.charCount}
                      style={{ color: charCount >= 500 ? "#22c55e" : "#888" }}
                    >
                      {charCount} / 500 characters
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="resume">Resume (PDF) *</label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      required={!isStaff}
                    />
                    <p className={styles.formHint}>Max 5MB, PDF only</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="relevant_courses">Relevant Courses</label>
                    <input
                      type="text"
                      id="relevant_courses"
                      name="relevant_courses"
                      value={formData.relevant_courses}
                      onChange={handleInputChange}
                      maxLength={1000}
                    />
                    <p className={styles.formHint}>
                      Comma-separated list (optional)
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="prior_work_exp">
                      Prior Work Experience
                    </label>
                    <textarea
                      id="prior_work_exp"
                      name="prior_work_exp"
                      value={formData.prior_work_exp}
                      onChange={handleInputChange}
                      maxLength={10000}
                    />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="photo_release"
                    checked={formData.photo_release}
                    onChange={handleCheckboxChange}
                    required
                  />
                  <span>
                    I acknowledge and agree to the photo release policy *
                  </span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btn} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
