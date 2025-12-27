/**
 * Structured response types for the Gabay assistant.
 * These types enable rich visual aids (cards, maps) and actions (booking).
 */

// ============================================================================
// User Location Types
// ============================================================================

export interface UserLocation {
  lat?: number;
  lng?: number;
  manualText?: string;
  accuracyMeters?: number;
}

// ============================================================================
// Safety & Triage Types
// ============================================================================

export type UrgencyLevel = 'self_care' | 'clinic' | 'er';

export interface SafetyInfo {
  disclaimer?: string;
  redFlags?: string[];
  urgency?: UrgencyLevel;
}

// ============================================================================
// Card Types - Union discriminated by 'cardType'
// ============================================================================

export type AssistantCard =
  | MedicationCard
  | FacilityCard
  | RouteCard
  | ScheduleCard
  | BookingCard
  | PrescriptionCard
  | MedicationPlanCard;

// ============================================================================
// Prescription Scanning (OCR/LLM) Types
// ============================================================================

export type PrescriptionConfidence = 'low' | 'medium' | 'high' | 'demo';

export interface PrescriptionMedicationItem {
  medicationName: string;
  strength?: string; // e.g. "30mg"
  form?: string; // e.g. "Syrup", "Tablet"
  sig: string; // Directions (as written / normalized)
  prn?: boolean; // as needed
  durationDays?: number;
  notes?: string;
  confidence?: PrescriptionConfidence;
}

export interface PrescriptionCard {
  cardType: 'prescription';
  title: string; // e.g. "Prescription scan"
  demo?: boolean;
  confidence: PrescriptionConfidence;

  patientName?: string;
  age?: number;
  date?: string; // ISO date or human string from scan

  prescriberName?: string;
  prescriberLicense?: string;

  items: PrescriptionMedicationItem[];

  warnings?: string[];
  needsVerification?: boolean;
}

// Normalized medication plan suitable for reminders/tracking
export interface MedicationPlanItem {
  medicationName: string;
  strength?: string;
  form?: string;
  scheduleSummary: string; // human summary
  timesOfDay?: string[]; // e.g. ["08:00", "13:00", "18:00"] local time
  prn?: boolean;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  durationDays?: number;
  notes?: string;
  needsVerification?: boolean;
}

export interface MedicationPlanCard {
  cardType: 'medication_plan';
  title: string; // e.g. "Medication plan"
  source: 'prescription_scan' | 'user_entered' | 'assistant_suggested';
  items: MedicationPlanItem[];
  needsVerification?: boolean;
}

// Medication Card
export interface MedicationCardItem {
  genericName: string;
  brandExamples?: string[];
  why: string;
  howToUseGeneral: string;
  cautions: string[];
  avoidIf: string[];
  whenToSeeDoctor: string;
}

export interface MedicationCard {
  cardType: 'medication';
  title: string;
  items: MedicationCardItem[];
  generalDisclaimer: string; // e.g., "General info only; follow label; consult pharmacist/doctor"
}

// Facility Card
export interface FacilityCard {
  cardType: 'facility';
  facilityId: string;
  name: string;
  address: string;
  hours?: string;
  phone?: string;
  services?: string[];
  distanceMeters?: number;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  facilityType?: string;
}

// Route Card (OSM/OSRM routing)
export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteCard {
  cardType: 'route';
  from: { lat: number; lng: number; label?: string };
  to: { lat: number; lng: number; label?: string };
  geojsonLine: GeoJSONLineString;
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  profile: 'driving' | 'walking' | 'cycling';
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat] pairs
}

// Schedule Card
export interface ScheduleSlot {
  slotId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  available: boolean;
}

export interface ScheduleCard {
  cardType: 'schedule';
  facilityId: string;
  facilityName?: string;
  doctorId?: string;
  doctorName?: string;
  humanSummary: string;
  slots: ScheduleSlot[];
}

// Booking Card
export type BookingStatus = 'proposed' | 'booked' | 'failed' | 'cancelled';

export interface BookingCard {
  cardType: 'booking';
  doctorId: string;
  doctorName?: string;
  facilityId: string;
  facilityName?: string;
  selectedSlot?: ScheduleSlot;
  status: BookingStatus;
  appointmentId?: string;
  errorMessage?: string;
}

// ============================================================================
// Assistant Envelope - Main structured response
// ============================================================================

// Language codes used in assistant envelope (full names, not ISO codes)
export type EnvelopeLanguage = 'english' | 'tagalog' | 'bikol' | string;

export interface AssistantEnvelope {
  text: string; // Human-readable response
  language: EnvelopeLanguage;
  safety: SafetyInfo;
  cards: AssistantCard[];
  // Optional metadata
  sessionId?: string;
  timestamp?: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface EnhancedChatRequest {
  message: string;
  language?: string;
  sessionId?: string;
  location?: UserLocation;
  wantsBooking?: boolean;
  context?: string[];
}

// ============================================================================
// Doctor & Appointment Types (for booking feature)
// ============================================================================

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  facilityId: string;
  facilityName?: string;
  photoUrl?: string;
  consultationFee?: number;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName?: string;
  facilityId: string;
  facilityName?: string;
  patientName: string;
  patientPhone?: string;
  slotStart: string; // ISO datetime
  slotEnd: string; // ISO datetime
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  facilityId: string;
  slotStart: string;
  slotEnd: string;
  patientName: string;
  patientPhone?: string;
  notes?: string;
}

// ============================================================================
// Sync Outbox (for hybrid booking with external system sync)
// ============================================================================

export type SyncEventType =
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_updated';

export interface SyncOutboxEvent {
  id: string;
  eventType: SyncEventType;
  payload: Record<string, unknown>;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAssistantEnvelope(obj: unknown): obj is AssistantEnvelope {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.text === 'string' &&
    typeof candidate.language === 'string' &&
    typeof candidate.safety === 'object' &&
    Array.isArray(candidate.cards)
  );
}

export function isMedicationCard(card: AssistantCard): card is MedicationCard {
  return card.cardType === 'medication';
}

export function isFacilityCard(card: AssistantCard): card is FacilityCard {
  return card.cardType === 'facility';
}

export function isRouteCard(card: AssistantCard): card is RouteCard {
  return card.cardType === 'route';
}

export function isScheduleCard(card: AssistantCard): card is ScheduleCard {
  return card.cardType === 'schedule';
}

export function isBookingCard(card: AssistantCard): card is BookingCard {
  return card.cardType === 'booking';
}

export function isPrescriptionCard(card: AssistantCard): card is PrescriptionCard {
  return card.cardType === 'prescription';
}

export function isMedicationPlanCard(card: AssistantCard): card is MedicationPlanCard {
  return card.cardType === 'medication_plan';
}
