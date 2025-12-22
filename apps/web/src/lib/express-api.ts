/**
 * Express API Client
 *
 * Proxies requests from Next.js to Express API with internal authentication.
 * Session verification happens in Next.js; Express trusts the internal key.
 */

import { auth } from '@/lib/auth';

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:4000';
const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY ||
  (process.env.NODE_ENV === 'production' ? '' : 'dev-internal-key');

if (!INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('WARNING: INTERNAL_API_KEY not set. Express API calls will fail.');
}

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Make an authenticated request to the Express API
 */
export async function expressApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;

  // Get session if auth required
  let userId: string | undefined;
  let userEmail: string | undefined;

  if (requireAuth) {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
    }

    userId = session.user.id;
    userEmail = session.user.email || undefined;
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Internal-Key': INTERNAL_API_KEY,
    ...headers,
  };

  if (userId) {
    requestHeaders['X-User-Id'] = userId;
  }
  if (userEmail) {
    requestHeaders['X-User-Email'] = userEmail;
  }

  try {
    const response = await fetch(`${EXPRESS_API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'API_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('[ExpressAPI] Request failed:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to API',
      },
    };
  }
}

/**
 * Make a request to Express API without user auth (internal-only endpoint)
 */
export async function expressApiInternal<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return expressApi<T>(endpoint, { ...options, requireAuth: false });
}
