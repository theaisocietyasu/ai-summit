"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSponsors } from "@/app/lib/api";
import { cn } from "@/lib/utils";

type SponsorTier = "platinum" | "gold" | "silver" | "bronze";

interface Sponsor {
  _id: string;
  sponsor_name: string;
  sponsor_tier: SponsorTier;
  sponsor_logo: string;
}

const TIER_ORDER: SponsorTier[] = ["platinum", "gold", "silver", "bronze"];
const TIER_CONFIG: Record<
  SponsorTier,
  { name: string; gradient: string; size: string }
> = {
  platinum: {
    name: "Platinum",
    gradient: "from-zinc-300 via-zinc-100 to-zinc-400",
    size: "h-24 w-48",
  },
  gold: {
    name: "Gold",
    gradient: "from-yellow-500 via-yellow-300 to-yellow-600",
    size: "h-20 w-40",
  },
  silver: {
    name: "Silver",
    gradient: "from-zinc-400 via-zinc-300 to-zinc-500",
    size: "h-16 w-32",
  },
  bronze: {
    name: "Bronze",
    gradient: "from-orange-700 via-orange-500 to-orange-800",
    size: "h-14 w-28",
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
    <section id="sponsors" className="relative py-32 px-6">
      {/* Section background glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-space-purple-dark/20 blur-[100px]" />

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
            Our{" "}
            <span className="bg-gradient-to-r from-space-purple-light to-space-magenta-mid bg-clip-text text-transparent">
              Sponsors
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
            Thank you to our incredible partners making this event possible
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-purple-light border-t-transparent" />
            <p className="text-zinc-400">Loading sponsors...</p>
          </div>
        ) : hasSponsors ? (
          <div className="space-y-16">
            {TIER_ORDER.map(
              (tier, tierIndex) =>
                sponsorsByTier[tier]?.length && (
                  <motion.div
                    key={tier}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: tierIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    {/* Tier header */}
                    <h3
                      className={cn(
                        "mb-8 inline-block bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent",
                        TIER_CONFIG[tier].gradient
                      )}
                    >
                      {TIER_CONFIG[tier].name} Sponsors
                    </h3>

                    {/* Sponsor logos */}
                    <div className="flex flex-wrap items-center justify-center gap-8">
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
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="group"
                        >
                          <div
                            className={cn(
                              "relative flex items-center justify-center rounded-xl p-4 transition-all duration-300",
                              "glass hover:border-space-purple-light/50",
                              TIER_CONFIG[tier].size
                            )}
                          >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-space-purple-light/0 via-space-magenta-light/20 to-space-purple-light/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                            <img
                              src={sponsor.sponsor_logo}
                              alt={sponsor.sponsor_name}
                              title={sponsor.sponsor_name}
                              className="relative z-10 max-h-full max-w-full object-contain brightness-90 transition-all duration-300 group-hover:brightness-110"
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
            className="glass mx-auto max-w-lg rounded-3xl px-12 py-20 text-center"
          >
            <div className="mb-8 text-6xl">🤝</div>
            <h3 className="mb-6 text-2xl font-semibold text-white">
              Sponsors coming soon
            </h3>
            <p className="text-lg leading-relaxed text-zinc-400">
              Interested in sponsoring? Contact us!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
