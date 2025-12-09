import { NextRequest } from 'next/server';

export const runtime = 'edge';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://cob-n8n-primary-production.up.railway.app/webhook/mynaga-gabay-chat';

// Language detection indicators
const BIKOL_INDICATORS = ['daw', 'baga', 'ta', 'digdi', 'saimo', 'sakuya', 'harong', 'kaini', 'maray', 'tabi', 'siring', 'haen', 'pano', 'dai', 'iyo', 'bako', 'saro', 'asin', 'kan', 'nin', 'an', 'si', 'gabos'];
const TAGALOG_INDICATORS = ['ang', 'ng', 'mga', 'sa', 'na', 'ko', 'mo', 'siya', 'niya', 'kami', 'kayo', 'sila', 'ano', 'paano', 'saan', 'bakit', 'sino', 'ako', 'ikaw'];
const ENGLISH_INDICATORS = ['the', 'is', 'are', 'what', 'where', 'how', 'can', 'do', 'does', 'have', 'has', 'will', 'would', 'could', 'should', 'please', 'help', 'need', 'want', 'hello', 'hi', 'i', 'you', 'we'];

// Map UI language codes to n8n expected values
const LANGUAGE_MAP: Record<string, string> = {
    'en': 'english',
    'eng': 'english',
    'english': 'english',
    'fil': 'tagalog',
    'tagalog': 'tagalog',
    'filipino': 'tagalog',
    'bcl': 'bikol',
    'bikol': 'bikol',
    'bikolano': 'bikol',
};

/**
 * Detect language from message content
 */
function detectLanguage(message: string): string {
    const lowerMsg = message.toLowerCase();
    const words = lowerMsg.split(/\s+/);

    const bikolScore = BIKOL_INDICATORS.filter(w => words.includes(w)).length;
    const tagalogScore = TAGALOG_INDICATORS.filter(w => words.includes(w)).length;
    const englishScore = ENGLISH_INDICATORS.filter(w => words.includes(w)).length;

    if (bikolScore > 0 && bikolScore >= tagalogScore && bikolScore >= englishScore) {
        return 'bikol';
    } else if (tagalogScore > englishScore) {
        return 'tagalog';
    } else {
        return 'english';
    }
}

/**
 * Normalize language code to n8n expected format
 */
function normalizeLanguage(language: string | undefined, message: string): string {
    // If no language or auto, detect from message
    if (!language || language === 'auto') {
        return detectLanguage(message);
    }

    // Map known language codes
    const normalized = LANGUAGE_MAP[language.toLowerCase()];
    if (normalized) {
        return normalized;
    }

    // Fallback to detection
    return detectLanguage(message);
}

export async function POST(req: NextRequest) {
    try {
        const { messages, language } = await req.json();

        // Get the last user message
        const lastMessage = messages?.[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return new Response(
                JSON.stringify({ error: 'No user message provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const userMessage = lastMessage.content;

        // Generate a session ID from the request
        const sessionId = `web-${Date.now()}`;

        // Normalize and detect language in the API route (not n8n)
        const normalizedLanguage = normalizeLanguage(language, userMessage);

        console.log(`[Chat API] Language: ${language} → ${normalizedLanguage}, Message: "${userMessage.substring(0, 50)}..."`);

        // Call n8n RAG pipeline with normalized language
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                sessionId,
                language: normalizedLanguage, // Already normalized
            }),
        });

        if (!response.ok) {
            throw new Error(`N8N error: ${response.status}`);
        }

        const data = await response.json() as { response?: string };
        const text = data.response || 'Pasensya, may problema sa sistema.';

        // Return as SSE stream format compatible with AI SDK useChat
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                const sseData = `0:${JSON.stringify(text)}\n`;
                controller.enqueue(encoder.encode(sseData));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);

        // Return error in SSE format
        const encoder = new TextEncoder();
        const errorMessage = 'Pasensya, may problema sa koneksyon. Subukan ulit.';
        const stream = new ReadableStream({
            start(controller) {
                const sseData = `0:${JSON.stringify(errorMessage)}\n`;
                controller.enqueue(encoder.encode(sseData));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
            },
        });
    }
}
