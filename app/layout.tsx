import type { Metadata } from "next";
import "./globals.css";
import { SpaceBackground } from "@/components/ui/backgrounds";

export const metadata: Metadata = {
  title: "AI Summit | The AI Society at ASU",
  description:
    "Join Arizona State University's premier AI conference. Explore artificial intelligence, machine learning, and the future of technology.",
  keywords: [
    "AI Summit",
    "ASU",
    "Arizona State University",
    "AI Conference",
    "Machine Learning",
    "Artificial Intelligence",
    "The AI Society",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SpaceBackground>{children}</SpaceBackground>
      </body>
    </html>
  );
}
