import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { EventSchema } from "@/lib/server/validation";
import { normalizeTags } from "@/lib/normalizeTag";

export const runtime = "nodejs";

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Admin UI posts JSON array string
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeTags(
          parsed
            .map((t) => String(t).trim())
            .filter((t) => t.length > 0)
            .slice(0, 100)
        );
      }
    } catch {
      // fall through
    }
  }

  return normalizeTags(
    trimmed
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const form = await request.formData();

    const event_title = (form.get("event_title") ?? form.get("title")) as string | null;
    const event_description = (form.get("event_description") ?? form.get("description")) as string | null;
    const tags = parseTags(form.get("tags"));

    const file = (form.get("thumbnail") ?? form.get("eventThumbnail")) as File | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Event thumbnail is required" },
        { status: 400 },
      );
    }

    uploadedFileId = await uploadToGridFS({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: `thumbnail_${Date.now()}_${file.name}`,
      contentType: file.type || "application/octet-stream",
      metadata: { purpose: "image" },
    });

    const thumbnail_url = `/api/files/${uploadedFileId.toHexString()}`;

    const parsed = EventSchema.safeParse({
      event_title,
      event_description,
      thumbnail_url,
      tags,
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
    const result = await db.collection("events").insertOne(parsed.data);

    return NextResponse.json(
      {
        message: "Event created successfully",
        id: result.insertedId,
        event: { ...parsed.data, _id: result.insertedId },
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
