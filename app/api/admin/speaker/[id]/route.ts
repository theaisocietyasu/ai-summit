import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { SpeakerSchema } from "@/lib/server/validation";

export const runtime = "nodejs";

function extractGridFsId(url: string | undefined): ObjectId | null {
  if (!url) return null;
  const match = url.match(/\/api\/(?:files|file)\/([a-f0-9]{24})/i);
  if (!match) return null;
  return ObjectId.isValid(match[1]) ? new ObjectId(match[1]) : null;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid speaker ID" }, { status: 400 });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const db = await getDb();
    const existing = await db
      .collection("speakers")
      .findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    const form = await request.formData();

    const first_name = (form.get("first_name") ?? form.get("firstName") ?? existing.first_name) as string;
    const middle_name = (form.get("middle_name") ?? form.get("middleName") ?? existing.middle_name) as string | null;
    const last_name = (form.get("last_name") ?? form.get("lastName") ?? existing.last_name) as string | null;
    const bio = (form.get("bio") ?? existing.bio) as string;

    const file = (form.get("headshot") ??
      form.get("headshot_img") ??
      form.get("speakerImage")) as File | null;

    let headshot_img_url = existing.headshot_img_url as string;

    if (file instanceof File) {
      uploadedFileId = await uploadToGridFS({
        buffer: Buffer.from(await file.arrayBuffer()),
        filename: `headshot_${Date.now()}_${file.name}`,
        contentType: file.type || "application/octet-stream",
        metadata: { purpose: "image" },
      });
      headshot_img_url = `/api/files/${uploadedFileId.toHexString()}`;
    }

    const parsed = SpeakerSchema.safeParse({
      first_name,
      middle_name: middle_name ? middle_name : null,
      last_name: last_name ? last_name : null,
      bio,
      headshot_img_url,
    });

    if (!parsed.success) {
      if (uploadedFileId) {
        await deleteFromGridFS(uploadedFileId);
        uploadedFileId = null;
      }

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

    await db.collection("speakers").updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.data },
    );

    if (uploadedFileId) {
      const oldFileId = extractGridFsId(existing.headshot_img_url);
      if (oldFileId) {
        try {
          await deleteFromGridFS(oldFileId);
        } catch {
          // best-effort
        }
      }
    }

    return NextResponse.json({
      message: "Speaker updated successfully",
      speaker: { ...parsed.data, _id: id },
    });
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid speaker ID" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db
    .collection("speakers")
    .findOne({ _id: new ObjectId(id) });

  if (!existing) {
    return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
  }

  await db.collection("speakers").deleteOne({ _id: new ObjectId(id) });

  const fileId = extractGridFsId(existing.headshot_img_url);
  if (fileId) {
    try {
      await deleteFromGridFS(fileId);
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ message: "Speaker deleted successfully" });
}
