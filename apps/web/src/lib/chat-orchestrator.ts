/**
 * Chat Orchestrator
 *
 * Composes structured assistant responses by:
 * 1. Detecting symptoms via triage module
 * 2. Fetching nearby facilities
 * 3. Getting routes
 * 4. Including medication cards
 * 5. Including schedule/booking info
 *
 * Security: All Express API calls use internal authentication.
 * This orchestrator runs server-side only (in /api/chat).
 */

import type {
  AssistantEnvelope,
  AssistantCard,
  UserLocation,
  FacilityCard,
  RouteCard,
  ScheduleCard,
  SafetyInfo,
} from '@mynaga/shared';
import { triageMessage, isHealthRelated } from '@mynaga/shared';

// API URLs and auth
const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:4000';
const INTERNAL_API_KEY =
  process.env.INTERNAL_API_KEY ||
  (process.env.NODE_ENV === 'production' ? '' : 'dev-internal-key');

// Warn if internal key is missing in production
if (!INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('[Orchestrator] WARNING: INTERNAL_API_KEY not set. Express API calls may fail.');
}

interface OrchestratorOptions {
  userMessage: string;
  llmResponse: string;
  language: string;
  location?: UserLocation;
  wantsBooking?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

function hasFacilityOrBookingIntent(message: string, wantsBooking?: boolean): boolean {
  if (wantsBooking) return true;
  return /\b(nearest|near\b|nearby|hospital|clinic|health\s*center|facility|pharmacy|doctor|directions|route|map|book|booking|schedule|appointment)\b/i.test(
    message
  );
}

function extractBarangayQuery(manualText: string): string {
  // LocationCapture quick select sets "Barangay, Naga City".
  // The DB stores just the barangay (e.g., "Centro"), so we strip trailing city parts.
  const trimmed = manualText.trim();
  const firstPart = trimmed.split(',')[0]?.trim();
  return firstPart || trimmed;
}

// Approximate fallback start point (used only when user provides manual location text without GPS coordinates).
// Kept within Naga bounds so routing remains locked to Naga City for security.
const NAGA_CITY_CENTROID = { lat: 13.6218, lng: 123.1948 };

async function geocodeManualText(manualText: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Call our own Next.js geocode endpoint (server-side)
    const url = `http://localhost:3000/api/geocode?q=${encodeURIComponent(manualText)}`;
    const resp = await fetchWithTimeout(url, {}, 8000);
    if (!resp.ok) return null;
    const json = (await resp.json()) as { success?: boolean; data?: { lat: number; lng: number } };
    if (json?.success && json.data && typeof json.data.lat === 'number' && typeof json.data.lng === 'number') {
      return { lat: json.data.lat, lng: json.data.lng };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Internal headers for Express API calls
 */
function getInternalHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Internal-Key': INTERNAL_API_KEY,
  };
}

/**
 * Fetch with timeout helper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch from Express API with internal authentication
 */
async function fetchExpressApi(
  endpoint: string,
  timeoutMs: number = 10000
): Promise<Response> {
  return fetchWithTimeout(
    `${EXPRESS_API_URL}${endpoint}`,
    { headers: getInternalHeaders() },
    timeoutMs
  );
}

/**
 * Fetch nearby facilities from Express API
 */
async function fetchNearbyFacilities(
  location: UserLocation,
  facilityType?: string
): Promise<FacilityCard[]> {
  try {
    const params = new URLSearchParams({
      radiusMeters: '5000',
      limit: '3',
    });

    if (facilityType) {
      params.set('type', facilityType);
    }

    if (location.lat && location.lng) {
      params.set('nearLat', location.lat.toString());
      params.set('nearLng', location.lng.toString());
    } else if (location.manualText) {
      // Fallback: attempt facility filtering based on the provided manual location text.
      // This will not compute distance ordering, but still returns relevant facilities.
      params.set('barangay', extractBarangayQuery(location.manualText));
    } else {
      console.log('[Orchestrator] No location provided, skipping facility fetch');
      return [];
    }

    const response = await fetchExpressApi(`/api/facilities?${params}`, 5000);

    if (!response.ok) {
      console.error('[Orchestrator] Facility fetch failed:', response.status);
      return [];
    }

    const data: ApiResponse<FacilityCard[]> = await response.json();
    const result = data.data || [];

    // Demo reliability: if manual location filtering returns nothing, fall back to a simple type-only list.
    if (result.length === 0 && location.manualText) {
      const fallbackParams = new URLSearchParams({
        limit: '3',
      });
      if (facilityType) fallbackParams.set('type', facilityType);

      const fallbackResp = await fetchExpressApi(`/api/facilities?${fallbackParams}`, 5000);
      if (fallbackResp.ok) {
        const fallbackData: ApiResponse<FacilityCard[]> = await fallbackResp.json();
        return fallbackData.data || [];
      }
    }

    return result;
  } catch (err) {
    console.error('[Orchestrator] Failed to fetch facilities:', err);
    return [];
  }
}

/**
 * Fetch route from Express API (which proxies to OSRM)
 */
async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  profile: 'driving' | 'walking' = 'driving'
): Promise<{ route: RouteCard | null; errorCode?: string }> {
  try {
    const params = new URLSearchParams({
      fromLat: from.lat.toString(),
      fromLng: from.lng.toString(),
      toLat: to.lat.toString(),
      toLng: to.lng.toString(),
      profile,
    });

    const response = await fetchExpressApi(`/api/route?${params}`, 10000);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const errorCode = body?.error?.code as string | undefined;
      console.error('[Orchestrator] Route fetch failed:', response.status, errorCode);
      return { route: null, errorCode };
    }

    const data: ApiResponse<RouteCard> = await response.json();
    return { route: data.data || null };
  } catch (err) {
    console.error('[Orchestrator] Failed to fetch route:', err);
    return { route: null };
  }
}

/**
 * Fetch doctor schedule for a facility
 */
async function fetchDoctorSchedule(
  facilityId: string
): Promise<ScheduleCard | null> {
  try {
    // First get doctors at facility
    const doctorsResponse = await fetchExpressApi(
      `/api/doctors?facilityId=${facilityId}`,
      5000
    );

    if (!doctorsResponse.ok) {
      return null;
    }

    const doctorsData = await doctorsResponse.json();
    const doctors = doctorsData.data || [];

    if (doctors.length === 0) {
      return null;
    }

    // Get availability for first doctor
    const firstDoctor = doctors[0];
    const availResponse = await fetchExpressApi(
      `/api/doctors/${firstDoctor.id}/availability`,
      5000
    );

    if (!availResponse.ok) {
      return null;
    }

    const availData: ApiResponse<ScheduleCard> = await availResponse.json();
    return availData.data || null;
  } catch (err) {
    console.error('[Orchestrator] Failed to fetch schedule:', err);
    return null;
  }
}

/**
 * Main orchestration function
 */
export async function orchestrateResponse(
  options: OrchestratorOptions
): Promise<AssistantEnvelope> {
  const { userMessage, llmResponse, language, location, wantsBooking } = options;
  let responseText = llmResponse;

  const cards: AssistantCard[] = [];
  let safety: SafetyInfo = {
    disclaimer: undefined,
    redFlags: undefined,
    urgency: undefined,
  };

  // Check if this is a health-related query
  const healthRelated = isHealthRelated(userMessage);

  if (healthRelated) {
    console.log('[Orchestrator] Health-related message detected');

    // Run triage
    const triageLang =
      normalizeLanguageForEnvelope(language) === 'english'
        ? 'english'
        : normalizeLanguageForEnvelope(language) === 'bikol'
          ? 'bikol'
          : 'tagalog';
    const triageResult = triageMessage(userMessage, triageLang);

    console.log('[Orchestrator] Triage result:', {
      symptoms: triageResult.detectedSymptoms,
      urgency: triageResult.safety.urgency,
      facilityType: triageResult.facilityType,
    });

    // Set safety info
    safety = triageResult.safety;

    // Add medication card if applicable
    if (triageResult.medicationCard) {
      cards.push(triageResult.medicationCard);
    }

    const facilityIntent = hasFacilityOrBookingIntent(userMessage, wantsBooking);

    // Fetch facilities when:
    // - symptoms exist (triage use-case), OR
    // - user explicitly asks for nearby facilities/directions/booking
    if (location && (triageResult.detectedSymptoms.length > 0 || facilityIntent)) {
      // Determine facility type based on urgency
      let facilityType: string | undefined;
      if (triageResult.safety.urgency === 'er') {
        facilityType = 'hospital';
      } else if (triageResult.facilityType === 'hospital') {
        facilityType = 'hospital';
      } else if (triageResult.facilityType === 'clinic') {
        facilityType = 'health_center';
      } else if (/\bhospital\b/i.test(userMessage)) {
        facilityType = 'hospital';
      } else if (/\b(pharmacy|botica)\b/i.test(userMessage)) {
        facilityType = 'pharmacy';
      }

      const facilities = await fetchNearbyFacilities(location, facilityType);

      if (facilities.length > 0) {
        // Add facility cards
        for (const facility of facilities.slice(0, 2)) {
          cards.push(facility);
        }

        // If the LLM response is unhelpful for facility/booking intents, replace it with
        // a deterministic line that matches the cards we are about to show (demo-friendly).
        if (facilityIntent) {
          responseText =
            'Here are the nearest options based on your location, plus directions and available appointment slots.';
        }

        // Get route to nearest facility
        const nearestFacility = facilities[0];
        if (nearestFacility.lat && nearestFacility.lng) {
          const from =
            location.lat && location.lng
              ? { lat: location.lat, lng: location.lng }
              : location.manualText
                ? (await (async () => {
                    const geo = await geocodeManualText(location.manualText!);
                    return geo || NAGA_CITY_CENTROID;
                  })())
                : null;

          if (from) {
            const { route, errorCode } = await fetchRoute(
              from,
              { lat: nearestFacility.lat, lng: nearestFacility.lng },
              triageResult.safety.urgency === 'er' ? 'driving' : 'walking'
            );

            if (route) {
              // Add labels to route
              route.from.label =
                location.lat && location.lng
                  ? 'Your Location'
                  : 'Approximate start (manual location)';
              route.to.label = nearestFacility.name;
              cards.push(route);
            } else if (errorCode === 'OUT_OF_BOUNDS') {
              safety = {
                ...safety,
                disclaimer:
                  (safety.disclaimer ? `${safety.disclaimer}\n\n` : '') +
                  'Note: Directions are limited to Naga City. Your current location seems outside Naga City; please set your location to a Naga City barangay to see a route.',
              };
            }
          }
        }

        // Fetch schedule if user wants booking and not an emergency (independent of routing)
        if (wantsBooking && triageResult.safety.urgency !== 'er') {
          const schedule = await fetchDoctorSchedule(nearestFacility.facilityId);
          if (schedule) {
            cards.push(schedule);

            // For demo: include a concrete next available slot in the assistant text (if any)
            const nextSlot = schedule.slots.find((s) => s.available);
            if (nextSlot) {
              const next = new Date(nextSlot.startTime).toLocaleString('en-PH', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              responseText =
                `${responseText}\n\nNext available slot: ${next}. ` +
                `Select a time below to book.`;
            }
          }
        }
      }
    }
  }

  // Compose envelope
  const envelope: AssistantEnvelope = {
    text: responseText,
    language: normalizeLanguageForEnvelope(language),
    safety,
    cards,
    timestamp: new Date().toISOString(),
  };

  return envelope;
}

/**
 * Normalize language for envelope
 */
function normalizeLanguageForEnvelope(
  lang: string
): 'english' | 'tagalog' | 'bikol' | string {
  const map: Record<string, string> = {
    en: 'english',
    eng: 'english',
    english: 'english',
    fil: 'tagalog',
    tagalog: 'tagalog',
    filipino: 'tagalog',
    bcl: 'bikol',
    bikol: 'bikol',
    bikolano: 'bikol',
  };

  return map[lang.toLowerCase()] || lang;
}

/**
 * Check if orchestration is needed based on the message
 */
export function shouldOrchestrate(userMessage: string): boolean {
  return isHealthRelated(userMessage);
}
