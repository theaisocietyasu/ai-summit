import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";
import { deleteFromGridFS, uploadToGridFS } from "@/lib/server/gridfs";
import { BannerSchema } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let uploadedFileId: ObjectId | null = null;

  try {
    const form = await request.formData();

    const bannerTitle = form.get("banner_title");
    const bannerDescription = form.get("banner_description");
    const bannerImage = form.get("banner_image");

    if (!(bannerImage instanceof File)) {
      return NextResponse.json(
        { error: "Banner image is required" },
        { status: 400 },
      );
    }

    const imageBuffer = Buffer.from(await bannerImage.arrayBuffer());
    uploadedFileId = await uploadToGridFS({
      buffer: imageBuffer,
      filename: `banner_${Date.now()}_${bannerImage.name}`,
      contentType: bannerImage.type || "application/octet-stream",
      metadata: { purpose: "image" },
    });

    const bannerUrl = `/api/files/${uploadedFileId.toHexString()}`;

    const parsed = BannerSchema.safeParse({
      banner_title: bannerTitle,
      banner_description: bannerDescription,
      banner_url: bannerUrl,
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
    const result = await db.collection("banners").insertOne(parsed.data);

    return NextResponse.json(
      {
        message: "Banner created successfully",
        id: result.insertedId,
        banner: { ...parsed.data, _id: result.insertedId },
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
