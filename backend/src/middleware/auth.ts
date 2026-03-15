import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { error } from '../utils/response';
import { AuthRequest } from '../types';

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    error(res, 'Access token required', 'AUTH_REQUIRED', 401);
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    error(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
  }
}

/** Optional auth — sets userId if token present, but doesn't block */
export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      req.userId = payload.userId;
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}
