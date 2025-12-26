/**
 * Medication intake events API (Next.js)
 */

import { NextResponse } from 'next/server';
import { expressApi } from '@/lib/express-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const endpoint = params ? `/api/medications/intake?${params}` : '/api/medications/intake';

  const result = await expressApi<unknown[]>(endpoint);
  const status = result.success ? 200 : result.error?.code === 'UNAUTHORIZED' ? 401 : 500;
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await expressApi<unknown>('/api/medications/intake', {
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



