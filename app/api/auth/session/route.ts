import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const result = await requireAdmin(request);

  if (!result.ok) {
    return NextResponse.json(
      { authenticated: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      discordId: result.user.discordId,
      username: result.user.username,
    },
  });
}
