# Rich Chat Feature Documentation

This document describes the enhanced chatbot output with visual aids, actions, and booking capabilities for MyNaga Gabay.

## Overview

The rich chat feature enhances the assistant's responses with:
- **Medication Cards**: Safe OTC medicine suggestions with cautions
- **Facility Cards**: Nearby health facilities with contact info
- **Route Maps**: OSM-based directions to facilities using Leaflet
- **Schedule Cards**: Doctor availability and appointment slots
- **Booking Cards**: Real appointment booking with confirmation
- **Safety Banners**: Disclaimers and red flag warnings

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Chat.tsx    │  │ Message.tsx │  │ Cards (Medication,      │ │
│  │ (location)  │──│ (parsing)   │──│ Facility, Route, etc.)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ /api/chat
┌──────────────────────────▼──────────────────────────────────────┐
│                     Next.js API Route                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Translation │  │ N8N/LLM     │  │ Chat Orchestrator       │ │
│  │ Service     │──│ Webhook     │──│ (triage + API calls)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      Express API                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ /facilities │  │ /route      │  │ /doctors, /appointments │ │
│  │ (geo search)│  │ (OSRM)      │  │ (booking + sync)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Types

### AssistantEnvelope

The main structured response format:

```typescript
interface AssistantEnvelope {
  text: string;                    // Human-readable response
  language: 'english' | 'tagalog' | 'bikol' | string;
  safety: SafetyInfo;
  cards: AssistantCard[];
  sessionId?: string;
  timestamp?: string;
}
```

### Card Types

1. **MedicationCard** - OTC medicine suggestions
2. **FacilityCard** - Health facility information
3. **RouteCard** - Directions with map data
4. **ScheduleCard** - Doctor availability
5. **BookingCard** - Appointment status

### UserLocation

```typescript
interface UserLocation {
  lat?: number;
  lng?: number;
  manualText?: string;
  accuracyMeters?: number;
}
```

## Security

### Authentication Architecture

The system uses a proxy pattern for secure API access:

```
Browser → Next.js API → Express API
                ↓              ↓
          NextAuth         Internal Key
          Session          + User ID
```

1. **Browser** calls Next.js API routes (e.g., `/api/appointments`)
2. **Next.js** verifies the user session via NextAuth
3. **Next.js** proxies to Express with:
   - `X-Internal-Key`: Shared secret for server-to-server auth
   - `X-User-Id`: Authenticated user's ID
   - `X-User-Email`: (optional) User's email for logging
4. **Express** validates the internal key and trusts the user info

### Booking Authentication

All booking operations require user authentication:

- `GET /api/appointments` - Returns only the authenticated user's appointments
- `POST /api/appointments` - Creates appointment linked to user's ID
- `DELETE /api/appointments/:id` - Only owner can cancel (403 if not owner)

Unauthenticated booking attempts show a sign-in modal in the UI.

### Rate Limiting

In-memory rate limiting protects against abuse:

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| Chat `/api/chat` | 20 requests | 1 minute | userId or IP |
| Booking (IP) | 10 requests | 1 minute | IP |
| Booking (User) | 20 requests | 1 hour | userId |
| Routing (Express) | 30 requests | 1 minute | IP |
| Routing (Debug) | 10 requests | 1 minute | userId |
| Facilities | 60 requests | 1 minute | IP |

The chat endpoint rate limit is the primary protection since it covers:
- LLM API calls
- Internal routing calls
- Facility lookups

For production multi-instance deployments, replace with Redis-backed rate limiting.

### Audit Logging

Security-relevant actions are logged to the `AuditLog` table:

- `appointment_created` - New booking with doctor/facility IDs
- `appointment_cancelled` - Cancellation by user
- `appointment_viewed` - Access to appointment data
- `route_requested` - Routing request (no coordinates stored)
- `auth_failed` - Invalid authentication attempt

Privacy protections:
- IP addresses are masked (e.g., `192.168.xxx.xxx`)
- GPS coordinates are never stored in logs
- Phone numbers are removed, only `hasPhone: true` flag kept

### Routing Privacy (Enhanced)

Routing is computed server-side within the chat flow:

```
Browser → /api/chat → Chat Orchestrator → Express /api/route → OSRM
                              ↓
                       RouteCard in AssistantEnvelope
```

1. **Browser never calls routing directly** - No `/api/route` calls from client code
2. **Chat orchestrator fetches routes** - During `/api/chat`, the orchestrator calls Express with internal auth
3. **Routes emitted in AssistantEnvelope** - RouteCard is included in the structured response
4. **Express validates coordinates** - Must be within Naga City bounds
5. **No GPS in audit logs** - Only profile and distance are logged

The Next.js `/api/route` endpoint exists only for debugging:
- Requires NextAuth authentication
- Rate limited (10 requests/minute)
- Not used by production client code

### Input Validation

All API inputs are validated:

- UUIDs: Format validation for IDs
- Dates: ISO 8601 format validation
- Coordinates: Bounds checking (Naga City area)
- Profile: Whitelist validation (driving/walking/cycling)

## Environment Variables

Add these to your `.env` file:

```env
# Express API URL (for Next.js to call)
EXPRESS_API_URL=http://localhost:4000

# Internal API Key (shared secret for Next.js → Express auth)
# Generate with: openssl rand -base64 32
INTERNAL_API_KEY=your-secure-internal-key-here

# OSRM Routing Server (public default, or self-hosted)
OSRM_BASE_URL=https://router.project-osrm.org

# OSRM Profile Names (optional, for custom OSRM instances)
# OSRM_DRIVING_PROFILE=driving
# OSRM_WALKING_PROFILE=foot
# OSRM_CYCLING_PROFILE=cycling

# Database for booking persistence (apps/api)
API_DATABASE_URL=postgresql://user:pass@localhost:5432/mynaga_api
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client (apps/api)

```bash
cd apps/api
npx prisma generate
npx prisma db push  # For development
# OR
npx prisma migrate dev  # For production
```

### 3. Seed Database

```bash
cd apps/api
npm run db:seed
```

### 4. Run Development Servers

```bash
# Terminal 1: Web (Next.js)
npm run dev:web

# Terminal 2: API (Express)
npm run dev:api
```

## API Endpoints

### Facilities

```
GET /api/facilities
  ?nearLat=13.62&nearLng=123.19  # Geo search center
  &radiusMeters=5000             # Search radius (default 5000)
  &type=hospital                 # Filter by type
  &limit=10                      # Max results

GET /api/facilities/:id
```

### Routing

```
GET /api/route
  ?fromLat=13.62&fromLng=123.19  # Origin
  &toLat=13.63&toLng=123.20      # Destination
  &profile=driving               # driving|walking|cycling
```

### Doctors

```
GET /api/doctors
  ?facilityId=...                # Filter by facility
  &specialization=...            # Filter by specialty

GET /api/doctors/:id

GET /api/doctors/:id/availability
  ?from=2024-01-15               # Start date
  &to=2024-01-22                 # End date
```

### Appointments (Authentication Required)

All appointment endpoints require authentication via NextAuth session.
The Next.js proxy routes (`/api/appointments/*`) handle session verification.

```
POST /api/appointments
  Headers: Session cookie (automatic via Next.js)
  Body: { doctorId, facilityId, slotStart, slotEnd, patientName, patientPhone?, notes? }

GET /api/appointments
  Returns: Current user's appointments only (no lookup by phone)

GET /api/appointments/:id
  Returns: Appointment details (403 if not owner)

DELETE /api/appointments/:id
  Returns: Cancellation confirmation (403 if not owner)
```

### Routing (Chat Flow Only)

Routing is computed automatically during `/api/chat` when health symptoms are detected.
The RouteCard is included in the AssistantEnvelope response.

**Express API (Internal Only)**
```
GET /api/route
  Headers: X-Internal-Key (required)
  Query: fromLat, fromLng, toLat, toLng, profile (driving|walking|cycling)
  Validation: Coordinates must be within Naga City bounds
  Called by: Chat orchestrator only
```

**Debug Endpoint (Auth Required)**
```
GET /api/route (Next.js)
  Requires: NextAuth session
  Rate limited: 10 requests/minute
  Purpose: Development/testing only
  NOT for production client use
```

### Sync (for external system integration)

```
GET /api/appointments/sync/pending    # Get pending sync events
POST /api/appointments/sync/:id/ack   # Acknowledge synced event
```

## Demo Script

### Example 1: Cough Symptom

**User says:** "I have a cough"

**Expected response:**
1. **SafetyBanner** with self-care guidance
2. **Text response** from LLM with advice
3. **MedicationCard** with OTC options:
   - Dextromethorphan (Robitussin DM)
   - Guaifenesin (Mucinex)
   - Honey and Lemon
4. **FacilityCard** showing nearest clinic/health center
5. **RouteCard** with map and directions
6. **ScheduleCard** with available appointment slots

### Example 2: Emergency (Red Flags)

**User says:** "I'm coughing blood and having difficulty breathing"

**Expected response:**
1. **SafetyBanner** (RED - ER urgency):
   - Warning about blood in sputum
   - Warning about difficulty breathing
   - "Seek immediate medical attention"
2. **Text response** urging immediate ER visit
3. **FacilityCard** for nearest hospital (not clinic)
4. **RouteCard** with driving directions to ER
5. **NO MedicationCard** (not appropriate for emergency)

### Example 3: General Question

**User says:** "What are the operating hours of Bicol Medical Center?"

**Expected response:**
- Plain text response (no cards, not a symptom)

## Triage Logic

The triage module (`packages/shared/src/triage/`) uses deterministic pattern matching:

### Symptom Detection
- Keywords in English, Filipino, and Bikol
- Categories: cough, fever, headache, stomachache, diarrhea, cold

### Red Flag Detection
- Blood in sputum
- Difficulty breathing
- Chest pain
- Very high fever (40°C+)
- Pregnancy
- Infants under 2 years

### Urgency Levels
1. **self_care** - OTC suggestions + clinic recommendation
2. **clinic** - Red flags present, see doctor soon
3. **er** - Emergency, go to ER immediately

## Medical Safety

The system follows these safety principles:

1. **Never diagnose** - Only provide general information
2. **Always disclaim** - Every medication card includes disclaimers
3. **Escalate red flags** - Serious symptoms trigger ER guidance
4. **Consult professional** - Always recommend doctor/pharmacist

## MVP Decisions

The following MVP decisions were made:

1. **Location**: GPS preferred, manual barangay fallback (no geocoding)
2. **Routing**: Public OSRM endpoint (configurable for self-hosted)
3. **Booking**: In-app is source of truth with sync outbox for future integration
4. **Triage**: Deterministic (no LLM) for consistency and safety
5. **Facilities**: Seeded data with real Naga City locations

## Testing

Run tests:

```bash
# From packages/shared
npm test

# Specific test file
npx vitest run src/triage/triage.test.ts
```

## Files Changed/Added

### New Files

**packages/shared/src/types/assistant.ts**
- AssistantEnvelope, card types, type guards

**packages/shared/src/triage/index.ts**
- Symptom detection, red flags, triage logic

**apps/api/prisma/schema.prisma**
- Facility, Doctor, AvailabilitySlot, Appointment, SyncOutboxEvent, AuditLog

**apps/api/prisma/seed.ts**
- Database seed with Naga City facilities

**apps/api/src/lib/prisma.ts**
- Prisma client singleton

**apps/api/src/middleware/internalAuth.ts**
- Internal API key authentication middleware

**apps/api/src/middleware/rateLimit.ts**
- In-memory rate limiting middleware

**apps/api/src/services/auditLog.ts**
- Audit logging with IP masking and metadata sanitization

**apps/api/src/routes/routing.ts**
- OSRM-based routing with bounds validation

**apps/api/src/routes/doctors.ts**
- Doctor listing and availability

**apps/api/src/routes/appointments.ts**
- Secure booking with user ownership

**apps/web/src/lib/chat-orchestrator.ts**
- Response composition logic

**apps/web/src/lib/express-api.ts**
- Express API client with internal auth

**apps/web/src/lib/rate-limit.ts**
- In-memory rate limiter for Next.js API routes

**apps/web/src/app/api/appointments/route.ts**
- Authenticated appointment proxy (GET/POST)

**apps/web/src/app/api/appointments/[id]/route.ts**
- Authenticated single appointment proxy (GET/DELETE)

**apps/web/src/app/api/route/route.ts**
- Debug-only routing proxy (auth required)

**apps/web/src/app/api/chat/route.ts**
- Added rate limiting (20 requests/minute)

**apps/web/src/components/ui/dialog.tsx**
- Dialog/modal component

**apps/web/src/components/chat/BookingModal.tsx**
- Auth-aware booking modal with sign-in prompt

**apps/web/src/components/chat/cards/*.tsx**
- MedicationCardUI, FacilityCardUI, RouteMapCard (with fallback), ScheduleCardUI, BookingCardUI, SafetyBanner

**apps/web/src/components/chat/LocationCapture.tsx**
- GPS and manual location capture

### Modified Files

**packages/shared/src/index.ts**
- Export new types and triage module

**apps/api/package.json**
- Added Prisma dependencies

**apps/api/src/index.ts**
- Registered new routes

**apps/api/src/routes/facilities.ts**
- Added geo search, Prisma integration

**apps/web/package.json**
- Added Leaflet, react-leaflet, @types/leaflet

**apps/web/src/app/api/chat/route.ts**
- Added orchestration, location handling

**apps/web/src/components/chat/Chat.tsx**
- Added location state, envelope handling

**apps/web/src/components/chat/Message.tsx**
- Added card rendering

## Future Improvements

1. **Geocoding**: Convert manual addresses to coordinates
2. **Real-time slots**: Live availability from clinic systems
3. **SMS notifications**: Appointment reminders
4. **Multi-language cards**: Translate card content
5. **Offline support**: Cache facilities for offline access
