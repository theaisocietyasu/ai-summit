import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { SponsorSchema } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const form = await request.formData();

    const sponsor_name = (form.get("sponsor_name") ?? form.get("sponsorName")) as
      | string
      | null;
    const sponsor_tier = (form.get("sponsor_tier") ?? form.get("sponsorTier")) as
      | string
      | null;

    const file = (form.get("sponsor_logo") ?? form.get("sponsorLogo")) as
      | File
      | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Sponsor logo is required" },
        { status: 400 },
      );
    }

    uploadedFileId = await uploadToGridFS({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: `sponsor_${Date.now()}_${file.name}`,
      contentType: file.type || "application/octet-stream",
      metadata: { purpose: "image" },
    });

    const sponsor_logo = `/api/files/${uploadedFileId.toHexString()}`;

    const parsed = SponsorSchema.safeParse({
      sponsor_name,
      sponsor_tier,
      sponsor_logo,
    });

    if (!parsed.success) {
      await deleteFromGridFS(uploadedFileId);
      uploadedFileId = null;

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

    const db = await getDb();
    const result = await db.collection("sponsors").insertOne(parsed.data);

    return NextResponse.json(
      {
        message: "Sponsor created successfully",
        id: result.insertedId,
        sponsor: { ...parsed.data, _id: result.insertedId },
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteFromGridFS(uploadedFileId);
      } catch {
        // best-effort
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
