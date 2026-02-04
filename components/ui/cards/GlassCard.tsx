"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-6",
        "transition-all duration-300",
        hover && [
          "hover:border-space-purple-light/50",
          "hover:shadow-lg hover:shadow-space-purple-dark/30",
          "hover:-translate-y-1",
        ],
        className
      )}
    >
      {/* Gradient border effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-space-purple-light via-space-magenta-light to-space-purple-mid opacity-20" />
      </div>

      {/* Glow effect */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-space-purple-light/0 via-space-magenta-light/10 to-space-purple-light/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
