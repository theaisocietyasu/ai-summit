"use client";

import { FloatingNavbar } from "@/components/ui/navigation";
import {
  IconHome,
  IconCalendarEvent,
  IconUsers,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <IconHome size={18} />,
  },
  {
    name: "Speakers",
    link: "#speakers",
    icon: <IconUsers size={18} />,
  },
  {
    name: "Events",
    link: "#events",
    icon: <IconCalendarEvent size={18} />,
  },
  {
    name: "Sponsors",
    link: "#sponsors",
    icon: <IconBuildingSkyscraper size={18} />,
  },
];

export default function Navigation() {
  return <FloatingNavbar navItems={navItems} />;
}
