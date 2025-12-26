/**
 * Medication course detail API (Next.js)
 */

import { NextResponse } from 'next/server';
import { expressApi } from '@/lib/express-api';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const result = await expressApi<unknown>(`/api/medications/courses/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const status = result.success ? 200 : result.error?.code === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const result = await expressApi<unknown>(`/api/medications/courses/${params.id}`, {
    method: 'DELETE',
  });
  const status = result.success ? 200 : result.error?.code === 'UNAUTHORIZED' ? 401 : 400;
  return NextResponse.json(result, { status });
}



