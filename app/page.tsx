"use client";

import styles from "./home.module.css";
import Navigation from "@/components/Navigation/Navigation";
import BannerHero from "@/components/BannerHero/BannerHero";
import SpeakersSection from "@/components/SpeakersSection/SpeakersSection";
import EventsSection from "@/components/EventsSection/EventsSection";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.container}>
        <BannerHero />
        <SpeakersSection />
        <EventsSection />
        <SponsorsSection />
      </div>
    </main>
  );
}
