"use client";

import styles from "./home.module.css";
import CardNav from "@/components/ui/navigation/CardNav";
import MagicBento from "@/components/ui/cards/MagicBento";
import type { CardNavItem } from "@/components/ui/navigation/CardNav";
import type { BentoCardData } from "@/components/ui/cards/MagicBento";

const navItems: CardNavItem[] = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "The Event", href: "#about", ariaLabel: "About the event" },
      { label: "AI Society", href: "#society", ariaLabel: "About AI Society" }
    ]
  },
  {
    label: "Program",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Speakers", href: "#speakers", ariaLabel: "View speakers" },
      { label: "Schedule", href: "#schedule", ariaLabel: "View schedule" }
    ]
  },
  {
    label: "Connect",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Contact", href: "#contact", ariaLabel: "Contact us" },
      { label: "Sponsor", href: "#sponsor", ariaLabel: "Become a sponsor" }
    ]
  }
];

const bentoCards: BentoCardData[] = [
  {
    color: "#060010",
    title: "Featured Speakers",
    description: "Learn from industry leaders and AI pioneers at the forefront of innovation",
    label: "Coming Soon",
    icon: "🎤"
  },
  {
    color: "#060010",
    title: "Events & Sessions",
    description: "Engaging sessions, workshops, and networking opportunities",
    label: "Coming Soon",
    icon: "📅"
  },
  {
    color: "#060010",
    title: "Networking",
    description: "Connect with fellow AI enthusiasts, researchers, and industry professionals",
    label: "Coming Soon",
    icon: "🤝"
  },
  {
    color: "#060010",
    title: "Our Sponsors",
    description: "Thank you to our incredible partners making this event possible",
    label: "Coming Soon",
    icon: "💜"
  },
  {
    color: "#060010",
    title: "Workshops",
    description: "Hands-on learning experiences with cutting-edge AI tools and technologies",
    label: "Coming Soon",
    icon: "🛠️"
  },
  {
    color: "#060010",
    title: "Resources",
    description: "Access materials, recordings, and tools to continue your AI journey",
    label: "Coming Soon",
    icon: "📚"
  }
];

export default function Home() {
  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className={styles.main}>
      <CardNav
        items={navItems}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#6a1740"
        buttonTextColor="#fff"
        buttonLabel="Register"
        onButtonClick={handleRegisterClick}
      />

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Coming Soon
            </span>
            <h1 className={styles.title}>
              AI Summit <span className={styles.titleAccent}>2025</span>
            </h1>
            <p className={styles.subtitle}>
              Arizona State University&apos;s Premier AI Conference
            </p>
            <p className={styles.description}>
              Join us for an immersive experience exploring the frontiers of artificial intelligence,
              machine learning, and the future of technology.
            </p>
            <div className={styles.ctaButtons}>
              <a href="/register" className={styles.primaryButton}>
                Register Now
              </a>
              <a href="#about" className={styles.secondaryButton}>
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Content Section with MagicBento */}
        <section className={styles.contentSection} id="about">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              What to <span className={styles.titleAccent}>Expect</span>
            </h2>
            <p className={styles.sectionDescription}>
              Discover everything AI Summit has to offer
            </p>
          </div>
          <MagicBento
            cardData={bentoCards}
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={400}
            particleCount={12}
            glowColor="132, 0, 255"
          />
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© 2025 The AI Society at ASU. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
