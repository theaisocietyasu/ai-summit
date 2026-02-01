import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { SponsorSchema } from "@/lib/server/validation";

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
    return NextResponse.json({ error: "Invalid sponsor ID" }, { status: 400 });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const db = await getDb();
    const existing = await db.collection("sponsors").findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    const form = await request.formData();

    const sponsor_name = (form.get("sponsor_name") ?? form.get("sponsorName") ?? existing.sponsor_name) as string;
    const sponsor_tier = (form.get("sponsor_tier") ?? form.get("sponsorTier") ?? existing.sponsor_tier) as string;

    const file = (form.get("sponsor_logo") ?? form.get("sponsorLogo")) as File | null;
    let sponsor_logo = existing.sponsor_logo as string;

    if (file instanceof File) {
      uploadedFileId = await uploadToGridFS({
        buffer: Buffer.from(await file.arrayBuffer()),
        filename: `sponsor_${Date.now()}_${file.name}`,
        contentType: file.type || "application/octet-stream",
        metadata: { purpose: "image" },
      });
      sponsor_logo = `/api/files/${uploadedFileId.toHexString()}`;
    }

    const parsed = SponsorSchema.safeParse({
      sponsor_name,
      sponsor_tier,
      sponsor_logo,
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

    await db.collection("sponsors").updateOne({ _id: new ObjectId(id) }, { $set: parsed.data });

    if (uploadedFileId) {
      const oldFileId = extractGridFsId(existing.sponsor_logo);
      if (oldFileId) {
        try {
          await deleteFromGridFS(oldFileId);
        } catch {
          // best-effort
        }
      }
    }

    return NextResponse.json({ message: "Sponsor updated successfully", sponsor: { ...parsed.data, _id: id } });
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
    return NextResponse.json({ error: "Invalid sponsor ID" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("sponsors").findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  await db.collection("sponsors").deleteOne({ _id: new ObjectId(id) });

  const fileId = extractGridFsId(existing.sponsor_logo);
  if (fileId) {
    try {
      await deleteFromGridFS(fileId);
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ message: "Sponsor deleted successfully" });
}
