type MessageRole = 'user' | 'assistant' | 'system';
type MessageType = 'text' | 'voice' | 'image';
interface Message {
    id: string;
    role: MessageRole;
    type: MessageType;
    content: string;
    language?: string;
    timestamp: Date;
    metadata?: MessageMetadata;
}
interface MessageMetadata {
    voiceDuration?: number;
    imageUrl?: string;
    prescriptionData?: PrescriptionData;
}
interface PrescriptionData {
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    extractedText?: string;
}
interface ConversationContext {
    messages: Message[];
    userId?: string;
    sessionId: string;
    preferredLanguage: string;
}

interface User {
    id: string;
    email?: string;
    preferredLanguage: string;
    createdAt: Date;
    updatedAt: Date;
}
interface UserPreferences {
    language: string;
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
}

interface HealthFacility {
    id: string;
    name: string;
    type: FacilityType;
    address: string;
    barangay: string;
    city: string;
    phone?: string;
    hours?: string;
    services: string[];
    latitude?: number;
    longitude?: number;
}
type FacilityType = 'hospital' | 'health_center' | 'clinic' | 'pharmacy' | 'birthing_home' | 'diagnostic_center';
interface Medication {
    id: string;
    genericName: string;
    brandNames: string[];
    category: string;
    description: string;
    dosageForms: string[];
    commonUses: string[];
    warnings: string[];
    bikolName?: string;
}
interface PhilHealthInfo {
    category: string;
    coverage: string;
    requirements: string[];
    howToAvail: string[];
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}
interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
interface ChatRequest {
    message: string;
    type: 'text' | 'voice';
    language?: string;
    sessionId?: string;
    context?: string[];
}
interface ChatResponse {
    reply: string;
    language: string;
    sources?: RAGSource[];
    audioUrl?: string;
}
interface RAGSource {
    type: 'medication' | 'facility' | 'philhealth' | 'bikol_phrase';
    title: string;
    relevance: number;
}

/**
 * Structured response types for the Gabay assistant.
 * These types enable rich visual aids (cards, maps) and actions (booking).
 */
interface UserLocation {
    lat?: number;
    lng?: number;
    manualText?: string;
    accuracyMeters?: number;
}
type UrgencyLevel = 'self_care' | 'clinic' | 'er';
interface SafetyInfo {
    disclaimer?: string;
    redFlags?: string[];
    urgency?: UrgencyLevel;
}
type AssistantCard = MedicationCard | FacilityCard | RouteCard | ScheduleCard | BookingCard | PrescriptionCard | MedicationPlanCard;
type PrescriptionConfidence = 'low' | 'medium' | 'high' | 'demo';
interface PrescriptionMedicationItem {
    medicationName: string;
    strength?: string;
    form?: string;
    sig: string;
    prn?: boolean;
    durationDays?: number;
    notes?: string;
    confidence?: PrescriptionConfidence;
}
interface PrescriptionCard {
    cardType: 'prescription';
    title: string;
    demo?: boolean;
    confidence: PrescriptionConfidence;
    patientName?: string;
    age?: number;
    date?: string;
    prescriberName?: string;
    prescriberLicense?: string;
    items: PrescriptionMedicationItem[];
    warnings?: string[];
    needsVerification?: boolean;
}
interface MedicationPlanItem {
    medicationName: string;
    strength?: string;
    form?: string;
    scheduleSummary: string;
    timesOfDay?: string[];
    prn?: boolean;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    notes?: string;
    needsVerification?: boolean;
}
interface MedicationPlanCard {
    cardType: 'medication_plan';
    title: string;
    source: 'prescription_scan' | 'user_entered' | 'assistant_suggested';
    items: MedicationPlanItem[];
    needsVerification?: boolean;
}
interface MedicationCardItem {
    genericName: string;
    brandExamples?: string[];
    why: string;
    howToUseGeneral: string;
    cautions: string[];
    avoidIf: string[];
    whenToSeeDoctor: string;
}
interface MedicationCard {
    cardType: 'medication';
    title: string;
    items: MedicationCardItem[];
    generalDisclaimer: string;
}
interface FacilityCard {
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
interface RouteStep {
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
}
interface RouteCard {
    cardType: 'route';
    from: {
        lat: number;
        lng: number;
        label?: string;
    };
    to: {
        lat: number;
        lng: number;
        label?: string;
    };
    geojsonLine: GeoJSONLineString;
    distanceMeters: number;
    durationSeconds: number;
    steps: RouteStep[];
    profile: 'driving' | 'walking' | 'cycling';
}
interface GeoJSONLineString {
    type: 'LineString';
    coordinates: [number, number][];
}
interface ScheduleSlot {
    slotId: string;
    startTime: string;
    endTime: string;
    available: boolean;
}
interface ScheduleCard {
    cardType: 'schedule';
    facilityId: string;
    facilityName?: string;
    doctorId?: string;
    doctorName?: string;
    humanSummary: string;
    slots: ScheduleSlot[];
}
type BookingStatus = 'proposed' | 'booked' | 'failed' | 'cancelled';
interface BookingCard {
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
type EnvelopeLanguage = 'english' | 'tagalog' | 'bikol' | string;
interface AssistantEnvelope {
    text: string;
    language: EnvelopeLanguage;
    safety: SafetyInfo;
    cards: AssistantCard[];
    sessionId?: string;
    timestamp?: string;
}
interface EnhancedChatRequest {
    message: string;
    language?: string;
    sessionId?: string;
    location?: UserLocation;
    wantsBooking?: boolean;
    context?: string[];
}
interface Doctor {
    id: string;
    name: string;
    specialization: string;
    facilityId: string;
    facilityName?: string;
    photoUrl?: string;
    consultationFee?: number;
}
interface Appointment {
    id: string;
    doctorId: string;
    doctorName?: string;
    facilityId: string;
    facilityName?: string;
    patientName: string;
    patientPhone?: string;
    slotStart: string;
    slotEnd: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
interface CreateAppointmentRequest {
    doctorId: string;
    facilityId: string;
    slotStart: string;
    slotEnd: string;
    patientName: string;
    patientPhone?: string;
    notes?: string;
}
type SyncEventType = 'appointment_created' | 'appointment_cancelled' | 'appointment_updated';
interface SyncOutboxEvent {
    id: string;
    eventType: SyncEventType;
    payload: Record<string, unknown>;
    status: 'pending' | 'synced' | 'failed';
    retryCount: number;
    createdAt: string;
    syncedAt?: string;
    errorMessage?: string;
}
declare function isAssistantEnvelope(obj: unknown): obj is AssistantEnvelope;
declare function isMedicationCard(card: AssistantCard): card is MedicationCard;
declare function isFacilityCard(card: AssistantCard): card is FacilityCard;
declare function isRouteCard(card: AssistantCard): card is RouteCard;
declare function isScheduleCard(card: AssistantCard): card is ScheduleCard;
declare function isBookingCard(card: AssistantCard): card is BookingCard;
declare function isPrescriptionCard(card: AssistantCard): card is PrescriptionCard;
declare function isMedicationPlanCard(card: AssistantCard): card is MedicationPlanCard;

declare const SUPPORTED_LANGUAGES: readonly ["en", "fil", "bcl"];
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
declare const LANGUAGE_NAMES: Record<SupportedLanguage, string>;
declare const DEFAULT_LANGUAGE: SupportedLanguage;
declare const LANGUAGE_GREETINGS: Record<SupportedLanguage, string>;

declare const APP_CONFIG: {
    readonly name: "MyNaga Gabay";
    readonly version: "0.1.0";
    readonly description: "Bikolano Health Assistant for Naga City";
};
declare const API_ENDPOINTS: {
    readonly chat: "/api/chat";
    readonly voice: "/api/voice";
    readonly prescription: "/api/prescription";
    readonly facilities: "/api/facilities";
    readonly health: "/api/health";
};
declare const VOICE_CONFIG: {
    readonly maxDurationSeconds: 60;
    readonly sampleRate: 16000;
    readonly mimeType: "audio/webm";
};

/**
 * Medical Triage Module for Gabay
 *
 * This module provides deterministic symptom assessment and triage logic.
 * It identifies red flags, suggests urgency levels, and provides safe OTC recommendations.
 *
 * IMPORTANT: This is NOT a diagnostic tool. It provides general guidance only.
 */

interface SymptomMatch {
    symptom: string;
    keywords: string[];
    matched: boolean;
}
interface TriageResult {
    detectedSymptoms: string[];
    safety: SafetyInfo;
    medicationCard?: MedicationCard;
    followUpQuestions?: string[];
    facilityType: 'none' | 'pharmacy' | 'clinic' | 'hospital' | 'er';
}
interface SymptomContext {
    duration?: 'acute' | 'prolonged';
    fever?: boolean;
    breathingDifficulty?: boolean;
    chestPain?: boolean;
    bloodInSputum?: boolean;
    pregnant?: boolean;
    childUnder2?: boolean;
    elderly?: boolean;
}
type TriageLanguage = 'english' | 'tagalog' | 'bikol';
/**
 * Detect symptoms from user message
 */
declare function detectSymptoms(message: string): SymptomMatch[];
/**
 * Check for red flags in the message
 */
declare function detectRedFlags(message: string, symptoms: string[]): {
    flags: string[];
    requiresER: boolean;
};
/**
 * Determine urgency level based on symptoms and red flags
 */
declare function determineUrgency(symptoms: string[], redFlags: string[], requiresER: boolean): UrgencyLevel;
/**
 * Get medication recommendations for detected symptoms
 */
declare function getMedicationCard(symptoms: string[]): MedicationCard | undefined;
/**
 * Generate follow-up questions for symptom assessment
 */
declare function getFollowUpQuestions(symptoms: string[]): string[];
/**
 * Generate follow-up questions in a preferred language.
 * Note: We keep questions short and simple for voice-first UX.
 */
declare function getFollowUpQuestionsLocalized(symptoms: string[], language: TriageLanguage): string[];
/**
 * Main triage function - analyzes message and returns triage result
 */
declare function triageMessage(message: string, language?: TriageLanguage): TriageResult;
/**
 * Check if a message contains health-related content
 */
declare function isHealthRelated(message: string): boolean;

export { API_ENDPOINTS, APP_CONFIG, type ApiError, type ApiResponse, type Appointment, type AssistantCard, type AssistantEnvelope, type BookingCard, type BookingStatus, type ChatRequest, type ChatResponse, type ConversationContext, type CreateAppointmentRequest, DEFAULT_LANGUAGE, type Doctor, type EnhancedChatRequest, type EnvelopeLanguage, type FacilityCard, type FacilityType, type GeoJSONLineString, type HealthFacility, LANGUAGE_GREETINGS, LANGUAGE_NAMES, type Medication, type MedicationCard, type MedicationCardItem, type MedicationPlanCard, type MedicationPlanItem, type Message, type MessageMetadata, type MessageRole, type MessageType, type PhilHealthInfo, type PrescriptionCard, type PrescriptionConfidence, type PrescriptionData, type PrescriptionMedicationItem, type RAGSource, type RouteCard, type RouteStep, SUPPORTED_LANGUAGES, type SafetyInfo, type ScheduleCard, type ScheduleSlot, type SupportedLanguage, type SymptomContext, type SymptomMatch, type SyncEventType, type SyncOutboxEvent, type TriageLanguage, type TriageResult, type UrgencyLevel, type User, type UserLocation, type UserPreferences, VOICE_CONFIG, detectRedFlags, detectSymptoms, determineUrgency, getFollowUpQuestions, getFollowUpQuestionsLocalized, getMedicationCard, isAssistantEnvelope, isBookingCard, isFacilityCard, isHealthRelated, isMedicationCard, isMedicationPlanCard, isPrescriptionCard, isRouteCard, isScheduleCard, triageMessage };
