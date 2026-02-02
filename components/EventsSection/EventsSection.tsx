"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/cards";
import { getEvents } from "@/app/lib/api";

interface Event {
  _id: string;
  event_title: string;
  event_description: string;
  thumbnail_url: string;
  tags: string[];
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="events" className="relative py-32 px-6">
      {/* Section background glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-space-magenta-dark/30 blur-[100px]" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-space-purple-mid/20 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
            Planned{" "}
            <span className="bg-gradient-to-r from-space-magenta-mid via-space-magenta-light to-space-purple-light bg-clip-text text-transparent">
              Events
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
            Engaging sessions, workshops, and networking opportunities
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-magenta-light border-t-transparent" />
            <p className="text-zinc-400">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-space-black/80 via-transparent to-transparent z-10" />
                    <img
                      src={event.thumbnail_url}
                      alt={event.event_title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-space-purple-light transition-colors">
                    {event.event_title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 line-clamp-3 text-sm text-zinc-400">
                    {event.event_description}
                  </p>

                  {/* Tags */}
                  {event?.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center rounded-full border border-space-purple-mid/50 bg-space-purple-dark/30 px-3 py-1 text-xs font-medium text-space-purple-light"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass mx-auto max-w-lg rounded-3xl px-12 py-20 text-center"
          >
            <div className="mb-8 text-6xl">📅</div>
            <h3 className="mb-6 text-2xl font-semibold text-white">
              No events scheduled yet
            </h3>
            <p className="text-lg leading-relaxed text-zinc-400">
              Events will be announced soon!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
