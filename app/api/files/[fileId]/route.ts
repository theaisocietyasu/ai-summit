import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getFileFromGridFS } from "@/lib/server/gridfs";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> },
): Promise<Response> {
  const { fileId } = await context.params;

  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
  }

  const file = await getFileFromGridFS(new ObjectId(fileId));
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const purpose = file.metadata?.purpose as string | undefined;
  if (purpose === "resume") {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }
  }

  return new Response(file.stream, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      ...(purpose === "resume" ? { "Cache-Control": "private, no-store" } : {}),
    },
  });
}
