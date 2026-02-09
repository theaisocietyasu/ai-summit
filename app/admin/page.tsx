"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminSpeakersSection from "@/components/Admin/AdminSpeakersSection";
import AdminEventsSection from "@/components/Admin/AdminEventsSection";
import AdminSponsorsSection from "@/components/Admin/AdminSponsorsSection";
import RegistrationsSection from "@/components/Admin/RegistrationsSection";

export default function AdminPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "speakers" | "events" | "sponsors" | "registrations"
  >("speakers");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { method: "GET" });
        if (!res.ok) {
          router.push("/login");
          return;
        }

        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        router.push("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.push("/login");
      }
    })();
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
      {activeSection === "speakers" && <AdminSpeakersSection />}
      {activeSection === "events" && <AdminEventsSection />}
      {activeSection === "sponsors" && <AdminSponsorsSection />}
      {activeSection === "registrations" && <RegistrationsSection />}
    </AdminLayout>
  );
}
