/**
 * Single Appointment API Routes
 *
 * Proxies authenticated requests to Express API for individual appointments.
 */

import { NextResponse } from 'next/server';
import { expressApi } from '@/lib/express-api';
import type { BookingCard } from '@mynaga/shared';

// Must run on Node.js for auth
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/appointments/[id]
 * Get a single appointment by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const result = await expressApi<BookingCard>(`/api/appointments/${id}`);

  if (!result.success) {
    const status =
      result.error?.code === 'UNAUTHORIZED'
        ? 401
        : result.error?.code === 'FORBIDDEN'
          ? 403
          : result.error?.code === 'NOT_FOUND'
            ? 404
            : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

/**
 * DELETE /api/appointments/[id]
 * Cancel an appointment
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const result = await expressApi<{ message: string }>(`/api/appointments/${id}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    const status =
      result.error?.code === 'UNAUTHORIZED'
        ? 401
        : result.error?.code === 'FORBIDDEN'
          ? 403
          : result.error?.code === 'NOT_FOUND'
            ? 404
            : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
