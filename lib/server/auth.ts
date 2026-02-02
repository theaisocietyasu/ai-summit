import { getCookie } from "@/lib/server/cookies";
import {
  getAllowedLoginRoleIds,
  getGuildMemberRoles,
} from "@/lib/server/discord";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "@/lib/server/session";

export type AdminCheckResult =
  | { ok: true; user: AdminSessionPayload }
  | { ok: false; status: number; error: string };

export async function requireAdmin(request: Request): Promise<AdminCheckResult> {
  const token = getCookie(request, ADMIN_SESSION_COOKIE_NAME);
  if (!token) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return { ok: false, status: 401, error: "Invalid session" };
  }

  const allowedRoleIds = new Set(getAllowedLoginRoleIds());
  if (allowedRoleIds.size === 0) {
    return {
      ok: false,
      status: 500,
      error: "Server misconfigured: ALLOWED_LOGIN_ROLE_IDS is not set",
    };
  }

  const memberRoles = await getGuildMemberRoles(session.discordId);
  if (!memberRoles.ok) {
    // 404 means not in guild; 401/403 means bot misconfigured; 429 rate limit; others are transient
    const status = memberRoles.status === 404 ? 403 : 503;
    return { ok: false, status, error: "Unable to verify Discord roles" };
  }

  const isAllowed = memberRoles.roles.some((roleId) => allowedRoleIds.has(roleId));
  if (!isAllowed) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, user: session };
}
