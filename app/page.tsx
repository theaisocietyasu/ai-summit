"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./home.module.css";
import CardNav from "@/components/ui/navigation/CardNav";
import MagicBento from "@/components/ui/cards/MagicBento";
import GradientText from "@/components/ui/effects/GradientText";
import BlurText from "@/components/ui/effects/BlurText";
import Countdown from "@/components/ui/effects/Countdown";
import { getEvents, getSpeakers, getSponsors } from "@/app/lib/api";
import { groupEventsByCategory, EVENT_TAG_CATEGORIES } from "@/lib/eventCategories";
import { navItems } from "@/lib/navItems";
import type { BentoCardData } from "@/components/ui/cards/MagicBento";

interface Event {
  _id: string;
  event_title: string;
  event_description: string;
  thumbnail_url: string;
  tags: string[];
}

interface Speaker {
  _id: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  bio: string;
  headshot_img_url: string;
}

interface Sponsor {
  _id: string;
  sponsor_name: string;
  sponsor_logo: string;
}

// Event date: February 27, 2026 at 5:00 PM
const eventDate = new Date('2026-02-27T17:00:00');

function buildCardLabel(count: number): string {
  if (count === 0) return "Coming Soon";
  return `${count} Event${count !== 1 ? "s" : ""}`;
}

function getRandomImage(items: any[], imageField: string): string | undefined {
  if (!items || items.length === 0) return undefined;
  const randomItem = items[Math.floor(Math.random() * items.length)];
  return randomItem[imageField];
}

function buildCardDescription(
  events: Event[],
  fallback: string,
): string {
  if (events.length === 0) return fallback;
  return events[0].event_title;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, speakersRes, sponsorsRes] = await Promise.all([
          getEvents(),
          getSpeakers(),
          getSponsors()
        ]);

        if (eventsRes.success && eventsRes.data) {
          const data = eventsRes.data as any;
          if (data.events) setEvents(data.events);
        }

        if (speakersRes.success && speakersRes.data) {
          const data = speakersRes.data as any;
          if (data.speakers) setSpeakers(data.speakers);
        }

        if (sponsorsRes.success && sponsorsRes.data) {
          const data = sponsorsRes.data as any;
          if (data.sponsors) setSponsors(data.sponsors);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, []);

  const grouped = useMemo(() => groupEventsByCategory(events), [events]);

  const bentoCards: BentoCardData[] = useMemo(() => [
    {
      color: "#060010",
      backgroundImage: getRandomImage(speakers, 'headshot_img_url'),
      title: "Featured Speakers",
      description: "Learn from industry leaders and AI pioneers at the forefront of innovation",
      label: "Speakers",
      icon: "\uD83C\uDFA4",
      href: "/speakers",
      hoverOverlay: "View All Speakers \u2192",
    },
    {
      color: "#060010",
      backgroundImage: getRandomImage(grouped["events-sessions"], 'thumbnail_url'),
      title: "Events & Sessions",
      description: buildCardDescription(
        grouped["events-sessions"],
        "Engaging sessions, workshops, and networking opportunities",
      ),
      label: buildCardLabel(grouped["events-sessions"].length),
      icon: "\uD83D\uDCC5",
      href: "/events",
      hoverOverlay: "Explore All Events \u2192",
    },
    {
      color: "#060010",
      backgroundImage: getRandomImage(grouped.networking, 'thumbnail_url'),
      title: EVENT_TAG_CATEGORIES.networking.title,
      description: buildCardDescription(
        grouped.networking,
        EVENT_TAG_CATEGORIES.networking.description,
      ),
      label: buildCardLabel(grouped.networking.length),
      icon: EVENT_TAG_CATEGORIES.networking.icon,
      href: EVENT_TAG_CATEGORIES.networking.href,
      hoverOverlay: "Explore Networking Events \u2192",
    },
    {
      color: "#060010",
      backgroundImage: getRandomImage(sponsors, 'sponsor_logo'),
      title: "Our Sponsors",
      description: "Thank you to our incredible partners making this event possible",
      label: "Sponsors",
      icon: "\uD83D\uDC9C",
      href: "/sponsors",
      hoverOverlay: "View All Sponsors \u2192",
    },
    {
      color: "#060010",
      backgroundImage: getRandomImage(grouped.workshops, 'thumbnail_url'),
      title: EVENT_TAG_CATEGORIES.workshops.title,
      description: buildCardDescription(
        grouped.workshops,
        EVENT_TAG_CATEGORIES.workshops.description,
      ),
      label: buildCardLabel(grouped.workshops.length),
      icon: EVENT_TAG_CATEGORIES.workshops.icon,
      href: EVENT_TAG_CATEGORIES.workshops.href,
      hoverOverlay: "Explore Workshops \u2192",
    },
    {
      color: "#060010",
      backgroundImage: getRandomImage(grouped.resources, 'thumbnail_url'),
      title: EVENT_TAG_CATEGORIES.resources.title,
      description: buildCardDescription(
        grouped.resources,
        EVENT_TAG_CATEGORIES.resources.description,
      ),
      label: buildCardLabel(grouped.resources.length),
      icon: EVENT_TAG_CATEGORIES.resources.icon,
      href: EVENT_TAG_CATEGORIES.resources.href,
      hoverOverlay: "Explore Resources \u2192",
    },
  ], [grouped, speakers, sponsors]);

  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className={styles.main}>
      {/* Logo - Top Left */}
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
                colors={['#4A42D6', '#564DE6', '#7B73F0', '#564DE6', '#4A42D6']}
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
          <p>&copy; 2026 The AI Society at ASU. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
