"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import AdminLayout from "@/components/Admin/AdminLayout";
import BannerSection from "@/components/Admin/BannerSection";
import AdminSpeakersSection from "@/components/Admin/AdminSpeakersSection";
import AdminEventsSection from "@/components/Admin/AdminEventsSection";
import AdminSponsorsSection from "@/components/Admin/AdminSponsorsSection";
import RegistrationsSection from "@/components/Admin/RegistrationsSection";

export default function AdminPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "banner" | "speakers" | "events" | "sponsors" | "registrations"
  >("banner");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    const authString = localStorage.getItem("adminAuth");
    if (!authString) {
      router.push("/login");
    } else {
      setAuthHeaders({
        Authorization: `Basic ${authString}`,
      });
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/login");
  };

  if (!isAuthenticated) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {activeSection === "banner" && (
        <BannerSection authHeaders={authHeaders} />
      )}
      {activeSection === "speakers" && (
        <AdminSpeakersSection authHeaders={authHeaders} />
      )}
      {activeSection === "events" && (
        <AdminEventsSection authHeaders={authHeaders} />
      )}
      {activeSection === "sponsors" && (
        <AdminSponsorsSection authHeaders={authHeaders} />
      )}
      {activeSection === "registrations" && (
        <RegistrationsSection authHeaders={authHeaders} />
      )}
    </AdminLayout>
  );
}
