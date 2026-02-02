"use client";

import { cn } from "@/lib/utils";
import { Stars } from "./Stars";
import { Meteors } from "./Meteors";
import { GradientOrbs } from "./GradientOrbs";

interface SpaceBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showStars?: boolean;
  showMeteors?: boolean;
  showOrbs?: boolean;
  starCount?: number;
  meteorCount?: number;
}

export function SpaceBackground({
  children,
  className,
  showStars = true,
  showMeteors = true,
  showOrbs = true,
  starCount = 150,
  meteorCount = 15,
}: SpaceBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", className)}>
      {/* Base gradient background - Layer 0 */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          background: "linear-gradient(135deg, #010003 0%, #1c0758 50%, #2b0c33 100%)",
        }}
      />

      {/* Gradient orbs - Layer 1 */}
      {showOrbs && <GradientOrbs className="fixed -z-40" />}

      {/* Stars - Layer 2 */}
      {showStars && <Stars className="fixed -z-30" quantity={starCount} speed={0.3} />}

      {/* Meteors - Layer 3 */}
      {showMeteors && <Meteors className="fixed -z-20" number={meteorCount} />}

      {/* Grid overlay - Layer 4 */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(77, 35, 134, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 35, 134, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content - Layer 5 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
