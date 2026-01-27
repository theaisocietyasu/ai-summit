import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt';

/**
 * Admin authentication middleware
 * Verifies JWT token from cookie or Authorization header
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  // Try to get token from multiple sources
  const token =
    req.cookies?.auth_token ||
    req.headers.authorization?.replace('Bearer ', '');

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
