import { Router, Request, Response } from 'express';
import { createToken, verifyToken } from '../services/jwt';
import {
  getDiscordAuthUrl,
  exchangeCodeForToken,
  getDiscordUser,
  verifyDiscordAllowedLoginRole,
} from '../services/discord';

const router = Router();

/**
 * GET /api/auth/discord
 * Initiate Discord OAuth flow - redirects to Discord
 */
router.get('/discord', (_req: Request, res: Response) => {
  const authUrl = getDiscordAuthUrl();
  res.redirect(authUrl);
});

/**
 * GET /api/auth/discord/callback
 * Handle Discord OAuth callback
 */
router.get('/callback/discord', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  // Handle OAuth errors
  if (error || !code || typeof code !== 'string') {
    console.error('Discord OAuth error:', error || 'No code provided');
    return res.redirect('/login.html?error=oauth_failed');
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    if (!tokenData) {
      return res.redirect('/login.html?error=token_exchange_failed');
    }

    // Fetch user profile
    const discordUser = await getDiscordUser(tokenData.access_token);
    if (!discordUser) {
      return res.redirect('/login.html?error=user_fetch_failed');
    }

    // Verify user has an allowed role in Discord guild
    const isAllowed = await verifyDiscordAllowedLoginRole(discordUser.id);
    if (!isAllowed) {
      return res.redirect('/login.html?error=unauthorized');
    }

    // Create JWT token
    const token = createToken({
      discordId: discordUser.id,
      username: discordUser.username,
    });

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to admin with token in URL fragment for localStorage storage
    res.redirect(`/admin.html#token=${token}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect('/login.html?error=server_error');
  }
});

/**
 * POST /api/auth/logout
 * Clear authentication
 */
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : undefined;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  res.clearCookie('auth_token');
  res.json({ success: true });
});

/**
 * GET /api/auth/session
 * Check current session status
 */
router.get('/session', (req: Request, res: Response) => {
  const token =
    req.cookies?.auth_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      discordId: payload.discordId,
      username: payload.username,
    },
  });
});

export default router;
