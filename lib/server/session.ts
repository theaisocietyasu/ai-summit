import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

export interface AdminSessionPayload {
  discordId: string;
  username: string;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set (or SESSION_SECRET as a fallback)",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(
  payload: AdminSessionPayload,
): Promise<string> {
  const secret = getSessionSecret();
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("ai-summit")
    .setAudience("admin")
    .sign(secret);
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: "ai-summit",
      audience: "admin",
    });

    if (typeof payload.discordId !== "string" || typeof payload.username !== "string") {
      return null;
    }

    return {
      discordId: payload.discordId,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
