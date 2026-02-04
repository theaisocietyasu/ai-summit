"use client";

import styles from "./home.module.css";
import CardNav from "@/components/ui/navigation/CardNav";
import MagicBento from "@/components/ui/cards/MagicBento";
import GradientText from "@/components/ui/effects/GradientText";
import BlurText from "@/components/ui/effects/BlurText";
import Countdown from "@/components/ui/effects/Countdown";
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

// Event date: February 27, 2026 at 5:00 PM
const eventDate = new Date('2026-02-27T17:00:00');

export default function Home() {
  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className={styles.main}>
      {/* Logo - Top Left */}
      <a href="/" className={styles.logoContainer}>
        <img src="/logo.svg" alt="AIS Logo" className={styles.logoImage} />
      </a>

      <CardNav
        items={navItems}
        baseColor="transparent"
        menuColor="#fff"
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
              <BlurText
                text="AI Summit"
                delay={100}
                animateBy="words"
                direction="top"
                className={styles.titleBlur}
              />
              {' '}
              <span className={styles.title2026}>
                <BlurText
                  text="2026"
                  delay={150}
                  animateBy="characters"
                  direction="top"
                />
              </span>
            </h1>
            <p className={styles.subtitle}>
              Arizona State University&apos;s Premier AI Conference
            </p>

            {/* Event Date & Countdown */}
            <div className={styles.eventInfo}>
              <p className={styles.eventDate}>February 27, 2026 at 5:00 PM</p>
              <Countdown targetDate={eventDate} />
            </div>

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
              What to{' '}
              <GradientText
                colors={['#6a1740', '#a855f7', '#4d2386', '#ec4899', '#6a1740']}
                animationSpeed={5}
              >
                Expect
              </GradientText>
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
          <p>© 2026 The AI Society at ASU. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
