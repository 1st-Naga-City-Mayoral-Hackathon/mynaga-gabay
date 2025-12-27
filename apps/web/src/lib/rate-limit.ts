/**
 * Simple in-memory rate limiter for Next.js API routes
 *
 * Keys by userId (when authenticated) or client IP.
 * For production multi-instance, consider Redis-backed rate limiting.
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (per process)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Error message
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  error?: {
    code: string;
    message: string;
    retryAfter: number;
  };
}

/**
 * Get client identifier from request
 * Uses userId if authenticated, otherwise client IP
 */
async function getClientId(req: NextRequest): Promise<string> {
  // Try to get authenticated user
  try {
    const session = await auth();
    if (session?.user?.id) {
      return `user:${session.user.id}`;
    }
  } catch {
    // Auth check failed, use IP
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please try again later.',
  } = options;

  const clientId = await getClientId(req);
  const key = `chat:${clientId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, maxRequests - entry.count);
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > maxRequests) {
    console.warn('[RateLimit] Chat limit exceeded', {
      clientId,
      count: entry.count,
    });

    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: entry.resetAt,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter,
      },
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  };
}

// Pre-configured rate limit for chat endpoint
export const CHAT_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 20,         // 20 messages per minute
  message: 'Maraming request. Subukan ulit pagkatapos ng isang minuto. (Too many requests. Please wait a minute.)',
};
