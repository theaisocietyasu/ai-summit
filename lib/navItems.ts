import type { CardNavItem } from "@/components/ui/navigation/CardNav";

export const navItems: CardNavItem[] = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "The Event", href: "/#about", ariaLabel: "About the event" },
      {
        label: "AI Society",
        href: "https://www.ais-asu.com/",
        ariaLabel: "About AI Society",
      },
    ],
  },
  {
    label: "Program",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Speakers", href: "/speakers", ariaLabel: "View speakers" },
      { label: "Events", href: "/events", ariaLabel: "View events" },
    ],
  },
  {
    label: "Connect",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Sponsors", href: "/sponsors", ariaLabel: "View sponsors" },
      {
        label: "Register",
        href: "/register",
        ariaLabel: "Register for the event",
      },
    ],
  },
];
