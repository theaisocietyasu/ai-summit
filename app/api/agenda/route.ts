import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const filePath = path.join(process.cwd(), "public", "Event Agenda.pdf");
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Event Agenda.pdf"',
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
