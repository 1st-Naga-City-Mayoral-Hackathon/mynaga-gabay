export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType = 'text' | 'voice' | 'image';

export interface Message {
    id: string;
    role: MessageRole;
    type: MessageType;
    content: string;
    language?: string;
    timestamp: Date;
    metadata?: MessageMetadata;
}

export interface MessageMetadata {
    voiceDuration?: number;
    imageUrl?: string;
    prescriptionData?: PrescriptionData;
}

export interface PrescriptionData {
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    extractedText?: string;
}

export interface ConversationContext {
    messages: Message[];
    userId?: string;
    sessionId: string;
    preferredLanguage: string;
}
