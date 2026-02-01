export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  // Minimal cookie parsing (good enough for server-side auth cookie)
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rawVal] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawVal.join("="));
    }
  }

  return undefined;
}
