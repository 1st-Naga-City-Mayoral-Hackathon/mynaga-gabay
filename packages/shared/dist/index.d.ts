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

export { API_ENDPOINTS, APP_CONFIG, type ApiError, type ApiResponse, type ChatRequest, type ChatResponse, type ConversationContext, DEFAULT_LANGUAGE, type FacilityType, type HealthFacility, LANGUAGE_GREETINGS, LANGUAGE_NAMES, type Medication, type Message, type MessageMetadata, type MessageRole, type MessageType, type PhilHealthInfo, type PrescriptionData, type RAGSource, SUPPORTED_LANGUAGES, type SupportedLanguage, type User, type UserPreferences, VOICE_CONFIG };
