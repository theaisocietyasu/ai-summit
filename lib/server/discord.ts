interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  avatar?: string | null;
}

interface DiscordGuildMember {
  user: { id: string };
  roles: string[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

function parseCommaSeparatedEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getAllowedLoginRoleIds(): string[] {
  return parseCommaSeparatedEnv(process.env.ADMIN_ROLE_ID);
}

export function getDiscordRedirectUri(): string {
  return requireEnv("DISCORD_CALLBACK_URL");
}

export function getDiscordAuthUrl(state: string): string {
  const clientId = requireEnv("DISCORD_CLIENT_ID");
  const redirectUri = getDiscordRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<DiscordTokenResponse | null> {
  const clientId = requireEnv("DISCORD_CLIENT_ID");
  const clientSecret = requireEnv("DISCORD_CLIENT_SECRET");
  const redirectUri = getDiscordRedirectUri();

  const response = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) return null;
  return (await response.json()) as DiscordTokenResponse;
}

export async function getDiscordUser(
  accessToken: string,
): Promise<DiscordUser | null> {
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as DiscordUser;
}

export async function getGuildMemberRoles(discordUserId: string): Promise<{
  ok: true;
  roles: string[];
} | {
  ok: false;
  status: number;
}> {
  const botToken = requireEnv("DISCORD_BOT_TOKEN");
  const guildId = requireEnv("DISCORD_GUILD_ID");

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const member = (await response.json()) as DiscordGuildMember;
  return { ok: true, roles: member.roles };
}
