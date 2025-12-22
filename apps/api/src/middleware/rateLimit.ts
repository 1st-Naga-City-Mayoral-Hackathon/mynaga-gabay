/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for abuse prevention.
 * For production, consider using Redis-backed rate limiting.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (per process - consider Redis for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: Request) => string;
  message?: string;
}

/**
 * Create a rate limiter middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Too many requests. Please try again later.',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.path}:${keyGenerator(req)}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Reset if window expired
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      console.warn('[RateLimit] Limit exceeded', {
        ip: req.ip,
        path: req.path,
        count: entry.count,
      });

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        },
      });
    }

    next();
  };
}

// Pre-configured rate limiters
export const bookingRateLimit = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 10,         // 10 bookings per minute
  message: 'Too many booking requests. Please wait a minute.',
});

export const routingRateLimit = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 30,         // 30 route requests per minute
  message: 'Too many routing requests. Please wait a moment.',
});

export const facilityRateLimit = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 60,         // 60 facility lookups per minute
  message: 'Too many requests. Please wait a moment.',
});

/**
 * Per-user rate limiter (uses user ID from authenticated request)
 */
export function userRateLimit(options: Omit<RateLimitOptions, 'keyGenerator'>) {
  return rateLimit({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if available, otherwise fall back to IP
      const userId = req.headers['x-user-id'] as string;
      return userId || req.ip || 'unknown';
    },
  });
}

export const userBookingRateLimit = userRateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 20,           // 20 bookings per hour per user
  message: 'You have reached the booking limit. Please try again later.',
});
