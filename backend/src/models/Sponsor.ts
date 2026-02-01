import { ObjectId } from 'mongodb';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface Sponsor {
  _id?: ObjectId;
  sponsor_name: string;
  sponsor_tier: SponsorTier;
  sponsor_logo: string;
}

export const SPONSOR_TIER_ORDER: Record<SponsorTier, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};
