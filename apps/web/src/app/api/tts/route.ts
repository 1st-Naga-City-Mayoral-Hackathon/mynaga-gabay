import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TTS_SERVICE_URL =
  process.env.TTS_SERVICE_URL || process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || '';
const TTS_TIMEOUT_MS = 25000; // keep below Edge timeout to avoid Vercel 504

export async function POST(req: NextRequest) {
    try {
        const { text, language = 'bcl' } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text too long (max 5000 characters)' },
                { status: 400 }
            );
        }

        console.log(`[TTS] Synthesizing: lang=${language}, text="${text.substring(0, 50)}..."`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TTS_TIMEOUT_MS);

        // Forward request to Python TTS service
        const response = await fetch(
          `${TTS_SERVICE_URL}/tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(AI_SERVICE_API_KEY ? { 'X-AI-KEY': AI_SERVICE_API_KEY } : {}),
            },
            body: JSON.stringify({ text, language }),
            signal: controller.signal,
          }
        ).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            const error = await response.text();
            console.error(`[TTS] Python service error: ${error}`);
            return NextResponse.json(
                { error: 'TTS service error', details: error },
                { status: response.status }
            );
        }

        // Get audio buffer from response
        const audioBuffer = await response.arrayBuffer();

        // Return audio response
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Content-Disposition': 'attachment; filename="speech.wav"',
            },
        });

    } catch (error) {
        console.error('[TTS] Error:', error);

        // Check if it's a connection error to the Python service
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (error instanceof Error && error.name === 'AbortError') {
          return NextResponse.json(
            {
              error: 'TTS request timed out',
              message:
                'The AI service may be cold-starting or loading models. Try again, or preload models on Railway.',
            },
            { status: 504 }
          );
        }

        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
            return NextResponse.json(
                {
                    error: 'TTS service unavailable',
                    message:
                      'The AI service is not reachable. Ensure TTS_SERVICE_URL or AI_SERVICE_URL is set and the Railway service is running.',
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to synthesize speech', message: errorMessage },
            { status: 500 }
        );
    }
}
