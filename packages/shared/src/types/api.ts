export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ChatRequest {
    message: string;
    type: 'text' | 'voice';
    language?: string;
    sessionId?: string;
    context?: string[];
}

export interface ChatResponse {
    reply: string;
    language: string;
    sources?: RAGSource[];
    audioUrl?: string;
}

export interface RAGSource {
    type: 'medication' | 'facility' | 'philhealth' | 'bikol_phrase';
    title: string;
    relevance: number;
}
