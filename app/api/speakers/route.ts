import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const db = await getDb();
  const speakers = await db.collection("speakers").find({}).toArray();
  return NextResponse.json({ speakers });
}
