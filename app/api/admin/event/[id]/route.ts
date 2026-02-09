import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { EventSchema } from "@/lib/server/validation";
import { normalizeTags } from "@/lib/normalizeTag";

export const runtime = "nodejs";

function extractGridFsId(url: string | undefined): ObjectId | null {
  if (!url) return null;
  const match = url.match(/\/api\/(?:files|file)\/([a-f0-9]{24})/i);
  if (!match) return null;
  return ObjectId.isValid(match[1]) ? new ObjectId(match[1]) : null;
}

function parseTags(raw: FormDataEntryValue | null, fallback: unknown): string[] {
  if (raw && typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizeTags(
            parsed.map((t) => String(t).trim()).filter((t) => t.length > 0)
          );
        }
      } catch {
        // ignore
      }
    }

    return normalizeTags(
      trimmed
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    );
  }

  return Array.isArray(fallback) ? normalizeTags(fallback as string[]) : [];
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
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const db = await getDb();
    const existing = await db.collection("events").findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const form = await request.formData();

    const event_title = (form.get("event_title") ?? form.get("title") ?? existing.event_title) as string;
    const event_description = (form.get("event_description") ?? form.get("description") ?? existing.event_description) as string;
    const tags = parseTags(form.get("tags"), existing.tags);

    const file = (form.get("thumbnail") ?? form.get("eventThumbnail")) as File | null;

    let thumbnail_url = existing.thumbnail_url as string;
    if (file instanceof File) {
      uploadedFileId = await uploadToGridFS({
        buffer: Buffer.from(await file.arrayBuffer()),
        filename: `thumbnail_${Date.now()}_${file.name}`,
        contentType: file.type || "application/octet-stream",
        metadata: { purpose: "image" },
      });
      thumbnail_url = `/api/files/${uploadedFileId.toHexString()}`;
    }

    const parsed = EventSchema.safeParse({
      event_title,
      event_description,
      thumbnail_url,
      tags,
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

    await db.collection("events").updateOne({ _id: new ObjectId(id) }, { $set: parsed.data });

    if (uploadedFileId) {
      const oldFileId = extractGridFsId(existing.thumbnail_url);
      if (oldFileId) {
        try {
          await deleteFromGridFS(oldFileId);
        } catch {
          // best-effort
        }
      }
    }

    return NextResponse.json({ message: "Event updated successfully", event: { ...parsed.data, _id: id } });
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
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("events").findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await db.collection("events").deleteOne({ _id: new ObjectId(id) });

  const fileId = extractGridFsId(existing.thumbnail_url);
  if (fileId) {
    try {
      await deleteFromGridFS(fileId);
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ message: "Event deleted successfully" });
}
