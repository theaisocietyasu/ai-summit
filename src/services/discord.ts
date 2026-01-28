/**
 * Discord API integration for OAuth and role verification
 */

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

interface DiscordGuildMember {
  user: { id: string };
  roles: string[];
}

interface DiscordRole {
  id: string;
  name: string;
}

const DEFAULT_ALLOWED_LOGIN_ROLE_NAMES = [
  'Executive Team',
  'Software Team',
  'Technical Team',
  'Operations Team',
];

function parseCommaSeparatedEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function getAllowedLoginRoleNames(): string[] {
  const configured = parseCommaSeparatedEnv(process.env.ALLOWED_LOGIN_ROLES);
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_LOGIN_ROLE_NAMES;
}

function getAllowedLoginRoleIds(): string[] {
  return parseCommaSeparatedEnv(process.env.ALLOWED_LOGIN_ROLE_IDS);
}

let cachedGuildRoles:
  | {
      fetchedAt: number;
      roles: DiscordRole[];
    }
  | undefined;

async function getGuildRoles(): Promise<DiscordRole[] | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    console.error('Missing Discord bot token or guild id');
    return null;
  }

  const now = Date.now();
  const cacheTtlMs = 5 * 60 * 1000;
  if (cachedGuildRoles && now - cachedGuildRoles.fetchedAt < cacheTtlMs) {
    return cachedGuildRoles.roles;
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Discord API error (roles): ${response.status} ${response.statusText}`);
      return null;
    }

    const roles = (await response.json()) as DiscordRole[];
    cachedGuildRoles = { fetchedAt: now, roles };
    return roles;
  } catch (error) {
    console.error('Error fetching Discord guild roles:', error);
    return null;
  }
}

export async function verifyDiscordAllowedLoginRole(discordUserId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    console.error('Missing Discord configuration in environment variables');
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`User ${discordUserId} is not a member of the guild`);
        return false;
      }
      console.error(`Discord API error: ${response.status} ${response.statusText}`);
      return false;
    }

    const member = (await response.json()) as DiscordGuildMember;

    // Preferred: explicit role IDs via env
    const allowedIds = new Set(getAllowedLoginRoleIds());

    // Else: resolve role names to IDs
    if (allowedIds.size === 0) {
      const allowedNames = getAllowedLoginRoleNames().map((n) => n.toLowerCase());
      const roles = await getGuildRoles();
      if (!roles) return false;

      for (const role of roles) {
        if (allowedNames.includes(role.name.toLowerCase())) {
          allowedIds.add(role.id);
        }
      }
    }

    if (allowedIds.size === 0) {
      console.error('No allowed login roles resolved; check ALLOWED_LOGIN_ROLES/ALLOWED_LOGIN_ROLE_IDS');
      return false;
    }

    return member.roles.some((roleId) => allowedIds.has(roleId));
  } catch (error) {
    console.error('Error verifying Discord role:', error);
    return false;
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse | null> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri =
    process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/discord';

  if (!clientId || !clientSecret) {
    console.error('Missing Discord client credentials');
    return null;
  }

  try {
    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange code for token:', response.status);
      return null;
    }

    return (await response.json()) as DiscordTokenResponse;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
}

/**
 * Fetch Discord user profile using access token
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch Discord user:', response.status);
      return null;
    }

    return (await response.json()) as DiscordUser;
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
}

/**
 * Verify user has admin role in Discord guild using bot token
 */
export async function verifyDiscordAdminRole(discordUserId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const adminRoleId = process.env.ADMIN_ROLE_ID;

  if (!botToken || !guildId || !adminRoleId) {
    console.error('Missing Discord configuration in environment variables');
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`User ${discordUserId} is not a member of the guild`);
        return false;
      }
      console.error(`Discord API error: ${response.status} ${response.statusText}`);
      return false;
    }

    const member = (await response.json()) as DiscordGuildMember;
    const hasRole = member.roles.includes(adminRoleId);

    if (!hasRole) {
      console.log(`User ${discordUserId} does not have admin role ${adminRoleId}`);
    }

    return hasRole;
  } catch (error) {
    console.error('Error verifying Discord role:', error);
    return false;
  }
}

/**
 * Generate Discord OAuth2 authorization URL
 */
export function getDiscordAuthUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri =
    process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/discord';

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
