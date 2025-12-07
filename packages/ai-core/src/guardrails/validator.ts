/**
 * Chat Input/Output Guardrails
 * Provides validation and safety checks for chat messages
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
    sanitizedMessage?: string;
}

export interface GuardrailOptions {
    maxLength?: number;
    blockProfanity?: boolean;
    healthTopicsOnly?: boolean;
}

const DEFAULT_OPTIONS: GuardrailOptions = {
    maxLength: 500,
    blockProfanity: true,
    healthTopicsOnly: false, // Set to false for general Naga City queries
};

// Basic profanity filter (minimal list, can be extended)
const BLOCKED_WORDS: Set<string> = new Set([
    // Add profanity words as needed - keeping minimal for MVP
]);

// Health/Government related keywords (for topic filtering if enabled)
const ALLOWED_TOPIC_KEYWORDS = new Set([
    // Health
    'hospital', 'clinic', 'doctor', 'nurse', 'medicine', 'pharmacy',
    'health', 'medical', 'emergency', 'ambulance', 'pain', 'sick',
    'fever', 'cough', 'headache', 'vaccine', 'philhealth', 'checkup',
    // Filipino health terms
    'ospital', 'doktor', 'gamot', 'botica', 'sakit', 'lagnat', 'ubo',
    // Bikol health terms
    'ospital', 'doktor', 'bulong', 'botica', 'kalintura', 'ubo', 'kulog',
    // Government
    'permit', 'license', 'government', 'city', 'hall', 'office', 'mayor',
    'barangay', 'service', 'document', 'requirement', 'application',
    // General location
    'naga', 'where', 'how', 'saan', 'haen', 'paano', 'nearest', 'near',
]);

/**
 * Validate chat input message
 */
export function validateInput(
    message: string,
    options: GuardrailOptions = {}
): ValidationResult {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Check for empty message
    if (!message || message.trim().length === 0) {
        return {
            valid: false,
            error: 'Message cannot be empty',
        };
    }

    // Check message length
    if (opts.maxLength && message.length > opts.maxLength) {
        return {
            valid: false,
            error: `Message too long. Maximum ${opts.maxLength} characters allowed.`,
        };
    }

    // Sanitize - remove excessive whitespace
    const sanitized = message.trim().replace(/\s+/g, ' ');

    // Check for blocked words
    if (opts.blockProfanity) {
        const words = sanitized.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (BLOCKED_WORDS.has(word)) {
                return {
                    valid: false,
                    error: 'Message contains inappropriate content',
                };
            }
        }
    }

    // Check for health/government topics only (optional)
    if (opts.healthTopicsOnly) {
        const words = sanitized.toLowerCase().split(/\s+/);
        const hasAllowedTopic = words.some((word) => ALLOWED_TOPIC_KEYWORDS.has(word));

        if (!hasAllowedTopic) {
            return {
                valid: false,
                error: 'Please ask about health services, government offices, or facilities in Naga City.',
            };
        }
    }

    return {
        valid: true,
        sanitizedMessage: sanitized,
    };
}

/**
 * Add health disclaimer to response if needed
 */
export function addHealthDisclaimer(response: string): string {
    // Check if response contains medical advice indicators
    const medicalIndicators = [
        'take', 'dosage', 'mg', 'tablet', 'capsule', 'prescription',
        'treatment', 'diagnos', 'symptom'
    ];

    const hasMedialContent = medicalIndicators.some((indicator) =>
        response.toLowerCase().includes(indicator)
    );

    if (hasMedialContent) {
        const disclaimer = '\n\n⚠️ Disclaimer: This is for informational purposes only. Please consult a healthcare professional for medical advice.';

        // Only add if not already present
        if (!response.includes('Disclaimer')) {
            return response + disclaimer;
        }
    }

    return response;
}

/**
 * Validate session ID format
 */
export function validateSessionId(sessionId: string): boolean {
    // Allow alphanumeric, hyphens, underscores, max 64 chars
    const pattern = /^[a-zA-Z0-9_-]{1,64}$/;
    return pattern.test(sessionId);
}

/**
 * Generate a safe session ID if needed
 */
export function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}
