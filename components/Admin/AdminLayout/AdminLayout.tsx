"use client";

import Link from "next/link";
import styles from "./AdminLayout.module.css";

type Section = "banner" | "speakers" | "events" | "sponsors" | "registrations";

interface AdminLayoutProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeSection,
  onSectionChange,
  onLogout,
  children,
}: AdminLayoutProps) {
  return (
    <div className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            AI Summit
          </Link>
          <ul className={styles.navLinks}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/register">Register</Link>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className={styles.container}>
        <div className={styles.adminGrid}>
          <aside className={styles.adminSidebar}>
            <h3>Admin Panel</h3>
            <ul>
              <li>
                <button
                  className={`${styles.navLink} ${activeSection === "banner" ? styles.active : ""}`}
                  onClick={() => onSectionChange("banner")}
                >
                  Banner
                </button>
              </li>
              <li>
                <button
                  className={`${styles.navLink} ${activeSection === "speakers" ? styles.active : ""}`}
                  onClick={() => onSectionChange("speakers")}
                >
                  Speakers
                </button>
              </li>
              <li>
                <button
                  className={`${styles.navLink} ${activeSection === "events" ? styles.active : ""}`}
                  onClick={() => onSectionChange("events")}
                >
                  Events
                </button>
              </li>
              <li>
                <button
                  className={`${styles.navLink} ${activeSection === "sponsors" ? styles.active : ""}`}
                  onClick={() => onSectionChange("sponsors")}
                >
                  Sponsors
                </button>
              </li>
              <li>
                <button
                  className={`${styles.navLink} ${activeSection === "registrations" ? styles.active : ""}`}
                  onClick={() => onSectionChange("registrations")}
                >
                  Registrations
                </button>
              </li>
            </ul>
          </aside>

          <main className={styles.adminContent}>{children}</main>
        </div>
      </div>
    </div>
  );
}
