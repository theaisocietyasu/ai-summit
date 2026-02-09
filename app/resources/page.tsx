"use client";

import CardNav from "@/components/ui/navigation/CardNav";
import { navItems } from "@/lib/navItems";
import styles from "@/app/subpage.module.css";
import comingSoonStyles from "@/app/comingSoon.module.css";

export default function ResourcesPage() {
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

      <section className={comingSoonStyles.section}>
        <div className={comingSoonStyles.container}>
          <div className={comingSoonStyles.icon}>📚</div>
          <h1 className={comingSoonStyles.title}>
            <span className={comingSoonStyles.titleGradient}>Resources</span>
          </h1>
          <p className={comingSoonStyles.subtitle}>
            Access materials, recordings, and tools to continue your AI journey.
            Check back soon for resource announcements!
          </p>
          <a href="/events" className={comingSoonStyles.backLink}>
            Browse All Events →
          </a>
        </div>
      </section>
    </main>
  );
}
