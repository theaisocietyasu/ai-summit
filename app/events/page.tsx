"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CardNav from "@/components/ui/navigation/CardNav";
import { getEvents } from "@/app/lib/api";
import { groupEventsByCategory } from "@/lib/eventCategories";
import { normalizeTag } from "@/lib/normalizeTag";
import { navItems } from "@/lib/navItems";
import pageStyles from "@/app/subpage.module.css";
import styles from "./events.module.css";

interface Event {
  _id: string;
  event_title: string;
  event_description: string;
  thumbnail_url: string;
  tags: string[];
}

const SECTION_ORDER = [
  { key: "networking", title: "Networking", icon: "\uD83E\uDD1D" },
  { key: "workshops", title: "Workshops", icon: "\uD83D\uDEE0\uFE0F" },
  { key: "resources", title: "Resources", icon: "\uD83D\uDCDA" },
  { key: "events-sessions", title: "Events & Sessions", icon: "\uD83D\uDCC5" },
];

function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response: any = await getEvents();
        if (response.success && response.data?.events) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeCategory && !loading) {
      const el = document.getElementById(`category-${activeCategory}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [activeCategory, loading]);

  const grouped = groupEventsByCategory(events);

  return (
    <div className={styles.contentContainer}>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.pageHeader}
      >
        <h1 className={styles.pageTitle}>
          All{" "}
          <span className={styles.pageTitleGradient}>Events</span>
        </h1>
        <p className={styles.pageSubtitle}>
          Discover sessions, workshops, networking opportunities, and more
        </p>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{"\uD83D\uDCC5"}</div>
            <h3 className={styles.emptyTitle}>
              No events scheduled yet
            </h3>
            <p className={styles.emptyText}>
              Events will be announced soon!
            </p>
          </div>
        </motion.div>
      ) : (
        <div className={styles.sectionsContainer}>
          {SECTION_ORDER.map((section) => {
            const sectionEvents = grouped[section.key] || [];
            if (sectionEvents.length === 0) return null;
            return (
              <section
                key={section.key}
                id={`category-${section.key}`}
                className={styles.categorySection}
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className={styles.sectionTitle}
                >
                  <span className={styles.sectionIcon}>{section.icon}</span>
                  {section.title}
                  <span className={styles.sectionCount}>
                    ({sectionEvents.length})
                  </span>
                </motion.h2>
                <div className={styles.eventGrid}>
                  {sectionEvents.map((event: Event, index: number) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={styles.eventCard}>
                        {/* Image */}
                        <div className={styles.imageContainer}>
                          <div className={styles.imageOverlay} />
                          <img
                            src={event.thumbnail_url}
                            alt={event.event_title}
                            className={styles.eventImage}
                          />
                        </div>

                        {/* Title */}
                        <h3 className={styles.eventTitle}>
                          {event.event_title}
                        </h3>

                        {/* Description */}
                        <p className={styles.eventDescription}>
                          {event.event_description}
                        </p>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className={styles.tagsContainer}>
                            {event.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={styles.tag}
                              >
                                {normalizeTag(tag)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className={pageStyles.main}>
      {/* Background glows */}
      <div className={pageStyles.glowRight} />
      <div className={pageStyles.glowLeft} />

      <a href="/" className={pageStyles.logoContainer}>
        <img src="/logo.png" alt="AIS Logo" className={pageStyles.logoImage} />
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

      <Suspense
        fallback={
          <div className={styles.suspenseFallback}>
            <div className={styles.spinner} />
          </div>
        }
      >
        <EventsContent />
      </Suspense>
    </main>
  );
}
