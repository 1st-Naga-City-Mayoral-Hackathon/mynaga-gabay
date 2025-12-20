import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Need nodejs for form data handling

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || '';

export async function POST(req: NextRequest) {
    try {
        // Get form data from request
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File | null;
        const language = (formData.get('language') as string) || 'bcl';

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        console.log(`[STT] Transcribing: lang=${language}, file=${audioFile.name}, size=${audioFile.size}`);

        // Forward to Python AI service
        const aiFormData = new FormData();
        aiFormData.append('audio', audioFile);
        aiFormData.append('language', language);

        const response = await fetch(`${AI_SERVICE_URL}/stt`, {
            method: 'POST',
            headers: {
                ...(AI_SERVICE_API_KEY ? { 'X-AI-KEY': AI_SERVICE_API_KEY } : {}),
            },
            body: aiFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`[STT] AI service error: ${error}`);
            return NextResponse.json(
                { error: 'STT service error', details: error },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`[STT] Result: "${result.text?.substring(0, 50)}..."`);

        return NextResponse.json(result);

    } catch (error) {
        console.error('[STT] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
            return NextResponse.json(
                {
                    error: 'STT service unavailable',
                    message: 'The AI service is not running. Start it with: cd packages/ai && python src/ai_service.py'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to transcribe speech', message: errorMessage },
            { status: 500 }
        );
    }
}
