/**
 * Facilities API Routes
 * Provides health facility search with geo-based queries
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse, FacilityCard } from '@mynaga/shared';
import prisma from '../lib/prisma';
import type { FacilityType, Facility } from '@prisma/client';

const router = Router();

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert Prisma Facility to FacilityCard
 */
function toFacilityCard(
  facility: Facility,
  distanceMeters?: number
): FacilityCard {
  return {
    cardType: 'facility',
    facilityId: facility.id,
    name: facility.name,
    address: facility.address,
    hours: facility.hours ?? undefined,
    phone: facility.phone ?? undefined,
    services: facility.services,
    distanceMeters,
    lat: facility.latitude ?? undefined,
    lng: facility.longitude ?? undefined,
    photoUrl: facility.photoUrl ?? undefined,
    facilityType: facility.type,
  };
}

/**
 * GET /api/facilities
 * List health facilities with optional geo-based search
 *
 * Query params:
 * - type: FacilityType filter
 * - barangay: Barangay filter (partial match)
 * - nearLat, nearLng: Center point for geo search
 * - radiusMeters: Radius for geo search (default 5000)
 * - limit: Max results (default 10)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      barangay,
      nearLat,
      nearLng,
      radiusMeters = '5000',
      limit = '10',
    } = req.query;

    // Build base query
    const whereClause: {
      type?: FacilityType;
      barangay?: { contains: string; mode: 'insensitive' };
      isActive: boolean;
    } = { isActive: true };

    if (type) {
      whereClause.type = type as FacilityType;
    }

    if (barangay) {
      whereClause.barangay = {
        contains: String(barangay),
        mode: 'insensitive',
      };
    }

    let facilities = await prisma.facility.findMany({
      where: whereClause,
      take: parseInt(String(limit), 10) * 2, // Fetch more for filtering
    });

    // Apply geo filter if coordinates provided
    let facilitiesWithDistance: Array<{ facility: Facility; distance?: number }> = [];

    if (nearLat && nearLng) {
      const lat = parseFloat(String(nearLat));
      const lng = parseFloat(String(nearLng));
      const radius = parseInt(String(radiusMeters), 10);

      facilitiesWithDistance = facilities
        .filter((f) => f.latitude !== null && f.longitude !== null)
        .map((f) => ({
          facility: f,
          distance: calculateDistance(lat, lng, f.latitude!, f.longitude!),
        }))
        .filter((f) => f.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, parseInt(String(limit), 10));
    } else {
      facilitiesWithDistance = facilities
        .slice(0, parseInt(String(limit), 10))
        .map((f) => ({ facility: f }));
    }

    const cards = facilitiesWithDistance.map(({ facility, distance }) =>
      toFacilityCard(facility, distance)
    );

    res.json({
      success: true,
      data: cards,
    } as ApiResponse<FacilityCard[]>);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch facilities' },
    } as ApiResponse<never>);
  }
});

/**
 * GET /api/facilities/:id
 * Get specific facility details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Facility not found' },
      } as ApiResponse<never>);
    }

    res.json({
      success: true,
      data: toFacilityCard(facility),
    } as ApiResponse<FacilityCard>);
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch facility' },
    } as ApiResponse<never>);
  }
});

export { router as facilitiesRouter };
