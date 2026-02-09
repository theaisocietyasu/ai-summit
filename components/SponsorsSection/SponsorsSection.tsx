"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSponsors } from "@/app/lib/api";
import styles from "./SponsorsSection.module.css";

interface Sponsor {
  _id: string;
  sponsor_name: string;
  sponsor_logo: string;
}

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response: any = await getSponsors();
        if (response.success && response.data?.sponsors) {
          setSponsors(response.data.sponsors);
        }
      } catch (error) {
        console.error("Failed to load sponsors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  return (
    <section id="sponsors" className={styles.section}>
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
            Our{" "}
            <span className={styles.titleGradient}>Sponsors</span>
          </h2>
          <p className={styles.subtitle}>
            Thank you to our incredible partners making this event possible
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading sponsors...</p>
          </div>
        ) : sponsors.length > 0 ? (
          <div className={styles.grid}>
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor._id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                viewport={{ once: true }}
              >
                <div className={styles.sponsorCard}>
                  {/* Glow effect on hover */}
                  <div className={styles.cardGlow} />

                  <div className={styles.logoWrapper}>
                    <img
                      src={sponsor.sponsor_logo}
                      alt={sponsor.sponsor_name}
                      className={styles.sponsorLogo}
                    />
                  </div>
                  <p className={styles.sponsorName}>{sponsor.sponsor_name}</p>
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
              <div className={styles.emptyIcon}>🤝</div>
              <h3 className={styles.emptyTitle}>
                Sponsors coming soon
              </h3>
              <p className={styles.emptyText}>
                Interested in sponsoring? Contact us!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
