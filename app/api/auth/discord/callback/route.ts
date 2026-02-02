import { NextResponse } from "next/server";
import { exchangeCodeForToken, getDiscordUser } from "@/lib/server/discord";
import { getAllowedLoginRoleIds, getGuildMemberRoles } from "@/lib/server/discord";
import { getCookie } from "@/lib/server/cookies";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
} from "@/lib/server/session";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "discord_oauth_state";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");

  if (error || !code) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const expectedState = getCookie(request, OAUTH_STATE_COOKIE);

  if (!expectedState || !returnedState || expectedState !== returnedState) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "invalid_state");
    const resp = NextResponse.redirect(redirectUrl);
    resp.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return resp;
  }

  const tokenData = await exchangeCodeForToken(code);
  if (!tokenData) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const discordUser = await getDiscordUser(tokenData.access_token);
  if (!discordUser) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "user_fetch_failed");
    return NextResponse.redirect(redirectUrl);
  }

  // Optional early rejection (still enforced per-request on all protected routes)
  const allowedRoleIds = new Set(getAllowedLoginRoleIds());
  if (allowedRoleIds.size === 0) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "server_misconfigured");
    return NextResponse.redirect(redirectUrl);
  }

  const memberRoles = await getGuildMemberRoles(discordUser.id);
  if (!memberRoles.ok) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "role_check_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const isAllowed = memberRoles.roles.some((roleId) => allowedRoleIds.has(roleId));
  if (!isAllowed) {
    const redirectUrl = new URL("/login", url.origin);
    redirectUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  const sessionToken = await createAdminSessionToken({
    discordId: discordUser.id,
    username: discordUser.username,
  });

  const redirectToAdmin = new URL("/admin", url.origin);
  const response = NextResponse.redirect(redirectToAdmin);

  response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
