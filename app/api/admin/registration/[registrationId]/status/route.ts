import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

const STATUS_VALUES = new Set(["Pending", "Approved", "Waitlisted", "Rejected"]);

export async function PUT(
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

  const body = (await request.json().catch(() => null)) as
    | { status?: string }
    | null;

  const status = body?.status;
  if (!status || !STATUS_VALUES.has(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 },
    );
  }

  const flags =
    status === "Approved"
      ? { is_approved: true, is_waitlisted: false, is_rejected: false }
      : status === "Waitlisted"
        ? { is_approved: false, is_waitlisted: true, is_rejected: false }
        : status === "Rejected"
          ? { is_approved: false, is_waitlisted: false, is_rejected: true }
          : { is_approved: false, is_waitlisted: false, is_rejected: false };

  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);

  const result = await db.collection("registrations").updateOne(
    { _id: new ObjectId(registrationId) },
    {
      $set: {
        ...flags,
        updated_at: now,
      },
    },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Status updated" });
}
