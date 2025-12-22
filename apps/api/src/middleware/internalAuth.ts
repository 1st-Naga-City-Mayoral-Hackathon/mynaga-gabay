/**
 * Internal Authentication Middleware
 *
 * Verifies requests from Next.js API routes using a shared internal key.
 * This approach keeps session verification in Next.js (where NextAuth runs)
 * while allowing Express to trust authenticated requests.
 *
 * Security model:
 * 1. Next.js verifies the user's session via NextAuth
 * 2. Next.js proxies the request to Express with:
 *    - X-Internal-Key: shared secret
 *    - X-User-Id: authenticated user's ID
 *    - X-User-Email: (optional) user's email for logging
 * 3. Express verifies the internal key and trusts the user info
 */

import { Request, Response, NextFunction } from 'express';

// In dev, default the internal key so routing/cards work out-of-the-box for demos.
// In production, this MUST be explicitly configured.
const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY ||
  (process.env.NODE_ENV === 'production' ? '' : 'dev-internal-key');

if (!INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('WARNING: INTERNAL_API_KEY is not set. Internal auth will fail.');
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Middleware that requires internal authentication with user info
 */
export function requireInternalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const internalKey = req.headers['x-internal-key'] as string;
  const userId = req.headers['x-user-id'] as string;

  // Verify internal key
  if (!internalKey || internalKey !== INTERNAL_API_KEY) {
    console.warn('[Auth] Invalid or missing internal key', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  // Require user ID
  if (!userId) {
    console.warn('[Auth] Missing user ID in internal request', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'User authentication required' },
    });
  }

  // Attach user info to request
  req.userId = userId;
  req.userEmail = req.headers['x-user-email'] as string | undefined;

  next();
}

/**
 * Middleware that only requires internal key (no user needed)
 * Used for server-to-server calls like routing
 */
export function requireInternalKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const internalKey = req.headers['x-internal-key'] as string;

  // Verify internal key
  if (!internalKey || internalKey !== INTERNAL_API_KEY) {
    console.warn('[Auth] Invalid or missing internal key for internal endpoint', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Internal access required' },
    });
  }

  next();
}

/**
 * Optional internal auth - attaches user if present but doesn't require it
 */
export function optionalInternalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const internalKey = req.headers['x-internal-key'] as string;
  const userId = req.headers['x-user-id'] as string;

  if (internalKey === INTERNAL_API_KEY && userId) {
    req.userId = userId;
    req.userEmail = req.headers['x-user-email'] as string | undefined;
  }

  next();
}
