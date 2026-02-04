import type { Metadata } from "next";
import "./globals.css";
import { FloatingLines } from "@/components/ui/backgrounds/FloatingLines";

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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <FloatingLines
          linesGradient={['#6a1740', '#4d2386', '#342b8a']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={5}
          lineDistance={5}
          interactive={true}
          parallax={true}
        >
          {children}
        </FloatingLines>
      </body>
    </html>
  );
}
