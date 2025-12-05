export const APP_CONFIG = {
    name: 'MyNaga Gabay',
    version: '0.1.0',
    description: 'Bikolano Health Assistant for Naga City',
} as const;

export const API_ENDPOINTS = {
    chat: '/api/chat',
    voice: '/api/voice',
    prescription: '/api/prescription',
    facilities: '/api/facilities',
    health: '/api/health',
} as const;

export const VOICE_CONFIG = {
    maxDurationSeconds: 60,
    sampleRate: 16000,
    mimeType: 'audio/webm',
} as const;
