import { NextRequest } from 'next/server';

export const runtime = 'edge';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://cob-n8n-primary-production.up.railway.app/webhook/mynaga-gabay-chat';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Timeouts
const TRANSLATE_TIMEOUT_MS = 30000; // 30 seconds for translation
const LLM_TIMEOUT_MS = 60000; // 60 seconds for LLM

// Map UI language codes to translation service codes
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
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Translate text using AI service with timeout
 */
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Skip if same language
    if (sourceLang === targetLang) {
        return text;
    }

    try {
        console.log(`[Translate] ${sourceLang} → ${targetLang}: "${text.substring(0, 30)}..."`);

        const response = await fetchWithTimeout(
            `${AI_SERVICE_URL}/translate`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    source_lang: sourceLang,
                    target_lang: targetLang,
                }),
            },
            TRANSLATE_TIMEOUT_MS
        );

        if (!response.ok) {
            console.error(`[Translate] Error: ${response.status}`);
            return text; // Return original on error
        }

        const data = await response.json() as { text: string };
        console.log(`[Translate] Result: "${data.text.substring(0, 30)}..."`);
        return data.text;
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.error('[Translate] Timeout - returning original text');
        } else {
            console.error('[Translate] Failed:', err);
        }
        return text; // Return original on error
    }
}

/**
 * Normalize language code
 */
function normalizeLanguage(language: string | undefined): string {
    if (!language) return 'english';
    const normalized = LANGUAGE_MAP[language.toLowerCase()];
    return normalized || 'english';
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
        const userLanguage = normalizeLanguage(language);

        console.log(`[Chat API] User language: ${language} → ${userLanguage}`);

        // ============================================
        // Step 1: Translate user message to English (with fallback)
        // ============================================
        let englishInput = userMessage;
        if (userLanguage !== 'english') {
            englishInput = await translateText(userMessage, userLanguage, 'english');
        }

        // ============================================
        // Step 2: Call n8n with English message
        // ============================================
        const sessionId = `web-${Date.now()}`;

        console.log(`[Chat API] Calling LLM: "${englishInput.substring(0, 50)}..."`);

        let llmResponse: string;
        try {
            const response = await fetchWithTimeout(
                N8N_WEBHOOK_URL,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: englishInput,
                        sessionId,
                        language: 'english', // Always send English to LLM
                    }),
                },
                LLM_TIMEOUT_MS
            );

            if (!response.ok) {
                throw new Error(`N8N error: ${response.status}`);
            }

            const responseText = await response.text();
            console.log(`[Chat API] Raw LLM response (${responseText.length} chars): "${responseText.substring(0, 100)}"`);

            // Check for empty response
            if (!responseText || responseText.trim() === '') {
                console.error('[Chat API] n8n returned empty response');
                llmResponse = 'Sorry, I could not get a response. Please try again.';
            } else {
                // Try to parse JSON
                try {
                    const data = JSON.parse(responseText) as { response?: string };
                    llmResponse = data.response || 'Sorry, I could not process your request.';
                } catch {
                    // If not JSON, use raw text
                    llmResponse = responseText;
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.error('[Chat API] LLM timeout');
                llmResponse = 'Sorry, the request took too long. Please try again.';
            } else {
                throw err;
            }
        }

        console.log(`[Chat API] LLM response: "${llmResponse.substring(0, 50)}..."`);

        // ============================================
        // Step 3: Translate response to user's language (with fallback)
        // ============================================
        let finalResponse = llmResponse;
        if (userLanguage !== 'english') {
            finalResponse = await translateText(llmResponse, 'english', userLanguage);
        }

        // Return as SSE stream format compatible with AI SDK useChat
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                const sseData = `0:${JSON.stringify(finalResponse)}\n`;
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
