"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

interface FloatingNavbarProps {
  navItems: NavItem[];
  className?: string;
}

export function FloatingNavbar({ navItems, className }: FloatingNavbarProps) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if at top
      setAtTop(currentScrollY < 10);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={cn(
          "fixed left-1/2 top-0 z-50 -translate-x-1/2 flex items-center justify-center gap-6 rounded-full px-8 py-4 mt-4 bg-[#010003]",
          className
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="group relative flex items-center gap-2 text-lg font-bold text-white transition-colors"
        >
          <span className="relative">
            AI Summit
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-space-purple-light to-space-magenta-mid transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-space-purple-mid/50" />

        {/* Nav Items */}
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.link}
            className={cn(
              "group relative flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            )}
          >
            {item.icon && <span className="text-space-magenta-light">{item.icon}</span>}
            <span className="relative">
              {item.name}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-space-purple-light to-space-magenta-mid transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        ))}

        {/* CTA Button */}
        <Link
          href="/register"
          className="relative overflow-hidden rounded-full bg-gradient-to-r from-space-purple-light to-space-magenta-mid px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-space-magenta-light/25"
        >
          <span className="relative z-10">Register</span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-space-magenta-mid to-space-purple-light opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </Link>
      </motion.nav>
    </AnimatePresence>
  );
}
