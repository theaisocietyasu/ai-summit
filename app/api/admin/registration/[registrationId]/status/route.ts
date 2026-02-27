import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { generateQRCodeDataURI } from "@/lib/server/qrcode";
import {
  sendReApprovalEmail,
  sendWaitlistedEmail,
  sendRejectedEmail,
} from "@/lib/server/email";

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

  // Fire-and-forget status change emails
  (async () => {
    try {
      if (status === "Pending") return; // no email for Pending

      const reg = await db.collection("registrations").findOne(
        { _id: new ObjectId(registrationId) },
        {
          projection: {
            first_name: 1,
            last_name: 1,
            email: 1,
            academic_year: 1,
            qr_token: 1,
          },
        },
      );
      if (!reg) return;

      const info = {
        first_name: reg.first_name as string,
        last_name: reg.last_name as string,
        email: reg.email as string,
        academic_year: reg.academic_year as string,
      };

      if (status === "Approved") {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
        const qrUrl = `${siteUrl}/admin/checkin?token=${reg.qr_token}`;
        const qrDataUri = await generateQRCodeDataURI(qrUrl);
        await sendReApprovalEmail(info, qrDataUri);
      } else if (status === "Waitlisted") {
        await sendWaitlistedEmail(info);
      } else if (status === "Rejected") {
        await sendRejectedEmail(info);
      }
    } catch (err) {
      console.error("[status] Email error:", err);
    }
  })();

  return NextResponse.json({ message: "Status updated" });
}
