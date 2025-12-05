import { Router } from 'express';
import { createClaudeClient, RAGService, GABAY_SYSTEM_PROMPT } from '@mynaga/ai-core';
import type { ChatRequest, ChatResponse, ApiResponse } from '@mynaga/shared';

const router = Router();

// Initialize Claude client
const claudeClient = process.env.CLAUDE_API_KEY
    ? createClaudeClient(process.env.CLAUDE_API_KEY)
    : null;

// Initialize RAG service with PostgreSQL
const ragService = process.env.DATABASE_URL
    ? new RAGService({
        connectionString: process.env.DATABASE_URL,
    })
    : null;

/**
 * POST /api/chat
 * Main chat endpoint for Gabay health assistant
 */
router.post('/', async (req, res) => {
    const { message, language = 'fil' }: ChatRequest = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_MESSAGE', message: 'Message is required' },
        } as ApiResponse<never>);
    }

    try {
        // Get RAG context if available
        let ragContext = '';
        if (ragService) {
            const results = await ragService.search(message);
            ragContext = ragService.buildContext(results);
        }

        // Generate response with Claude
        if (!claudeClient) {
            // Fallback when Claude is not configured
            return res.json({
                success: true,
                data: {
                    reply: language === 'bcl'
                        ? 'Pasensya na, dai pa konektado an AI. Mag-configure nin CLAUDE_API_KEY.'
                        : 'Pasensya, hindi pa konektado ang AI. I-configure ang CLAUDE_API_KEY.',
                    language,
                },
            } as ApiResponse<ChatResponse>);
        }

        const reply = await claudeClient.chat(message, undefined, ragContext);

        return res.json({
            success: true,
            data: {
                reply,
                language,
                sources: ragService ? ragService.toSources(await ragService.search(message)) : [],
            },
        } as ApiResponse<ChatResponse>);

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CHAT_ERROR',
                message: 'Failed to process chat request'
            },
        } as ApiResponse<never>);
    }
});

export { router as chatRouter };
