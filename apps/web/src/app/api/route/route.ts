/**
 * Routing API Proxy (DEBUG ONLY)
 *
 * This endpoint is for debugging/testing purposes only.
 * In production, routing should be computed via the chat orchestrator
 * during /api/chat and emitted as RouteCard in AssistantEnvelope.
 *
 * Security:
 * - Requires NextAuth authentication
 * - Rate limited (10 requests/minute per user)
 * - Do NOT call this from production client code
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { expressApiInternal } from '@/lib/express-api';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import type { RouteCard } from '@mynaga/shared';

// Must run on Node.js
export const runtime = 'nodejs';

// Stricter rate limit for debug endpoint
const DEBUG_ROUTE_RATE_LIMIT = {
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 10,         // 10 requests per minute
  message: 'Debug route endpoint rate limited. Please wait.',
};

/**
 * GET /api/route (DEBUG ONLY)
 * Get driving/walking route between two points
 *
 * Requires: NextAuth session
 *
 * Query params:
 * - fromLat, fromLng: Origin coordinates
 * - toLat, toLng: Destination coordinates
 * - profile: 'driving' | 'walking' | 'cycling' (default: driving)
 */
export async function GET(request: NextRequest) {
  // Require authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required for debug route endpoint',
        },
      },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, DEBUG_ROUTE_RATE_LIMIT);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimitResult.error,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  const { searchParams } = new URL(request.url);

  const fromLat = searchParams.get('fromLat');
  const fromLng = searchParams.get('fromLng');
  const toLat = searchParams.get('toLat');
  const toLng = searchParams.get('toLng');
  const profile = searchParams.get('profile') || 'driving';

  // Validate required params
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Missing required coordinates (fromLat, fromLng, toLat, toLng)',
        },
      },
      { status: 400 }
    );
  }

  // Forward to Express API
  const queryString = new URLSearchParams({
    fromLat,
    fromLng,
    toLat,
    toLng,
    profile,
  }).toString();

  const result = await expressApiInternal<RouteCard>(`/api/route?${queryString}`);

  if (!result.success) {
    const status =
      result.error?.code === 'OUT_OF_BOUNDS'
        ? 400
        : result.error?.code === 'NO_ROUTE'
          ? 404
          : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, {
    headers: rateLimitHeaders(rateLimitResult),
  });
}
