import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ registrationId: string }> },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { registrationId } = await context.params;
  if (!ObjectId.isValid(registrationId)) {
    return NextResponse.json(
      { error: "Invalid registration ID" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const reg = await db.collection("registrations").findOne(
    { _id: new ObjectId(registrationId) },
    {
      projection: {
        is_approved: 1,
        is_waitlisted: 1,
        is_rejected: 1,
        checked_in: 1,
        checked_in_at: 1,
      },
    },
  );

  if (!reg) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }

  if (!reg.is_approved) {
    const status = reg.is_waitlisted
      ? "Waitlisted"
      : reg.is_rejected
        ? "Rejected"
        : "Pending";
    return NextResponse.json(
      { error: `Cannot check in: registration is ${status}` },
      { status: 403 },
    );
  }

  if (reg.checked_in) {
    return NextResponse.json(
      {
        error: "Already checked in",
        checked_in_at: reg.checked_in_at,
      },
      { status: 409 },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db.collection("registrations").updateOne(
    { _id: new ObjectId(registrationId) },
    { $set: { checked_in: true, checked_in_at: now, updated_at: now } },
  );

  return NextResponse.json({ message: "Checked in successfully" });
}
