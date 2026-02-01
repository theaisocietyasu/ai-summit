import { useState, ChangeEvent, FormEvent } from "react";
import { apiClient } from "../api";
import "../styles/Register.css";

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  academic_year: string;
  field_of_study?: string;
  major?: string;
  why_attend?: string;
  relevant_courses?: string;
  prior_work_exp?: string;
  resume?: File;
  photo_release: boolean;
}

function Register() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    academic_year: "",
    field_of_study: "",
    major: "",
    why_attend: "",
    relevant_courses: "",
    prior_work_exp: "",
    photo_release: false,
  });

  const [charCount, setCharCount] = useState(0);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null,
  );

  const isStaff = formData.academic_year === "Staff";

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as any;

    if (name === "why_attend") {
      setCharCount(value.length);
    }

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate character count
    if (!isStaff && (formData.why_attend?.length || 0) < 500) {
      setMessage({
        type: "error",
        text: "Please enter at least 500 characters for 'Why do you want to attend?'",
      });
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("first_name", formData.first_name);
      submitData.append("middle_name", formData.middle_name);
      submitData.append("last_name", formData.last_name);
      submitData.append("email", formData.email);
      submitData.append("academic_year", formData.academic_year);
      submitData.append(
        "photo_release",
        formData.photo_release ? "true" : "false",
      );

      if (isStaff) {
        submitData.append("field_of_study", formData.field_of_study || "");
      } else {
        submitData.append("major", formData.major || "");
        submitData.append("why_attend", formData.why_attend || "");
        submitData.append("relevant_courses", formData.relevant_courses || "");
        submitData.append("prior_work_exp", formData.prior_work_exp || "");
      }

      if (resume) {
        submitData.append("resume", resume);
      }

      await apiClient.submitRegistration(submitData);

      setMessage({
        type: "success",
        text: "Registration submitted successfully! Check your email for confirmation.",
      });

      // Reset form
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        academic_year: "",
        field_of_study: "",
        major: "",
        why_attend: "",
        relevant_courses: "",
        prior_work_exp: "",
        photo_release: false,
      });
      setCharCount(0);
      setResume(null);
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="bg-glow"></div>

      <div className="register-container">
        <section className="register-section">
          <div className="form-wrapper">
            <h1>Register for AI Summit</h1>
            <p className="subtitle">Join the future of innovation at ASU</p>

            {message && (
              <div className={`message message-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                />
                <p className="form-hint">Must be @asu.edu or @gmail.com</p>
              </div>

              <div className="form-group">
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

              {isStaff && (
                <div className="form-group">
                  <label htmlFor="field_of_study">Field of Study *</label>
                  <input
                    type="text"
                    id="field_of_study"
                    name="field_of_study"
                    value={formData.field_of_study || ""}
                    onChange={handleInputChange}
                    required
                    maxLength={1000}
                  />
                </div>
              )}

              {!isStaff && (
                <>
                  <div className="form-group">
                    <label htmlFor="major">Major *</label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major || ""}
                      onChange={handleInputChange}
                      required
                      maxLength={1000}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="why_attend">
                      Why do you want to attend? *
                    </label>
                    <textarea
                      id="why_attend"
                      name="why_attend"
                      value={formData.why_attend || ""}
                      onChange={handleInputChange}
                      maxLength={10000}
                      rows={4}
                    ></textarea>
                    <p className="form-hint">Minimum 500 characters</p>
                    <p
                      className="form-hint"
                      style={{ color: charCount >= 500 ? "#22c55e" : "#888" }}
                    >
                      {charCount} / 500 characters
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="resume">Resume (PDF) *</label>
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="form-hint">Max 5MB, PDF only</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="relevant_courses">Relevant Courses</label>
                    <input
                      type="text"
                      id="relevant_courses"
                      name="relevant_courses"
                      value={formData.relevant_courses || ""}
                      onChange={handleInputChange}
                      maxLength={1000}
                    />
                    <p className="form-hint">Comma-separated list (optional)</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prior_work_exp">
                      Prior Work Experience
                    </label>
                    <textarea
                      id="prior_work_exp"
                      name="prior_work_exp"
                      value={formData.prior_work_exp || ""}
                      onChange={handleInputChange}
                      maxLength={10000}
                      rows={4}
                    ></textarea>
                  </div>
                </>
              )}

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="photo_release"
                    name="photo_release"
                    checked={formData.photo_release}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="custom-checkbox"></span>
                  <span>
                    I acknowledge and agree to the photo release policy *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Register"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
