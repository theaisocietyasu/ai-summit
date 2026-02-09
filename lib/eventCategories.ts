export const EVENT_TAG_CATEGORIES = {
  networking: {
    tag: "networking",
    title: "Networking",
    description:
      "Connect with fellow AI enthusiasts, researchers, and industry professionals",
    icon: "\u{1F91D}",
    href: "/events?category=networking",
  },
  workshops: {
    tag: "workshops",
    title: "Workshops",
    description:
      "Hands-on learning experiences with cutting-edge AI tools and technologies",
    icon: "\u{1F6E0}\u{FE0F}",
    href: "/events?category=workshops",
  },
  resources: {
    tag: "resources",
    title: "Resources",
    description:
      "Access materials, recordings, and tools to continue your AI journey",
    icon: "\u{1F4DA}",
    href: "/events?category=resources",
  },
} as const;

export const KNOWN_CATEGORY_TAGS = Object.values(EVENT_TAG_CATEGORIES).map(
  (c) => c.tag,
);

export type EventCategoryKey = keyof typeof EVENT_TAG_CATEGORIES;

/**
 * Group events by category. Events not matching any known category
 * go into the 'events-sessions' bucket.
 */
export function groupEventsByCategory<T extends { tags: string[] }>(
  events: T[],
): Record<string, T[]> {
  const groups: Record<string, T[]> = {
    networking: [],
    workshops: [],
    resources: [],
    "events-sessions": [],
  };

  for (const event of events) {
    let matched = false;
    for (const [key, config] of Object.entries(EVENT_TAG_CATEGORIES)) {
      if (event.tags.includes(config.tag)) {
        groups[key].push(event);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups["events-sessions"].push(event);
    }
  }

  return groups;
}
