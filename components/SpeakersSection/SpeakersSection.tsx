"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CardContainer, CardBody, CardItem } from "@/components/ui/cards";
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

  const getFullName = (speaker: Speaker) => {
    let name = speaker.first_name;
    if (speaker.middle_name) name += ` ${speaker.middle_name}`;
    if (speaker.last_name) name += ` ${speaker.last_name}`;
    return name;
  };

  return (
    <section id="speakers" className="relative py-32 px-6">
      {/* Section background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-space-purple-dark/20 blur-[120px]" />

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
            Featured{" "}
            <span className="bg-gradient-to-r from-space-purple-light via-space-magenta-light to-space-magenta-mid bg-clip-text text-transparent">
              Speakers
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
            Learn from industry leaders and AI pioneers at the forefront of innovation
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-space-purple-light border-t-transparent" />
            <p className="text-zinc-400">Loading speakers...</p>
          </div>
        ) : speakers.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((speaker, index) => (
              <motion.div
                key={speaker._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CardContainer containerClassName="py-0">
                  <CardBody className="group relative h-full w-full bg-space-black/50 border border-space-purple-mid/30 hover:border-space-purple-light/50 transition-colors">
                    {/* Image with glow ring */}
                    <CardItem translateZ={50} className="mx-auto">
                      <div className="relative mx-auto mb-6 h-32 w-32">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-space-purple-light to-space-magenta-mid opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50" />
                        <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-space-purple-mid/50 group-hover:border-space-purple-light transition-colors">
                          <img
                            src={speaker.headshot_img_url}
                            alt={getFullName(speaker)}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      </div>
                    </CardItem>

                    {/* Name */}
                    <CardItem translateZ={30} className="w-full text-center">
                      <h3 className="mb-2 text-xl font-semibold text-white">
                        {getFullName(speaker)}
                      </h3>
                    </CardItem>

                    {/* Bio */}
                    <CardItem translateZ={20} className="w-full text-center">
                      <p className="line-clamp-3 text-sm text-zinc-400">
                        {speaker.bio}
                      </p>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass mx-auto max-w-lg rounded-3xl px-12 py-20 text-center"
          >
            <div className="mb-8 text-6xl">🎤</div>
            <h3 className="mb-6 text-2xl font-semibold text-white">
              No speakers announced yet
            </h3>
            <p className="text-lg leading-relaxed text-zinc-400">
              Check back soon for speaker announcements!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
