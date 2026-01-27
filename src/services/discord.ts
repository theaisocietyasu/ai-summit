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

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse | null> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback';

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
  const redirectUri = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback';

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
