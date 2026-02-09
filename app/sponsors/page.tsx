"use client";

import { motion } from "framer-motion";
import CardNav from "@/components/ui/navigation/CardNav";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";
import { navItems } from "@/lib/navItems";

export default function SponsorsPage() {
  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  return (
    <main className="min-h-screen">
      {/* Background glows */}
      <div className="pointer-events-none fixed right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-space-magenta-dark/30 blur-[100px]" />
      <div className="pointer-events-none fixed left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-space-purple-mid/20 blur-[100px]" />

      <a href="/" className="fixed left-6 top-6 z-50">
        <img src="/logo.png" alt="AIS Logo" className="h-10 w-auto" />
      </a>

      <CardNav
        items={navItems}
        baseColor="#010003"
        menuColor="#fff"
        buttonBgColor="#6a1740"
        buttonTextColor="#fff"
        buttonLabel="Register"
        onButtonClick={handleRegisterClick}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 pt-32 text-center"
        >
          <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
            Our{" "}
            <span className="bg-gradient-to-r from-space-magenta-mid via-space-magenta-light to-space-purple-light bg-clip-text text-transparent">
              Sponsors
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
            Thank you to our incredible partners making this event possible
          </p>
        </motion.div>

        <SponsorsSection />
      </div>
    </main>
  );
}
