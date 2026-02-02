import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/mongo";
import { SPONSOR_TIER_ORDER, type SponsorTier } from "@/lib/server/constants";

export const runtime = "nodejs";

function getSponsorTierOrderValue(tier: unknown): number {
  if (typeof tier === "string" && tier in SPONSOR_TIER_ORDER) {
    return SPONSOR_TIER_ORDER[tier as SponsorTier];
  }
  return Number.MAX_SAFE_INTEGER;
}

export async function GET(): Promise<NextResponse> {
  const db = await getDb();
  const sponsors = await db.collection("sponsors").find({}).toArray();

  sponsors.sort(
    (a, b) =>
      getSponsorTierOrderValue((a as any).sponsor_tier) -
      getSponsorTierOrderValue((b as any).sponsor_tier),
  );

  return NextResponse.json({ sponsors });
}
