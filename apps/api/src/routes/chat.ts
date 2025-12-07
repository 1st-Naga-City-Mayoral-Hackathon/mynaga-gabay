import { Router } from 'express';
import {
    createN8nChatService,
    createBikolEnhancer,
    validateInput,
    validateSessionId,
    generateSessionId,
    addHealthDisclaimer,
} from '@mynaga/ai-core';
import type { ChatRequest, ChatResponse, ApiResponse } from '@mynaga/shared';

const router = Router();

// Initialize services
const n8nChatService = createN8nChatService();
const bikolEnhancer = createBikolEnhancer();

/**
 * POST /api/chat
 * Main chat endpoint for Gabay health assistant
 * Uses n8n RAG pipeline for intelligent responses
 */
router.post('/', async (req, res) => {
    const { message, language: langHint, sessionId: providedSessionId }: ChatRequest = req.body;

    // Validate input
    const validation = validateInput(message);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_INPUT', message: validation.error },
        } as ApiResponse<never>);
    }

    // Validate or generate session ID
    const sessionId = providedSessionId && validateSessionId(providedSessionId)
        ? providedSessionId
        : generateSessionId();

    try {
        // Check if n8n service is available
        if (!n8nChatService) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Chat service not configured. Please set N8N_WEBHOOK_URL.',
                },
            } as ApiResponse<never>);
        }

        // Detect language if not provided
        const detectedLanguage = langHint || bikolEnhancer.detectLanguage(validation.sanitizedMessage || message);

        // Call n8n RAG pipeline
        const result = await n8nChatService.chat(
            validation.sanitizedMessage || message,
            sessionId,
            detectedLanguage
        );

        // Optionally enhance English responses with Bikol terms
        let enhancedResponse = result.response;
        if (result.language === 'english') {
            enhancedResponse = bikolEnhancer.enhanceWithBikolTerms(result.response);
        }

        // Add health disclaimer if needed
        enhancedResponse = addHealthDisclaimer(enhancedResponse);

        return res.json({
            success: true,
            data: {
                reply: enhancedResponse,
                language: result.language,
                sessionId: result.sessionId,
                model: result.model,
            },
        } as ApiResponse<ChatResponse>);

    } catch (error) {
        console.error('Chat error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return res.status(500).json({
            success: false,
            error: {
                code: 'CHAT_ERROR',
                message: `Failed to process chat request: ${errorMessage}`,
            },
        } as ApiResponse<never>);
    }
});

/**
 * GET /api/chat/health
 * Health check endpoint for chat service
 */
router.get('/health', async (_req, res) => {
    const n8nHealthy = n8nChatService ? await n8nChatService.healthCheck() : false;

    return res.json({
        success: true,
        data: {
            n8n: n8nHealthy ? 'connected' : 'disconnected',
            bikolEnhancer: 'ready',
            timestamp: new Date().toISOString(),
        },
    });
});

export { router as chatRouter };
