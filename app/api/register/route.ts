import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { RegistrationSchema } from "@/lib/server/validation";

export const runtime = "nodejs";

function parseCommaList(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return items.length > 0 ? items : undefined;
}

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
      major: form.get("major") || undefined,
      why_attend: form.get("why_attend") || undefined,
      relevant_courses: parseCommaList(form.get("relevant_courses") as string | null),
      prior_work_exp: form.get("prior_work_exp") || undefined,
      photo_release: (form.get("photo_release") as string | null) === "true",
    };

    const parsed = RegistrationSchema.safeParse(body);
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

    let validated = parsed.data;
    const isStaff = validated.academic_year === "Staff";

    // Check for duplicate email (case-insensitive)
    const db = await getDb();
    const existingRegistration = await db.collection("registrations").findOne({
      email: { $regex: new RegExp(`^${validated.email}$`, "i") },
    });
    validated.email = validated.email.toLowerCase(); // Normalize email to lowercase before checking/storing
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
    const resumeFile = resume instanceof File ? resume : null;

    if (!isStaff && !resumeFile) {
      return NextResponse.json(
        {
          error: "Resume is required",
          errors: { resume: "Resume is required for non-staff registrations" },
        },
        { status: 400 },
      );
    }

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

    const registrationDoc = {
      ...validated,
      resume: uploadedFileId ? uploadedFileId.toHexString() : undefined,
      is_waitlisted: false,
      is_approved: false,
      is_rejected: false,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("registrations").insertOne(registrationDoc);

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
