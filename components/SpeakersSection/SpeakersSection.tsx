"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSpeakers } from "@/app/lib/api";
import styles from "./SpeakersSection.module.css";

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

  const getFullName = (speaker: Speaker) => {
    let name = speaker.first_name;
    if (speaker.middle_name) name += ` ${speaker.middle_name}`;
    if (speaker.last_name) name += ` ${speaker.last_name}`;
    return name;
  };

  return (
    <section id="speakers" className={styles.section}>
      {/* Section background glow */}
      <div className={styles.sectionGlow} />

      <div className={styles.container}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <h2 className={styles.title}>
            Featured{" "}
            <span className={styles.titleGradient}>Speakers</span>
          </h2>
          <p className={styles.subtitle}>
            Learn from industry leaders and AI pioneers at the forefront of innovation
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading speakers...</p>
          </div>
        ) : speakers.length > 0 ? (
          <div className={styles.grid}>
            {speakers.map((speaker, index) => (
              <motion.div
                key={speaker._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.card}>
                  {/* Image with glow ring */}
                  <div className={styles.imageContainer}>
                    <div className={styles.imageGlow} />
                    <div className={styles.imageWrapper}>
                      <img
                        src={speaker.headshot_img_url}
                        alt={getFullName(speaker)}
                        className={styles.speakerImage}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className={styles.speakerName}>
                    {getFullName(speaker)}
                  </h3>

                  {/* Bio */}
                  <p className={styles.speakerBio}>
                    {speaker.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎤</div>
              <h3 className={styles.emptyTitle}>
                No speakers announced yet
              </h3>
              <p className={styles.emptyText}>
                Check back soon for speaker announcements!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
