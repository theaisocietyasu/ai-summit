export type SponsorTier = "platinum" | "gold" | "silver" | "bronze";

export const SPONSOR_TIER_ORDER: Record<SponsorTier, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};
