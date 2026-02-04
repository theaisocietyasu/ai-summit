"use client";

import { cn } from "@/lib/utils";

interface GradientOrbsProps {
  className?: string;
}

export function GradientOrbs({ className }: GradientOrbsProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Top-left orb */}
      <div
        className="absolute -left-40 -top-40 h-80 w-80 animate-float rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #4d2386 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      {/* Top-right orb */}
      <div
        className="absolute -right-20 top-1/4 h-96 w-96 animate-float rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #2d2976 0%, transparent 70%)",
          animationDelay: "-2s",
        }}
      />
      {/* Bottom-left orb */}
      <div
        className="absolute -left-20 bottom-1/4 h-72 w-72 animate-float rounded-full opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(circle, #6a1740 0%, transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      {/* Center orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-float rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #342b8a 0%, transparent 70%)",
          animationDelay: "-3s",
        }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute -bottom-20 -right-40 h-80 w-80 animate-float rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #1c0758 0%, transparent 70%)",
          animationDelay: "-1s",
        }}
      />
    </div>
  );
}
