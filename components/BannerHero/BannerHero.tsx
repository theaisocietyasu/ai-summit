"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/effects";
import { GlowButton } from "@/components/ui/effects";
import { getHome } from "@/app/lib/api";

interface Banner {
  banner_title: string;
  banner_description: string;
  banner_url: string;
}

export default function BannerHero() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response: any = await getHome();
        if (response.success && response.data?.banner) {
          setBanner(response.data.banner);
        }
      } catch (error) {
        console.error("Failed to load banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const title = banner?.banner_title || "AI Summit 2026";
  const description =
    banner?.banner_description ||
    "Join us for an exciting exploration of artificial intelligence, machine learning, and the future of technology.";

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-24">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-space-magenta-light/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-space-purple-light/10 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-purple-light border-t-transparent" />
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-space-purple-mid/50 bg-space-purple-dark/30 px-5 py-2.5 text-sm text-zinc-300 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-space-magenta-light opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-space-magenta-light" />
              </span>
              The AI Society at ASU presents
            </motion.div>

            {/* Title with generate effect */}
            <TextGenerateEffect
              words={title}
              className="mb-8 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl"
            >
              {description}
            </motion.p>

            {/* Date badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-12 inline-flex items-center gap-3 rounded-2xl border border-space-purple-mid/30 bg-space-purple-dark/20 px-8 py-4 backdrop-blur-sm"
            >
              <span className="text-space-magenta-light">📅</span>
              <span className="text-zinc-200">Spring 2026 • Arizona State University</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center"
            >
              <Link href="/register">
                <GlowButton variant="primary" className="min-w-[200px]">
                  Register Now
                </GlowButton>
              </Link>
              <Link href="#speakers">
                <GlowButton variant="outline" className="min-w-[200px]">
                  Meet the Speakers
                </GlowButton>
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-zinc-500">Scroll to explore</span>
          <div className="h-10 w-6 rounded-full border-2 border-space-purple-mid/50 p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-space-magenta-light"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
