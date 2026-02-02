"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

// Pre-generated meteor positions (deterministic, no Math.random)
const METEOR_SEEDS = [
  { top: 15, left: 20, delay: 0.5, duration: 4.2 },
  { top: 45, left: 85, delay: 1.2, duration: 3.8 },
  { top: 8, left: 55, delay: 2.1, duration: 5.1 },
  { top: 72, left: 12, delay: 0.3, duration: 4.5 },
  { top: 28, left: 78, delay: 3.2, duration: 3.5 },
  { top: 91, left: 42, delay: 1.8, duration: 4.8 },
  { top: 33, left: 95, delay: 0.8, duration: 5.5 },
  { top: 67, left: 28, delay: 2.5, duration: 3.2 },
  { top: 5, left: 68, delay: 4.1, duration: 4.0 },
  { top: 82, left: 8, delay: 1.5, duration: 5.8 },
  { top: 19, left: 38, delay: 3.8, duration: 3.9 },
  { top: 55, left: 72, delay: 0.2, duration: 4.3 },
  { top: 41, left: 15, delay: 2.8, duration: 5.2 },
  { top: 88, left: 58, delay: 1.1, duration: 3.6 },
  { top: 12, left: 92, delay: 4.5, duration: 4.7 },
  { top: 63, left: 35, delay: 0.7, duration: 5.0 },
  { top: 25, left: 62, delay: 3.0, duration: 3.4 },
  { top: 78, left: 88, delay: 2.2, duration: 4.1 },
  { top: 48, left: 5, delay: 1.6, duration: 5.6 },
  { top: 95, left: 48, delay: 0.1, duration: 3.7 },
  { top: 35, left: 25, delay: 4.8, duration: 4.4 },
  { top: 58, left: 82, delay: 2.9, duration: 5.3 },
  { top: 7, left: 45, delay: 1.3, duration: 3.3 },
  { top: 85, left: 18, delay: 3.5, duration: 4.9 },
  { top: 22, left: 75, delay: 0.9, duration: 5.4 },
];

export function Meteors({ number = 20, className }: MeteorsProps) {
  const meteors = useMemo(() => {
    return METEOR_SEEDS.slice(0, Math.min(number, METEOR_SEEDS.length)).map(
      (seed, idx) => ({
        id: idx,
        ...seed,
      })
    );
  }, [number]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-space-purple-light shadow-[0_0_0_1px_#ffffff10]"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
          }}
        >
          <span
            className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2"
            style={{
              background: "linear-gradient(to right, #4d2386, transparent)",
            }}
          />
        </span>
      ))}
    </div>
  );
}
