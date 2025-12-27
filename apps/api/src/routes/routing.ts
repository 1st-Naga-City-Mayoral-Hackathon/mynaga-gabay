/**
 * Routing API Routes
 * Uses OSRM for driving/walking directions
 *
 * Security: Internal-only access (no direct browser calls)
 * - Requires X-Internal-Key header
 * - Rate limited to prevent abuse
 * - No GPS coordinates stored in logs
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse, RouteCard, RouteStep, GeoJSONLineString } from '@mynaga/shared';
import { requireInternalKey, optionalInternalAuth, AuthenticatedRequest } from '../middleware/internalAuth';
import { routingRateLimit } from '../middleware/rateLimit';
import { logRouteRequested } from '../services/auditLog';

const router = Router();

// Valid routing profiles
const VALID_PROFILES = ['driving', 'walking', 'cycling'] as const;
type RoutingProfile = (typeof VALID_PROFILES)[number];

// OSRM profile name mapping
// Public OSRM demo server uses: driving, foot, cycling
// Self-hosted OSRM typically uses: car, foot, bicycle
const OSRM_PROFILE_MAP: Record<RoutingProfile, string> = {
  driving: process.env.OSRM_DRIVING_PROFILE || 'driving',
  walking: process.env.OSRM_WALKING_PROFILE || 'foot',
  cycling: process.env.OSRM_CYCLING_PROFILE || 'cycling',
};

// Naga City bounding box for coordinate validation
// Prevents abuse by limiting to reasonable area
const NAGA_BOUNDS = {
  minLat: 13.55,
  maxLat: 13.70,
  minLng: 123.15,
  maxLng: 123.35,
};

// OSRM server URL - configurable via environment
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        maneuver: {
          instruction?: string;
          type: string;
          modifier?: string;
        };
        distance: number;
        duration: number;
        name: string;
      }>;
    }>;
    distance: number;
    duration: number;
  }>;
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}

/**
 * Validate coordinates are within Naga City bounds
 */
function isWithinBounds(lat: number, lng: number): boolean {
  return (
    lat >= NAGA_BOUNDS.minLat &&
    lat <= NAGA_BOUNDS.maxLat &&
    lng >= NAGA_BOUNDS.minLng &&
    lng <= NAGA_BOUNDS.maxLng
  );
}

/**
 * GET /api/route
 * Get driving/walking route between two points
 *
 * Security: Internal-only (requires X-Internal-Key header)
 * Rate limited: 30 requests/minute per IP
 *
 * Query params:
 * - fromLat, fromLng: Origin coordinates (must be within Naga City area)
 * - toLat, toLng: Destination coordinates (must be within Naga City area)
 * - profile: 'driving' | 'walking' | 'cycling' (default: driving)
 */
router.get(
  '/',
  requireInternalKey,
  routingRateLimit,
  optionalInternalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fromLat, fromLng, toLat, toLng, profile = 'driving' } = req.query;

      // Validate required params
      if (!fromLat || !fromLng || !toLat || !toLng) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Missing required coordinates (fromLat, fromLng, toLat, toLng)',
          },
        } as ApiResponse<never>);
      }

      // Validate profile
      const profileStr = String(profile);
      if (!VALID_PROFILES.includes(profileStr as RoutingProfile)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: `Invalid profile. Must be one of: ${VALID_PROFILES.join(', ')}`,
          },
        } as ApiResponse<never>);
      }

      const from = {
        lat: parseFloat(String(fromLat)),
        lng: parseFloat(String(fromLng)),
      };

      const to = {
        lat: parseFloat(String(toLat)),
        lng: parseFloat(String(toLng)),
      };

      // Validate coordinates are numbers
      if (isNaN(from.lat) || isNaN(from.lng) || isNaN(to.lat) || isNaN(to.lng)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Invalid coordinate values' },
        } as ApiResponse<never>);
      }

      // Validate coordinates are within bounds (prevents abuse)
      if (!isWithinBounds(from.lat, from.lng) || !isWithinBounds(to.lat, to.lng)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'OUT_OF_BOUNDS',
            message: 'Coordinates must be within Naga City area',
          },
        } as ApiResponse<never>);
      }

      // Map profile to OSRM profile using configurable mapping
      const osrmProfile = OSRM_PROFILE_MAP[profileStr as RoutingProfile];

      // Call OSRM
      const osrmUrl = `${OSRM_BASE_URL}/route/v1/${osrmProfile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;

      const osrmResponse = await fetch(osrmUrl);

      if (!osrmResponse.ok) {
        throw new Error(`OSRM returned ${osrmResponse.status}`);
      }

      const osrmData = (await osrmResponse.json()) as OSRMResponse;

      if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NO_ROUTE', message: 'No route found between the specified points' },
        } as ApiResponse<never>);
      }

      const route = osrmData.routes[0];

      // Parse steps from all legs
      const steps: RouteStep[] = route.legs.flatMap((leg) =>
        leg.steps.map((step) => ({
          instruction:
            step.maneuver.instruction ||
            `${step.maneuver.type}${step.maneuver.modifier ? ` ${step.maneuver.modifier}` : ''} on ${step.name || 'unnamed road'}`,
          distanceMeters: Math.round(step.distance),
          durationSeconds: Math.round(step.duration),
        }))
      );

      const routeCard: RouteCard = {
        cardType: 'route',
        from: { lat: from.lat, lng: from.lng },
        to: { lat: to.lat, lng: to.lng },
        geojsonLine: route.geometry as GeoJSONLineString,
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        steps,
        profile: profileStr as 'driving' | 'walking' | 'cycling',
      };

      // Log route request (no GPS coordinates stored)
      await logRouteRequested(
        req.userId,
        { profile: profileStr, distanceMeters: routeCard.distanceMeters },
        req
      );

      res.json({
        success: true,
        data: routeCard,
      } as ApiResponse<RouteCard>);
    } catch (error) {
      console.error('Error fetching route:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ROUTING_ERROR', message: 'Failed to calculate route' },
      } as ApiResponse<never>);
    }
  }
);

export { router as routingRouter };
