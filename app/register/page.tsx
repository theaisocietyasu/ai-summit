"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FloatingNavbar } from "@/components/ui/navigation";
import { GlowButton } from "@/components/ui/effects";
import { submitRegistration } from "@/app/lib/api";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconUserPlus,
  IconLock,
} from "@tabler/icons-react";

type MessageType = "success" | "error" | null;

const navItems = [
  { name: "Home", link: "/", icon: <IconHome size={18} /> },
  { name: "Register", link: "/register", icon: <IconUserPlus size={18} /> },
  { name: "Admin", link: "/login", icon: <IconLock size={18} /> },
];

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

  const inputClasses = cn(
    "w-full rounded-xl border border-space-purple-mid/30 bg-space-black/50 px-4 py-3",
    "text-white placeholder-zinc-500",
    "transition-all duration-300",
    "focus:border-space-purple-light focus:outline-none focus:ring-2 focus:ring-space-purple-light/20",
    "hover:border-space-purple-mid/50"
  );

  const labelClasses = "block mb-2 text-sm font-medium text-zinc-300";

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <FloatingNavbar navItems={navItems} />

      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-12"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              Register for{" "}
              <span className="bg-gradient-to-r from-space-purple-light to-space-magenta-mid bg-clip-text text-transparent">
                AI Summit
              </span>
            </h1>
            <p className="text-zinc-400">
              Join Arizona State University&apos;s premier AI conference
            </p>
          </div>

          {/* Messages */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 rounded-xl p-4",
                message.type === "success"
                  ? "border border-green-500/30 bg-green-500/10 text-green-400"
                  : "border border-red-500/30 bg-red-500/10 text-red-400"
              )}
            >
              {message.text.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="first_name" className={labelClasses}>
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
                  className={inputClasses}
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="middle_name" className={labelClasses}>
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  maxLength={1000}
                  className={inputClasses}
                  placeholder="(Optional)"
                />
              </div>
              <div>
                <label htmlFor="last_name" className={labelClasses}>
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
                  className={inputClasses}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClasses}>
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
                className={inputClasses}
                placeholder="you@asu.edu"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Must be @asu.edu or @gmail.com
              </p>
            </div>

            {/* Academic Year */}
            <div>
              <label htmlFor="academic_year" className={labelClasses}>
                Academic Year *
              </label>
              <select
                id="academic_year"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                required
                className={inputClasses}
              >
                <option value="">Select your academic year...</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Master's">Master&apos;s</option>
                <option value="PhD">PhD</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {/* Conditional fields for non-staff */}
            {!isStaff && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="major" className={labelClasses}>
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
                    className={inputClasses}
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label htmlFor="why_attend" className={labelClasses}>
                    Why do you want to attend? *
                  </label>
                  <textarea
                    id="why_attend"
                    name="why_attend"
                    value={formData.why_attend}
                    onChange={handleInputChange}
                    maxLength={10000}
                    rows={5}
                    className={cn(inputClasses, "resize-none")}
                    placeholder="Tell us about your interest in AI and what you hope to gain from attending..."
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Minimum 500 characters</span>
                    <span
                      className={cn(
                        charCount >= 500 ? "text-green-400" : "text-zinc-500"
                      )}
                    >
                      {charCount} / 500
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="resume" className={labelClasses}>
                    Resume (PDF) *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      required={!isStaff}
                      className={cn(
                        inputClasses,
                        "file:mr-4 file:rounded-full file:border-0",
                        "file:bg-space-purple-light/20 file:px-4 file:py-2",
                        "file:text-sm file:font-medium file:text-space-purple-light",
                        "file:cursor-pointer file:transition-colors",
                        "file:hover:bg-space-purple-light/30"
                      )}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Max 5MB, PDF only
                    {resumeFile && (
                      <span className="ml-2 text-green-400">
                        ✓ {resumeFile.name}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label htmlFor="relevant_courses" className={labelClasses}>
                    Relevant Courses
                  </label>
                  <input
                    type="text"
                    id="relevant_courses"
                    name="relevant_courses"
                    value={formData.relevant_courses}
                    onChange={handleInputChange}
                    maxLength={1000}
                    className={inputClasses}
                    placeholder="e.g., Machine Learning, Data Science, Neural Networks"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Comma-separated list (optional)
                  </p>
                </div>

                <div>
                  <label htmlFor="prior_work_exp" className={labelClasses}>
                    Prior Work Experience
                  </label>
                  <textarea
                    id="prior_work_exp"
                    name="prior_work_exp"
                    value={formData.prior_work_exp}
                    onChange={handleInputChange}
                    maxLength={10000}
                    rows={3}
                    className={cn(inputClasses, "resize-none")}
                    placeholder="Brief description of relevant work experience (optional)"
                  />
                </div>
              </motion.div>
            )}

            {/* Photo Release */}
            <div className="rounded-xl border border-space-purple-mid/30 bg-space-purple-dark/20 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="photo_release"
                  checked={formData.photo_release}
                  onChange={handleCheckboxChange}
                  required
                  className="mt-1 h-5 w-5 rounded border-space-purple-mid bg-space-black accent-space-purple-light"
                />
                <span className="text-sm text-zinc-300">
                  I acknowledge and agree to the photo release policy. Photos
                  and videos taken during the event may be used for promotional
                  purposes. *
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <GlowButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Registration"
                )}
              </GlowButton>
            </div>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center text-sm text-zinc-500">
            Already registered?{" "}
            <Link
              href="/"
              className="text-space-purple-light transition-colors hover:text-space-magenta-light"
            >
              Return to home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
