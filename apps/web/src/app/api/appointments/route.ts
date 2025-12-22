/**
 * Appointments API Routes
 *
 * Proxies authenticated requests to Express API.
 * All appointment operations require user authentication.
 */

import { NextResponse } from 'next/server';
import { expressApi } from '@/lib/express-api';
import type { BookingCard } from '@mynaga/shared';

// Must run on Node.js for auth
export const runtime = 'nodejs';

interface CreateAppointmentBody {
  doctorId: string;
  facilityId: string;
  slotStart: string;
  slotEnd: string;
  patientName: string;
  patientPhone?: string;
  notes?: string;
}

/**
 * GET /api/appointments
 * List current user's appointments
 */
export async function GET() {
  const result = await expressApi<BookingCard[]>('/api/appointments');

  if (!result.success) {
    const status = result.error?.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function POST(request: Request) {
  try {
    const body: CreateAppointmentBody = await request.json();

    // Basic validation
    if (!body.doctorId || !body.facilityId || !body.slotStart || !body.slotEnd || !body.patientName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Missing required fields: doctorId, facilityId, slotStart, slotEnd, patientName',
          },
        },
        { status: 400 }
      );
    }

    const result = await expressApi<BookingCard>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!result.success) {
      const status =
        result.error?.code === 'UNAUTHORIZED'
          ? 401
          : result.error?.code === 'CONFLICT'
            ? 409
            : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[Appointments] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create appointment' },
      },
      { status: 500 }
    );
  }
}
