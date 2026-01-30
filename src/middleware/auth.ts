import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt';

/**
 * Admin authentication middleware
 * Verifies JWT token from cookie or Authorization header
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  // Try to get token from multiple sources
  const authHeader = req.headers.authorization;
  const authHeaderToken =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;

  const token = req.cookies?.auth_token || authHeaderToken;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Attach user to request for downstream use
  req.user = payload;
  next();
}
