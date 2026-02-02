"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import styles from "./EventsSection.module.css";
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
    <section className={styles.section}>
      <h2 className={styles.title}>Planned Events</h2>
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className={styles.card}>
              <img
                src={event.thumbnail_url}
                alt={event.event_title}
                className={styles.cardImage}
              />
              <h3>{event.event_title}</h3>
              <p>{event.event_description}</p>
              {event?.tags && event.tags.length > 0 && (
                <div className={styles.tags}>
                  {event.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>No events scheduled yet</h3>
            <p>Events will be announced soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
