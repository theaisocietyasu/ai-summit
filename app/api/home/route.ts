import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const db = await getDb();
  const banner = await db
    .collection("banners")
    .findOne({}, { sort: { _id: -1 } });

  return NextResponse.json({ banner });
}
