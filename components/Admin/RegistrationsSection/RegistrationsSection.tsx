"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./RegistrationsSection.module.css";
import RegistrationModal from "../RegistrationModal";

interface Registration {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  academic_year: string;
  is_approved: boolean;
  is_waitlisted: boolean;
  is_rejected: boolean;
  resume?: string;
}

interface RegistrationDisplay extends Registration {
  status: "Pending" | "Approved" | "Waitlisted" | "Rejected";
}

const STATUS_OPTIONS = [
  "Pending",
  "Approved",
  "Waitlisted",
  "Rejected",
] as const;

export default function RegistrationsSection() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [displayRegistrations, setDisplayRegistrations] = useState<
    RegistrationDisplay[]
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const getStatus = (reg: Registration): RegistrationDisplay["status"] => {
    if (reg.is_approved) return "Approved";
    if (reg.is_waitlisted) return "Waitlisted";
    if (reg.is_rejected) return "Rejected";
    return "Pending";
  };

  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationDisplay | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter.size > 0) {
        params.append('status', Array.from(statusFilter).join(','));
      }
      
      if (yearFilter.size > 0) {
        params.append('academicYear', Array.from(yearFilter).join(','));
      }
      
      // Map frontend sort to backend field names
      let backendSortBy: string = sortBy;
      if (sortBy === 'name') backendSortBy = 'first_name';
      if (sortBy === 'year') backendSortBy = 'academic_year';
      
      params.append('sortBy', backendSortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations);
        setDisplayRegistrations(
          (data.registrations as Registration[]).map((reg) => ({
            ...reg,
            status: getStatus(reg),
          })),
        );
        
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setMessage({ type: "error", text: "Failed to load registrations" });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, yearFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, yearFilter, sortBy, sortOrder]);

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        setMessage({ type: "success", text: `Status updated to ${newStatus}` });
        // Refetch current page to get updated data
        fetchRegistrations();
      } else {
        setMessage({ type: "error", text: "Failed to update status" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const getUniqueYears = () => {
    const years = new Set(registrations.map((r) => r.academic_year));
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
        {displayRegistrations.length > 0 ? (
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
              {displayRegistrations.map((registration) => (
                <tr key={registration._id}>
                  <td>{`${registration.first_name} ${registration.last_name}`}</td>
                  <td>{registration.email}</td>
                  <td>{registration.academic_year}</td>
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

      {/* Pagination Controls */}
      <div className={styles.paginationContainer}>
        <div className={styles.paginationInfo}>
          Showing {displayRegistrations.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} registrations
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ««
          </button>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »»
          </button>
        </div>
      </div>

      {showModal && selectedRegistration && (
        <RegistrationModal
          registration={selectedRegistration}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
