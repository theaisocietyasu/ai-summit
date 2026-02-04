"use client";

import { cn } from "@/lib/utils";

interface GlowButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
}

export function GlowButton({
  children,
  className,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
}: GlowButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-space-purple-light via-space-magenta-light to-space-magenta-mid text-white",
    secondary: "bg-space-purple-dark/50 text-white border border-space-purple-mid",
    outline: "bg-transparent text-white border-2 border-space-purple-light",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden rounded-full px-8 py-3 text-base font-semibold transition-all duration-300",
        "hover:scale-105 hover:shadow-[0_0_30px_rgba(77,35,134,0.5)]",
        "active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none",
        variants[variant],
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 ring-2 ring-space-magenta-light transition-opacity duration-300 group-hover:opacity-100" />

      <span className="relative z-10">{children}</span>
    </button>
  );
}
