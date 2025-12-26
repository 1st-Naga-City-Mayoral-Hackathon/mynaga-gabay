/**
 * Medication courses API (Next.js)
 *
 * Proxies authenticated requests to Express API.
 */

import { NextResponse } from 'next/server';
import { expressApi } from '@/lib/express-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get('includeInactive');
  const endpoint = includeInactive ? `/api/medications/courses?includeInactive=${includeInactive}` : '/api/medications/courses';

  const result = await expressApi<unknown[]>(endpoint);
  const status = result.success ? 200 : result.error?.code === 'UNAUTHORIZED' ? 401 : 500;
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await expressApi<unknown>('/api/medications/courses', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const status = result.success ? 201 : result.error?.code === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }
}



