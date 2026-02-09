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

      <div className="pt-24">
        <SpeakersSection />
      </div>
    </main>
  );
}
