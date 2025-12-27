/**
 * Appointments API Routes (Secured)
 *
 * All appointment actions require authentication via internal proxy:
 * - Next.js verifies user session via NextAuth
 * - Next.js proxies to Express with internal key + user ID
 * - Express verifies internal key and trusts user info
 *
 * Security features:
 * - No lookup by phone (removed)
 * - Users can only access their own appointments
 * - Rate limiting per user
 * - Audit logging
 */

import { Router, Response } from 'express';
import type {
  ApiResponse,
  Appointment,
  CreateAppointmentRequest,
  BookingCard,
  SyncOutboxEvent,
} from '@mynaga/shared';
import prisma from '../lib/prisma';
import type { Prisma, SyncEventType } from '@prisma/client';
import {
  requireInternalAuth,
  requireInternalKey,
  AuthenticatedRequest,
} from '../middleware/internalAuth';
import { userBookingRateLimit, bookingRateLimit } from '../middleware/rateLimit';
import {
  logAppointmentCreated,
  logAppointmentCancelled,
  logAppointmentViewed,
} from '../services/auditLog';

const router = Router();

/**
 * Helper to create a sync outbox event for external system sync
 */
async function createSyncEvent(
  eventType: SyncEventType,
  appointmentId: string,
  payload: Record<string, unknown>
): Promise<void> {
  await prisma.syncOutboxEvent.create({
    data: {
      eventType,
      appointmentId,
      payload: payload as Prisma.InputJsonValue,
      status: 'pending',
      retryCount: 0,
    },
  });
}

/**
 * Input validation helpers
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

/**
 * POST /api/appointments
 * Create a new appointment booking (REQUIRES AUTH)
 */
router.post(
  '/',
  requireInternalAuth,
  userBookingRateLimit,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const body: CreateAppointmentRequest = req.body;

      // Validate required fields
      if (
        !body.doctorId ||
        !body.facilityId ||
        !body.slotStart ||
        !body.slotEnd ||
        !body.patientName
      ) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Missing required booking fields' },
        } as ApiResponse<never>);
      }

      // Validate UUIDs
      if (!isValidUUID(body.doctorId) || !isValidUUID(body.facilityId)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Invalid doctor or facility ID' },
        } as ApiResponse<never>);
      }

      // Validate dates
      if (!isValidISODate(body.slotStart) || !isValidISODate(body.slotEnd)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Invalid slot times' },
        } as ApiResponse<never>);
      }

      // Verify doctor exists and belongs to facility
      const doctor = await prisma.doctor.findUnique({
        where: { id: body.doctorId },
        include: { facility: { select: { name: true } } },
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Doctor not found' },
        } as ApiResponse<never>);
      }

      if (doctor.facilityId !== body.facilityId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Doctor does not belong to specified facility' },
        } as ApiResponse<never>);
      }

      const slotStart = new Date(body.slotStart);
      const slotEnd = new Date(body.slotEnd);

      // Validate slot is in the future
      if (slotStart < new Date()) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Cannot book a slot in the past' },
        } as ApiResponse<never>);
      }

      // Check if slot exists and is available
      const slot = await prisma.availabilitySlot.findFirst({
        where: {
          doctorId: body.doctorId,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false,
        },
      });

      if (!slot) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'The requested time slot is not available',
          },
        } as ApiResponse<never>);
      }

      // Create appointment and mark slot as booked in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Mark slot as booked
        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: { isBooked: true },
        });

        // Create appointment with userId
        const appointment = await tx.appointment.create({
          data: {
            userId, // Link to authenticated user
            doctorId: body.doctorId,
            facilityId: body.facilityId,
            patientName: body.patientName,
            patientPhone: body.patientPhone || null,
            slotStart,
            slotEnd,
            notes: body.notes,
            status: 'scheduled',
          },
          include: {
            doctor: { select: { name: true } },
            facility: { select: { name: true } },
          },
        });

        return appointment;
      });

      // Create sync event for external system (async, non-blocking)
      createSyncEvent('appointment_created', result.id, {
        appointmentId: result.id,
        userId,
        doctorId: result.doctorId,
        doctorName: result.doctor.name,
        facilityId: result.facilityId,
        facilityName: result.facility.name,
        slotStart: result.slotStart.toISOString(),
        slotEnd: result.slotEnd.toISOString(),
      }).catch((err) => console.error('Failed to create sync event:', err));

      // Audit log
      logAppointmentCreated(userId, result.id, {
        doctorId: result.doctorId,
        facilityId: result.facilityId,
        slotStart: result.slotStart.toISOString(),
      }, req).catch((err) => console.error('Failed to log audit:', err));

      const bookingCard: BookingCard = {
        cardType: 'booking',
        doctorId: result.doctorId,
        doctorName: result.doctor.name,
        facilityId: result.facilityId,
        facilityName: result.facility.name,
        selectedSlot: {
          slotId: slot.id,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: false,
        },
        status: 'booked',
        appointmentId: result.id,
      };

      res.status(201).json({
        success: true,
        data: bookingCard,
      } as ApiResponse<BookingCard>);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        error: { code: 'BOOKING_ERROR', message: 'Failed to create appointment' },
      } as ApiResponse<never>);
    }
  }
);

/**
 * GET /api/appointments
 * List current user's appointments (REQUIRES AUTH)
 * NOTE: Removed patientPhone lookup for security
 */
router.get(
  '/',
  requireInternalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { status } = req.query;

      // Only return appointments owned by this user
      const appointments = await prisma.appointment.findMany({
        where: {
          userId, // Only user's own appointments
          ...(status && { status: status as 'scheduled' | 'confirmed' | 'cancelled' | 'completed' }),
        },
        include: {
          doctor: { select: { name: true } },
          facility: { select: { name: true } },
        },
        orderBy: { slotStart: 'asc' },
      });

      // Audit log
      logAppointmentViewed(userId, null, req).catch((err) =>
        console.error('Failed to log audit:', err)
      );

      const appointmentList: Appointment[] = appointments.map((a) => ({
        id: a.id,
        doctorId: a.doctorId,
        doctorName: a.doctor.name,
        facilityId: a.facilityId,
        facilityName: a.facility.name,
        patientName: a.patientName,
        patientPhone: a.patientPhone ?? undefined,
        slotStart: a.slotStart.toISOString(),
        slotEnd: a.slotEnd.toISOString(),
        status: a.status,
        notes: a.notes ?? undefined,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }));

      res.json({
        success: true,
        data: appointmentList,
      } as ApiResponse<Appointment[]>);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch appointments' },
      } as ApiResponse<never>);
    }
  }
);

/**
 * GET /api/appointments/:id
 * Get specific appointment details (REQUIRES AUTH + OWNERSHIP)
 */
router.get(
  '/:id',
  requireInternalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      if (!isValidUUID(req.params.id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Invalid appointment ID' },
        } as ApiResponse<never>);
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          doctor: { select: { name: true } },
          facility: { select: { name: true } },
        },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found' },
        } as ApiResponse<never>);
      }

      // Check ownership
      if (appointment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only view your own appointments' },
        } as ApiResponse<never>);
      }

      // Audit log
      logAppointmentViewed(userId, appointment.id, req).catch((err) =>
        console.error('Failed to log audit:', err)
      );

      const appointmentData: Appointment = {
        id: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name,
        facilityId: appointment.facilityId,
        facilityName: appointment.facility.name,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone ?? undefined,
        slotStart: appointment.slotStart.toISOString(),
        slotEnd: appointment.slotEnd.toISOString(),
        status: appointment.status,
        notes: appointment.notes ?? undefined,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      };

      res.json({
        success: true,
        data: appointmentData,
      } as ApiResponse<Appointment>);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch appointment' },
      } as ApiResponse<never>);
    }
  }
);

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment (REQUIRES AUTH + OWNERSHIP)
 */
router.delete(
  '/:id',
  requireInternalAuth,
  userBookingRateLimit,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      if (!isValidUUID(req.params.id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Invalid appointment ID' },
        } as ApiResponse<never>);
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          doctor: { select: { name: true } },
          facility: { select: { name: true } },
        },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found' },
        } as ApiResponse<never>);
      }

      // Check ownership
      if (appointment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only cancel your own appointments' },
        } as ApiResponse<never>);
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_CANCELLED', message: 'Appointment is already cancelled' },
        } as ApiResponse<never>);
      }

      // Cancel appointment and release slot in a transaction
      await prisma.$transaction(async (tx) => {
        // Update appointment status
        await tx.appointment.update({
          where: { id: req.params.id },
          data: { status: 'cancelled' },
        });

        // Release the slot (find matching slot and mark as not booked)
        await tx.availabilitySlot.updateMany({
          where: {
            doctorId: appointment.doctorId,
            startTime: appointment.slotStart,
            endTime: appointment.slotEnd,
            isBooked: true,
          },
          data: { isBooked: false },
        });
      });

      // Create sync event for external system
      createSyncEvent('appointment_cancelled', appointment.id, {
        appointmentId: appointment.id,
        userId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name,
        facilityId: appointment.facilityId,
        facilityName: appointment.facility.name,
        slotStart: appointment.slotStart.toISOString(),
        slotEnd: appointment.slotEnd.toISOString(),
      }).catch((err) => console.error('Failed to create sync event:', err));

      // Audit log
      logAppointmentCancelled(userId, appointment.id, req).catch((err) =>
        console.error('Failed to log audit:', err)
      );

      const bookingCard: BookingCard = {
        cardType: 'booking',
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name,
        facilityId: appointment.facilityId,
        facilityName: appointment.facility.name,
        selectedSlot: {
          slotId: '',
          startTime: appointment.slotStart.toISOString(),
          endTime: appointment.slotEnd.toISOString(),
          available: true,
        },
        status: 'cancelled',
        appointmentId: appointment.id,
      };

      res.json({
        success: true,
        data: bookingCard,
      } as ApiResponse<BookingCard>);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CANCELLATION_ERROR', message: 'Failed to cancel appointment' },
      } as ApiResponse<never>);
    }
  }
);

/**
 * GET /api/appointments/sync/pending
 * Get pending sync events (INTERNAL ONLY - no user auth needed)
 */
router.get(
  '/sync/pending',
  requireInternalKey,
  async (_req, res: Response) => {
    try {
      const events = await prisma.syncOutboxEvent.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });

      const syncEvents: SyncOutboxEvent[] = events.map((e) => ({
        id: e.id,
        eventType: e.eventType as 'appointment_created' | 'appointment_cancelled' | 'appointment_updated',
        payload: e.payload as Record<string, unknown>,
        status: e.status as 'pending' | 'synced' | 'failed',
        retryCount: e.retryCount,
        createdAt: e.createdAt.toISOString(),
        syncedAt: e.syncedAt?.toISOString(),
        errorMessage: e.errorMessage ?? undefined,
      }));

      res.json({
        success: true,
        data: syncEvents,
      } as ApiResponse<SyncOutboxEvent[]>);
    } catch (error) {
      console.error('Error fetching sync events:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sync events' },
      } as ApiResponse<never>);
    }
  }
);

/**
 * POST /api/appointments/sync/:id/ack
 * Acknowledge a sync event as synced (INTERNAL ONLY)
 */
router.post(
  '/sync/:id/ack',
  requireInternalKey,
  async (req, res: Response) => {
    try {
      const event = await prisma.syncOutboxEvent.update({
        where: { id: req.params.id },
        data: {
          status: 'synced',
          syncedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: { id: event.id, status: 'synced' },
      } as ApiResponse<{ id: string; status: string }>);
    } catch (error) {
      console.error('Error acknowledging sync event:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to acknowledge sync event' },
      } as ApiResponse<never>);
    }
  }
);

export { router as appointmentsRouter };
