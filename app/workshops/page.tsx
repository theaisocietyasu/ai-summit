"use client";

import CardNav from "@/components/ui/navigation/CardNav";
import { navItems } from "@/lib/navItems";
import styles from "@/app/subpage.module.css";
import comingSoonStyles from "@/app/comingSoon.module.css";

export default function WorkshopsPage() {
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
          <div className={comingSoonStyles.icon}>🛠️</div>
          <h1 className={comingSoonStyles.title}>
            <span className={comingSoonStyles.titleGradient}>Workshops</span>
          </h1>
          <p className={comingSoonStyles.subtitle}>
            Hands-on learning experiences with cutting-edge AI tools and
            technologies. Check back soon for workshop announcements!
          </p>
          <a href="/events" className={comingSoonStyles.backLink}>
            Browse All Events →
          </a>
        </div>
      </section>
    </main>
  );
}
