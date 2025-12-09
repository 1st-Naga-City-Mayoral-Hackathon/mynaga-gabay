/**
 * TTS (Text-to-Speech) Route
 * Proxies requests to the Python TTS service running on port 8001
 */

import { Router, Request, Response } from 'express';

export const ttsRouter = Router();

const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://localhost:8001';

interface TTSRequestBody {
    text: string;
    language?: 'bcl' | 'fil' | 'eng';
}

/**
 * POST /api/tts
 * Convert text to speech audio
 */
ttsRouter.post('/', async (req: Request<object, object, TTSRequestBody>, res: Response) => {
    try {
        const { text, language = 'bcl' } = req.body;

        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: 'Text is required' });
            return;
        }

        if (text.length > 5000) {
            res.status(400).json({ error: 'Text too long (max 5000 characters)' });
            return;
        }

        console.log(`[TTS] Synthesizing: lang=${language}, text="${text.substring(0, 50)}..."`);

        // Forward request to Python TTS service
        const response = await fetch(`${TTS_SERVICE_URL}/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, language }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`[TTS] Python service error: ${error}`);
            res.status(response.status).json({
                error: 'TTS service error',
                details: error
            });
            return;
        }

        // Get audio buffer from response
        const audioBuffer = await response.arrayBuffer();

        // Send audio response
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Content-Disposition': 'attachment; filename="speech.wav"',
        });

        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('[TTS] Error:', error);

        // Check if it's a connection error to the Python service
        if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
            res.status(503).json({
                error: 'TTS service unavailable',
                message: 'The TTS service is not running. Start it with: cd packages/ai && python src/tts_service.py'
            });
            return;
        }

        res.status(500).json({
            error: 'Failed to synthesize speech',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/tts/health
 * Check TTS service health
 */
ttsRouter.get('/health', async (_req: Request, res: Response) => {
    try {
        const response = await fetch(`${TTS_SERVICE_URL}/health`);

        if (!response.ok) {
            res.status(503).json({
                status: 'unhealthy',
                error: 'TTS service returned error'
            });
            return;
        }

        const health = await response.json();
        res.json({
            status: 'healthy',
            ttsService: health,
        });

    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Cannot connect to TTS service',
            message: 'Start the TTS service with: cd packages/ai && python src/tts_service.py'
        });
    }
});
