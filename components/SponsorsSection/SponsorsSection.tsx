"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import styles from "./SponsorsSection.module.css";
import { getSponsors } from "@/app/lib/api";

type SponsorTier = "platinum" | "gold" | "silver" | "bronze";

interface Sponsor {
  _id: string;
  sponsor_name: string;
  sponsor_tier: SponsorTier;
  sponsor_logo: string;
}

// interface SponsorsByTier {
//   [key in SponsorTier]?: Sponsor[];
// }

const TIER_ORDER: SponsorTier[] = ["platinum", "gold", "silver", "bronze"];
const TIER_NAMES: Record<SponsorTier, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export default function SponsorsSection() {
  const [sponsorsByTier, setSponsorsByTier] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response: any = await getSponsors();
        if (response.success && response.data?.sponsors) {
          const grouped: any = {};
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

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Our Sponsors</h2>
      <div className={styles.sponsorsContent}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading sponsors...</p>
          </div>
        ) : TIER_ORDER.some((tier) => sponsorsByTier[tier]?.length) ? (
          TIER_ORDER.map((tier) =>
            sponsorsByTier[tier]?.length ? (
              <div
                key={tier}
                className={`${styles.sponsorTier} ${styles[tier]}`}
              >
                <h3>{TIER_NAMES[tier]} Sponsors</h3>
                <div className={styles.sponsorLogos}>
                  {sponsorsByTier[tier]!.map((sponsor: any) => (
                    <div key={sponsor._id} className={styles.sponsorLogo}>
                      <img
                        src={sponsor.sponsor_logo}
                        alt={sponsor.sponsor_name}
                        title={sponsor.sponsor_name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )
        ) : (
          <div className={styles.emptyState}>
            <h3>Sponsors coming soon</h3>
            <p>Interested in sponsoring? Contact us!</p>
          </div>
        )}
      </div>
    </section>
  );
}
