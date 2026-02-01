import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api";
import "../styles/Admin.css";

function Admin() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    apiClient.logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === "banner" ? "active" : ""}`}
            onClick={() => setActiveSection("banner")}
          >
            Banner
          </button>
          <button
            className={`nav-item ${activeSection === "speakers" ? "active" : ""}`}
            onClick={() => setActiveSection("speakers")}
          >
            Speakers
          </button>
          <button
            className={`nav-item ${activeSection === "events" ? "active" : ""}`}
            onClick={() => setActiveSection("events")}
          >
            Events
          </button>
          <button
            className={`nav-item ${activeSection === "sponsors" ? "active" : ""}`}
            onClick={() => setActiveSection("sponsors")}
          >
            Sponsors
          </button>
          <button
            className={`nav-item ${activeSection === "registrations" ? "active" : ""}`}
            onClick={() => setActiveSection("registrations")}
          >
            Registrations
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        {activeSection === "dashboard" && (
          <section className="section">
            <h1>Dashboard</h1>
            <p>
              Welcome to the AI Summit admin panel. Use the navigation on the
              left to manage content.
            </p>
          </section>
        )}

        {activeSection === "banner" && (
          <section className="section">
            <h1>Manage Banner</h1>
            <p>Banner management feature coming soon...</p>
          </section>
        )}

        {activeSection === "speakers" && (
          <section className="section">
            <h1>Manage Speakers</h1>
            <p>Speakers management feature coming soon...</p>
          </section>
        )}

        {activeSection === "events" && (
          <section className="section">
            <h1>Manage Events</h1>
            <p>Events management feature coming soon...</p>
          </section>
        )}

        {activeSection === "sponsors" && (
          <section className="section">
            <h1>Manage Sponsors</h1>
            <p>Sponsors management feature coming soon...</p>
          </section>
        )}

        {activeSection === "registrations" && (
          <section className="section">
            <h1>Manage Registrations</h1>
            <p>Registrations management feature coming soon...</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin;
