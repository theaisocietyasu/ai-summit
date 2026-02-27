import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as
    | { token?: string }
    | null;

  const token = body?.token?.trim();
  if (!token || !UUID_RE.test(token)) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }

  const db = await getDb();
  const reg = await db.collection("registrations").findOne(
    { qr_token: token },
    {
      projection: {
        first_name: 1,
        last_name: 1,
        email: 1,
        academic_year: 1,
        is_approved: 1,
        is_waitlisted: 1,
        is_rejected: 1,
        checked_in: 1,
        checked_in_at: 1,
      },
    },
  );

  if (!reg) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  if (!reg.is_approved) {
    const status = reg.is_waitlisted
      ? "Waitlisted"
      : reg.is_rejected
        ? "Rejected"
        : "Pending";
    return NextResponse.json(
      {
        error: "Not approved",
        status,
        attendee: {
          first_name: reg.first_name,
          last_name: reg.last_name,
          email: reg.email,
          academic_year: reg.academic_year,
        },
      },
      { status: 403 },
    );
  }

  if (reg.checked_in) {
    return NextResponse.json(
      {
        error: "Already checked in",
        checked_in_at: reg.checked_in_at,
        attendee: {
          first_name: reg.first_name,
          last_name: reg.last_name,
          email: reg.email,
          academic_year: reg.academic_year,
        },
      },
      { status: 409 },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db.collection("registrations").updateOne(
    { qr_token: token },
    { $set: { checked_in: true, checked_in_at: now, updated_at: now } },
  );

  return NextResponse.json({
    message: "Checked in",
    attendee: {
      first_name: reg.first_name,
      last_name: reg.last_name,
      email: reg.email,
      academic_year: reg.academic_year,
    },
  });
}
