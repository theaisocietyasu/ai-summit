import { NextResponse } from "next/server";
import { getDiscordAuthUrl } from "@/lib/server/discord";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "discord_oauth_state";

export async function GET(): Promise<NextResponse> {
  const state = crypto.randomUUID();
  const url = getDiscordAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
