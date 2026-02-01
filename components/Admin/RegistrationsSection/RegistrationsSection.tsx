"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./RegistrationsSection.module.css";
import RegistrationModal from "../RegistrationModal";

interface Registration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  academicYear: string;
  status: "Pending" | "Approved" | "Waitlisted" | "Rejected";
  resume?: string;
}

interface RegistrationsSectionProps {
  authHeaders: Record<string, string>;
}

const STATUS_OPTIONS = [
  "Pending",
  "Approved",
  "Waitlisted",
  "Rejected",
] as const;

export default function RegistrationsSection({
  authHeaders,
}: RegistrationsSectionProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [yearFilter, setYearFilter] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "email" | "year" | "status">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
        applyFiltersAndSort(data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setMessage({ type: "error", text: "Failed to load registrations" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const applyFiltersAndSort = useCallback(
    (regs: Registration[]) => {
      let filtered = [...regs];

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.firstName.toLowerCase().includes(term) ||
            r.lastName.toLowerCase().includes(term) ||
            r.email.toLowerCase().includes(term),
        );
      }

      // Status filter
      if (statusFilter.size > 0) {
        filtered = filtered.filter((r) => statusFilter.has(r.status));
      }

      // Year filter
      if (yearFilter.size > 0) {
        filtered = filtered.filter((r) => yearFilter.has(r.academicYear));
      }

      // Sort
      filtered.sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";

        switch (sortBy) {
          case "name":
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case "email":
            aVal = a.email.toLowerCase();
            bVal = b.email.toLowerCase();
            break;
          case "year":
            aVal = a.academicYear;
            bVal = b.academicYear;
            break;
          case "status":
            aVal = a.status;
            bVal = b.status;
            break;
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setFilteredRegistrations(filtered);
    },
    [searchTerm, statusFilter, yearFilter, sortBy, sortOrder],
  );

  useEffect(() => {
    applyFiltersAndSort(registrations);
  }, [
    searchTerm,
    statusFilter,
    yearFilter,
    sortBy,
    sortOrder,
    applyFiltersAndSort,
    registrations,
  ]);

  const toggleStatusFilter = (status: string) => {
    const newFilter = new Set(statusFilter);
    if (newFilter.has(status)) {
      newFilter.delete(status);
    } else {
      newFilter.add(status);
    }
    setStatusFilter(newFilter);
  };

  const toggleYearFilter = (year: string) => {
    const newFilter = new Set(yearFilter);
    if (newFilter.has(year)) {
      newFilter.delete(year);
    } else {
      newFilter.add(year);
    }
    setYearFilter(newFilter);
  };

  const handleStatusChange = async (
    registrationId: string,
    newStatus: string,
  ) => {
    try {
      const res = await fetch(
        `/api/admin/registration/${registrationId}/status`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        setMessage({ type: "success", text: `Status updated to ${newStatus}` });
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === registrationId
              ? { ...r, status: newStatus as Registration["status"] }
              : r,
          ),
        );
        applyFiltersAndSort(registrations);
      } else {
        setMessage({ type: "error", text: "Failed to update status" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const getUniqueYears = () => {
    const years = new Set(registrations.map((r) => r.academicYear));
    return Array.from(years).sort();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#86efac";
      case "Pending":
        return "#fbbf24";
      case "Waitlisted":
        return "#60a5fa";
      case "Rejected":
        return "#fca5a5";
      default:
        return "#e4e4e4";
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading registrations...</div>;
  }

  return (
    <div>
      <h2>Manage Registrations</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}


      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterRow}>
          {/* Status Dropdown */}
          <div className={styles.dropdownMulti} tabIndex={0}>
            <button className={styles.dropdownButton} type="button">
              Status
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            <div className={styles.dropdownContent}>
              {STATUS_OPTIONS.map((status) => (
                <label key={status} className={styles.dropdownCheckbox}>
                  <input
                    type="checkbox"
                    checked={statusFilter.has(status)}
                    onChange={() => toggleStatusFilter(status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>

          {/* Academic Year Dropdown */}
          <div className={styles.dropdownMulti} tabIndex={0}>
            <button className={styles.dropdownButton} type="button">
              Academic Year
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            <div className={styles.dropdownContent}>
              {getUniqueYears().map((year) => (
                <label key={year} className={styles.dropdownCheckbox}>
                  <input
                    type="checkbox"
                    checked={yearFilter.has(year)}
                    onChange={() => toggleYearFilter(year)}
                  />
                  {year}
                </label>
              ))}
            </div>
          </div>

          {/* Sort Section */}
          <div className={styles.sortSection}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={styles.sortSelect}
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="year">Sort by Year</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              className={styles.sortToggle}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {filteredRegistrations.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((registration) => (
                <tr key={registration._id}>
                  <td>{`${registration.firstName} ${registration.lastName}`}</td>
                  <td>{registration.email}</td>
                  <td>{registration.academicYear}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        borderLeftColor: getStatusColor(registration.status),
                      }}
                    >
                      {registration.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowModal(true);
                        }}
                      >
                        View
                      </button>
                      <select
                        value={registration.status}
                        onChange={(e) =>
                          handleStatusChange(registration._id, e.target.value)
                        }
                        className={styles.statusSelect}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.empty}>
            <p>No registrations found</p>
          </div>
        )}
      </div>

      {showModal && selectedRegistration && (
        <RegistrationModal
          registration={selectedRegistration}
          onClose={() => setShowModal(false)}
          authHeaders={authHeaders}
        />
      )}
    </div>
  );
}
