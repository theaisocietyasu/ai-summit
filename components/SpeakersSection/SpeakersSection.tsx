"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import styles from "./SpeakersSection.module.css";
import { getSpeakers } from "@/app/lib/api";

interface Speaker {
  _id: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  bio: string;
  headshot_img_url: string;
}

export default function SpeakersSection() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response: any = await getSpeakers();
        if (response.success && response.data?.speakers) {
          setSpeakers(response.data.speakers);
        }
      } catch (error) {
        console.error("Failed to load speakers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Featured Speakers</h2>
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading speakers...</p>
          </div>
        ) : speakers.length > 0 ? (
          speakers.map((speaker) => (
            <div
              key={speaker._id}
              className={`${styles.card} ${styles.speakerCard}`}
            >
              <img
                src={speaker.headshot_img_url}
                alt={`${speaker.first_name}`}
                className={styles.speakerImage}
              />
              <h3>
                {speaker.first_name}
                {speaker.middle_name && ` ${speaker.middle_name}`}
                {speaker.last_name && ` ${speaker.last_name}`}
              </h3>
              <p>{speaker.bio}</p>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>No speakers announced yet</h3>
            <p>Check back soon for speaker announcements!</p>
          </div>
        )}
      </div>
    </section>
  );
}
