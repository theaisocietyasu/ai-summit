"use client";

import CardNav from "@/components/ui/navigation/CardNav";
import SpeakersSection from "@/components/SpeakersSection/SpeakersSection";
import { navItems } from "@/lib/navItems";

export default function SpeakersPage() {
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

      <SpeakersSection />
    </main>
  );
}
