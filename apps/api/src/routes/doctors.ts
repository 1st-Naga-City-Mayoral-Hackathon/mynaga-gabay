/**
 * Doctors API Routes
 * Provides doctor listing and availability
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse, Doctor, ScheduleCard, ScheduleSlot } from '@mynaga/shared';
import prisma from '../lib/prisma';

const router = Router();

/**
 * GET /api/doctors
 * List doctors with optional facility filter
 *
 * Query params:
 * - facilityId: Filter by facility
 * - specialization: Filter by specialization (partial match)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { facilityId, specialization } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
        ...(facilityId && { facilityId: String(facilityId) }),
        ...(specialization && {
          specialization: {
            contains: String(specialization),
            mode: 'insensitive',
          },
        }),
      },
      include: {
        facility: {
          select: { name: true },
        },
      },
    });

    const doctorList: Doctor[] = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialization: d.specialization,
      facilityId: d.facilityId,
      facilityName: d.facility.name,
      photoUrl: d.photoUrl ?? undefined,
      consultationFee: d.consultationFee ?? undefined,
    }));

    res.json({
      success: true,
      data: doctorList,
    } as ApiResponse<Doctor[]>);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch doctors' },
    } as ApiResponse<never>);
  }
});

/**
 * GET /api/doctors/:id
 * Get specific doctor details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        facility: {
          select: { name: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Doctor not found' },
      } as ApiResponse<never>);
    }

    const doctorData: Doctor = {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      facilityId: doctor.facilityId,
      facilityName: doctor.facility.name,
      photoUrl: doctor.photoUrl ?? undefined,
      consultationFee: doctor.consultationFee ?? undefined,
    };

    res.json({
      success: true,
      data: doctorData,
    } as ApiResponse<Doctor>);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch doctor' },
    } as ApiResponse<never>);
  }
});

/**
 * GET /api/doctors/:id/availability
 * Get doctor's availability slots
 *
 * Query params:
 * - from: Start date (ISO string, default: now)
 * - to: End date (ISO string, default: 7 days from now)
 */
router.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        facility: {
          select: { name: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Doctor not found' },
      } as ApiResponse<never>);
    }

    const startDate = from ? new Date(String(from)) : new Date();
    const endDate = to
      ? new Date(String(to))
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        doctorId: req.params.id,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      orderBy: { startTime: 'asc' },
    });

    const scheduleSlots: ScheduleSlot[] = slots.map((slot) => ({
      slotId: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      available: !slot.isBooked,
    }));

    // Create human-readable summary
    const availableCount = scheduleSlots.filter((s) => s.available).length;
    const humanSummary = `${availableCount} available slot${availableCount !== 1 ? 's' : ''} with Dr. ${doctor.name} (${doctor.specialization})`;

    const scheduleCard: ScheduleCard = {
      cardType: 'schedule',
      facilityId: doctor.facilityId,
      facilityName: doctor.facility.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      humanSummary,
      slots: scheduleSlots,
    };

    res.json({
      success: true,
      data: scheduleCard,
    } as ApiResponse<ScheduleCard>);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch availability' },
    } as ApiResponse<never>);
  }
});

export { router as doctorsRouter };
