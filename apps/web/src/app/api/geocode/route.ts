import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Naga City bounding box (matches API routing bounds)
const NAGA_BOUNDS = {
  minLat: 13.55,
  maxLat: 13.70,
  minLng: 123.15,
  maxLng: 123.35,
};

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL || '';

const GEOCODE_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many geocoding requests. Please wait a minute.',
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

function inBounds(lat: number, lng: number): boolean {
  return (
    lat >= NAGA_BOUNDS.minLat &&
    lat <= NAGA_BOUNDS.maxLat &&
    lng >= NAGA_BOUNDS.minLng &&
    lng <= NAGA_BOUNDS.maxLng
  );
}

// Small in-memory cache (best effort)
const cache = new Map<string, { lat: number; lng: number; displayName: string }>();
const CACHE_MAX = 200;

export async function GET(req: NextRequest) {
  const rate = await checkRateLimit(req, GEOCODE_RATE_LIMIT);
  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: rate.error },
      { status: 429, headers: rateLimitHeaders(rate) }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_PARAMS', message: 'Missing q' } },
      { status: 400, headers: rateLimitHeaders(rate) }
    );
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(
      { success: true, data: cached },
      { headers: rateLimitHeaders(rate) }
    );
  }

  // Bias results to Naga City
  const query = q.toLowerCase().includes('naga')
    ? q
    : `${q}, Naga City, Camarines Sur, Philippines`;

  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
    addressdetails: '0',
    q: query,
    // Restrict to Naga bounding box
    viewbox: `${NAGA_BOUNDS.minLng},${NAGA_BOUNDS.maxLat},${NAGA_BOUNDS.maxLng},${NAGA_BOUNDS.minLat}`,
    bounded: '1',
  });
  if (NOMINATIM_EMAIL) params.set('email', NOMINATIM_EMAIL);

  const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

  const resp = await fetch(url, {
    headers: {
      // Nominatim requires a valid UA; Next sets one but we make it explicit.
      'User-Agent': 'MyNagaGabay/0.1 (demo)',
    },
    cache: 'no-store',
  });

  if (!resp.ok) {
    return NextResponse.json(
      { success: false, error: { code: 'GEOCODE_FAILED', message: `Geocoding failed (${resp.status})` } },
      { status: 502, headers: rateLimitHeaders(rate) }
    );
  }

  const results = (await resp.json()) as NominatimResult[];
  const first = results?.[0];
  if (!first) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'No match found in Naga City' } },
      { status: 404, headers: rateLimitHeaders(rate) }
    );
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inBounds(lat, lng)) {
    return NextResponse.json(
      { success: false, error: { code: 'OUT_OF_BOUNDS', message: 'Result outside Naga City bounds' } },
      { status: 400, headers: rateLimitHeaders(rate) }
    );
  }

  const data = { lat, lng, displayName: first.display_name };
  cache.set(cacheKey, data);
  if (cache.size > CACHE_MAX) {
    const firstKey = cache.keys().next().value as string | undefined;
    if (firstKey) cache.delete(firstKey);
  }

  return NextResponse.json({ success: true, data }, { headers: rateLimitHeaders(rate) });
}


