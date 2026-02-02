import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { SpeakerSchema } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const form = await request.formData();

    const first_name = (form.get("first_name") ?? form.get("firstName")) as
      | string
      | null;
    const middle_name = (form.get("middle_name") ?? form.get("middleName")) as
      | string
      | null;
    const last_name = (form.get("last_name") ?? form.get("lastName")) as
      | string
      | null;
    const bio = (form.get("bio") ?? "") as string;

    const file = (form.get("headshot") ??
      form.get("headshot_img") ??
      form.get("speakerImage")) as File | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Speaker image is required" },
        { status: 400 },
      );
    }

    uploadedFileId = await uploadToGridFS({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: `headshot_${Date.now()}_${file.name}`,
      contentType: file.type || "application/octet-stream",
      metadata: { purpose: "image" },
    });

    const headshot_img_url = `/api/files/${uploadedFileId.toHexString()}`;

    const parsed = SpeakerSchema.safeParse({
      first_name,
      middle_name: middle_name ? middle_name : null,
      last_name: last_name ? last_name : null,
      bio,
      headshot_img_url,
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
    const result = await db.collection("speakers").insertOne(parsed.data);

    return NextResponse.json(
      {
        message: "Speaker created successfully",
        id: result.insertedId,
        speaker: { ...parsed.data, _id: result.insertedId },
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
