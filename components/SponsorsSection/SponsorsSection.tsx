"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSponsors } from "@/app/lib/api";
import styles from "./SponsorsSection.module.css";

type SponsorTier = "platinum" | "gold" | "silver" | "bronze";

interface Sponsor {
  _id: string;
  sponsor_name: string;
  sponsor_tier: SponsorTier;
  sponsor_logo: string;
}

const TIER_ORDER: SponsorTier[] = ["platinum", "gold", "silver", "bronze"];

const TIER_CONFIG: Record<SponsorTier, { name: string; gradientClass: string; sizeClass: string }> = {
  platinum: {
    name: "Platinum",
    gradientClass: "tierPlatinum",
    sizeClass: "sizePlatinum",
  },
  gold: {
    name: "Gold",
    gradientClass: "tierGold",
    sizeClass: "sizeGold",
  },
  silver: {
    name: "Silver",
    gradientClass: "tierSilver",
    sizeClass: "sizeSilver",
  },
  bronze: {
    name: "Bronze",
    gradientClass: "tierBronze",
    sizeClass: "sizeBronze",
  },
};

export default function SponsorsSection() {
  const [sponsorsByTier, setSponsorsByTier] = useState<
    Partial<Record<SponsorTier, Sponsor[]>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response: any = await getSponsors();
        if (response.success && response.data?.sponsors) {
          const grouped: Partial<Record<SponsorTier, Sponsor[]>> = {};
          response.data.sponsors.forEach((sponsor: Sponsor) => {
            if (!grouped[sponsor.sponsor_tier]) {
              grouped[sponsor.sponsor_tier] = [];
            }
            grouped[sponsor.sponsor_tier]!.push(sponsor);
          });
          setSponsorsByTier(grouped);
        }
      } catch (error) {
        console.error("Failed to load sponsors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  const hasSponsors = TIER_ORDER.some((tier) => sponsorsByTier[tier]?.length);

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
        ) : hasSponsors ? (
          <div className={styles.tiersContainer}>
            {TIER_ORDER.map(
              (tier, tierIndex) =>
                sponsorsByTier[tier]?.length && (
                  <motion.div
                    key={tier}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: tierIndex * 0.1 }}
                    viewport={{ once: true }}
                    className={styles.tierSection}
                  >
                    {/* Tier header */}
                    <h3
                      className={`${styles.tierTitle} ${styles[TIER_CONFIG[tier].gradientClass as keyof typeof styles]}`}
                    >
                      {TIER_CONFIG[tier].name} Sponsors
                    </h3>

                    {/* Sponsor logos */}
                    <div className={styles.logosGrid}>
                      {sponsorsByTier[tier]!.map((sponsor, index) => (
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
                          <div
                            className={`${styles.sponsorCard} ${styles[TIER_CONFIG[tier].sizeClass as keyof typeof styles]}`}
                          >
                            {/* Glow effect on hover */}
                            <div className={styles.cardGlow} />

                            <img
                              src={sponsor.sponsor_logo}
                              alt={sponsor.sponsor_name}
                              title={sponsor.sponsor_name}
                              className={styles.sponsorLogo}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )
            )}
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
