"use client";

import CardNav from "@/components/ui/navigation/CardNav";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";
import { navItems } from "@/lib/navItems";
import styles from "@/app/subpage.module.css";

export default function SponsorsPage() {
  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className={styles.main}>
      {/* Background glows */}
      <div className={styles.glowRight} />
      <div className={styles.glowLeft} />

      <a href="/" className={styles.logoContainer}>
        <img src="/logo.png" alt="AIS Logo" className={styles.logoImage} />
      </a>

      <CardNav
        items={navItems}
        baseColor="#010003"
        menuColor="#fff"
        buttonBgColor="#6a1740"
        buttonTextColor="#fff"
        buttonLabel="Register"
        onButtonClick={handleRegisterClick}
      />

      <SponsorsSection />
    </main>
  );
}
