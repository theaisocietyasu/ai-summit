import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { QuickRegistrationSchema } from "@/lib/server/validation";
import { generateQRCodeDataURI } from "@/lib/server/qrcode";
import { sendApprovalEmail } from "@/lib/server/email";

export const runtime = "nodejs";

function isPdf(file: File): boolean {
  return file.type === "application/pdf";
}

export async function POST(request: Request): Promise<NextResponse> {
  let uploadedFileId: ObjectId | null = null;

  try {
    const form = await request.formData();

    const body: Record<string, unknown> = {
      first_name: form.get("first_name"),
      middle_name: form.get("middle_name") || undefined,
      last_name: form.get("last_name"),
      email: form.get("email"),
      academic_year: form.get("academic_year"),
      major: form.get("major"),
    };

    const parsed = QuickRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!errors[key]) errors[key] = issue.message;
      }
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 },
      );
    }

    const validated = parsed.data;
    const normalizedEmail = validated.email.toLowerCase();

    const db = await getDb();
    const existingRegistration = await db.collection("registrations").findOne({
      email: normalizedEmail,
    });
    if (existingRegistration) {
      return NextResponse.json(
        {
          error: "Email already registered",
          errors: { email: "This email has already been used for a registration" },
        },
        { status: 409 },
      );
    }

    const resume = form.get("resume");
    const resumeFile = resume instanceof File && resume.size > 0 ? resume : null;

    if (resumeFile) {
      if (!isPdf(resumeFile)) {
        return NextResponse.json(
          { error: "Resume must be a PDF file", errors: { resume: "Resume must be a PDF file" } },
          { status: 400 },
        );
      }

      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Resume must be less than 5MB", errors: { resume: "Resume must be less than 5MB" } },
          { status: 400 },
        );
      }

      const arrayBuffer = await resumeFile.arrayBuffer();
      uploadedFileId = await uploadToGridFS({
        buffer: Buffer.from(arrayBuffer),
        filename: `resume_${Date.now()}_${resumeFile.name}`,
        contentType: resumeFile.type || "application/pdf",
        metadata: { purpose: "resume" },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const qrToken = crypto.randomUUID();

    const registrationDoc = {
      ...validated,
      email: normalizedEmail,
      photo_release: true,
      resume: uploadedFileId ? uploadedFileId.toHexString() : undefined,
      is_waitlisted: false,
      is_approved: true,
      is_rejected: false,
      qr_token: qrToken,
      checked_in: false,
      checked_in_at: null,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("registrations").insertOne(registrationDoc);

    const requestOrigin = new URL(request.url).origin;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestOrigin);
    const qrUrl = `${siteUrl}/admin/checkin?token=${qrToken}`;
    console.log("[quick-register] Starting email flow for:", normalizedEmail);
    generateQRCodeDataURI(qrUrl)
      .then((qrDataUri) =>
        sendApprovalEmail(
          {
            first_name: validated.first_name,
            last_name: validated.last_name,
            email: normalizedEmail,
            academic_year: validated.academic_year,
          },
          qrDataUri,
        ),
      )
      .then(() => console.log("[quick-register] sendApprovalEmail resolved successfully"))
      .catch((err) => console.error("[quick-register] Email/QR error:", err));

    return NextResponse.json(
      { message: "Registration submitted successfully", id: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteFromGridFS(uploadedFileId);
      } catch {
        // best-effort cleanup
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
