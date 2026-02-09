"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CardNav from "@/components/ui/navigation/CardNav";
import { GlassCard } from "@/components/ui/cards";
import { getEvents } from "@/app/lib/api";
import { groupEventsByCategory } from "@/lib/eventCategories";
import { normalizeTag } from "@/lib/normalizeTag";
import { navItems } from "@/lib/navItems";

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
    <div className="relative z-10 mx-auto max-w-7xl px-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20 pt-32 text-center"
      >
        <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
          All{" "}
          <span className="bg-gradient-to-r from-space-magenta-mid via-space-magenta-light to-space-purple-light bg-clip-text text-transparent">
            Events
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
          Discover sessions, workshops, networking opportunities, and more
        </p>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-magenta-light border-t-transparent" />
          <p className="text-zinc-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass mx-auto max-w-lg rounded-3xl px-12 py-20 text-center"
        >
          <div className="mb-8 text-6xl">{"\uD83D\uDCC5"}</div>
          <h3 className="mb-6 text-2xl font-semibold text-white">
            No events scheduled yet
          </h3>
          <p className="text-lg leading-relaxed text-zinc-400">
            Events will be announced soon!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-20 pb-20">
          {SECTION_ORDER.map((section) => {
            const sectionEvents = grouped[section.key] || [];
            if (sectionEvents.length === 0) return null;
            return (
              <section
                key={section.key}
                id={`category-${section.key}`}
                className="scroll-mt-32"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="mb-10 text-3xl font-bold text-white"
                >
                  <span className="mr-3">{section.icon}</span>
                  {section.title}
                  <span className="ml-3 text-lg font-normal text-zinc-500">
                    ({sectionEvents.length})
                  </span>
                </motion.h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {sectionEvents.map((event: Event, index: number) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <GlassCard className="h-full">
                        {/* Image */}
                        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                          <div className="absolute inset-0 z-10 bg-gradient-to-t from-space-black/80 via-transparent to-transparent" />
                          <img
                            src={event.thumbnail_url}
                            alt={event.event_title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {/* Title */}
                        <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-space-purple-light">
                          {event.event_title}
                        </h3>

                        {/* Description */}
                        <p className="mb-4 line-clamp-3 text-sm text-zinc-400">
                          {event.event_description}
                        </p>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center rounded-full border border-space-purple-mid/50 bg-space-purple-dark/30 px-3 py-1 text-xs font-medium text-space-purple-light"
                              >
                                {normalizeTag(tag)}
                              </span>
                            ))}
                          </div>
                        )}
                      </GlassCard>
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
    <main className="min-h-screen">
      {/* Background glows */}
      <div className="pointer-events-none fixed right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-space-magenta-dark/30 blur-[100px]" />
      <div className="pointer-events-none fixed left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-space-purple-mid/20 blur-[100px]" />

      <a href="/" className="fixed left-6 top-6 z-50">
        <img src="/logo.png" alt="AIS Logo" className="h-10 w-auto" />
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
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-magenta-light border-t-transparent" />
          </div>
        }
      >
        <EventsContent />
      </Suspense>
    </main>
  );
}
