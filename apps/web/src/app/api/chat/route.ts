import { NextRequest, NextResponse } from 'next/server';
import type { UserLocation, AssistantEnvelope } from '@mynaga/shared';
import { orchestrateResponse, shouldOrchestrate } from '@/lib/chat-orchestrator';
import { checkRateLimit, rateLimitHeaders, CHAT_RATE_LIMIT } from '@/lib/rate-limit';

// Node runtime to avoid Edge 25s timeout (n8n/LLM calls can exceed this)
export const runtime = 'nodejs';
export const maxDuration = 60;

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://cob-n8n-primary-production.up.railway.app/webhook/mynaga-gabay-chat';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || '';

// Timeouts
const TRANSLATE_TIMEOUT_MS = 30000; // 30 seconds for translation
const LLM_TIMEOUT_MS = 60000; // 60 seconds for LLM

// Small in-memory cache to reduce repeated translation latency (best-effort per instance).
// Note: Serverless instances are ephemeral; this cache is not guaranteed.
const TRANSLATION_CACHE_MAX = 200;
const translationCache = new Map<string, string>();

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
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; ok: boolean }> {
    // Skip if same language
    if (sourceLang === targetLang) {
        return { text, ok: true };
    }

    const cacheKey = `${sourceLang}→${targetLang}:${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return { text: cached, ok: true };
    }

    try {
        console.log(`[Translate] ${sourceLang} → ${targetLang}: "${text.substring(0, 30)}..."`);

        const response = await fetchWithTimeout(
            `${AI_SERVICE_URL}/translate`,
            {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(AI_SERVICE_API_KEY ? { 'X-AI-KEY': AI_SERVICE_API_KEY } : {}),
                },
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
            return { text, ok: false }; // Return original on error
        }

        const data = await response.json() as { text: string };
        console.log(`[Translate] Result: "${data.text.substring(0, 30)}..."`);

        translationCache.set(cacheKey, data.text);
        // Basic eviction (FIFO-ish)
        if (translationCache.size > TRANSLATION_CACHE_MAX) {
          const firstKey = translationCache.keys().next().value as string | undefined;
          if (firstKey) translationCache.delete(firstKey);
        }

        return { text: data.text, ok: true };
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.error('[Translate] Timeout - returning original text');
        } else {
            console.error('[Translate] Failed:', err);
        }
        return { text, ok: false }; // Return original on error
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

/**
 * Request body type
 */
interface ChatRequestBody {
    messages: Array<{ role: string; content: string }>;
    language?: string;
    location?: UserLocation;
    wantsBooking?: boolean;
    hasImageAttachment?: boolean;
}

export async function POST(req: NextRequest) {
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(req, CHAT_RATE_LIMIT);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                success: false,
                error: rateLimitResult.error,
            },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimitResult),
            }
        );
    }

    try {
        const body: ChatRequestBody = await req.json();
        const { messages, language, location, wantsBooking, hasImageAttachment } = body;

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
        console.log(`[Chat API] Location:`, location);

        // ============================================
        // Demo prescription scanner short-circuit
        // ============================================
        // Demo scanner is enabled if explicitly true, OR by default in non-production.
        // In non-production you can disable by setting DEMO_PRESCRIPTION_SCANNER=false.
        const demoFlag = (process.env.DEMO_PRESCRIPTION_SCANNER || '').toLowerCase();
        const demoPrescriptionEnabled =
          demoFlag === 'true' || (process.env.NODE_ENV !== 'production' && demoFlag !== 'false');

        if (demoPrescriptionEnabled && hasImageAttachment) {
          const todayIso = new Date().toISOString().slice(0, 10);
          const demoEnvelope: AssistantEnvelope = {
            text: `Demo prescription scan result (simulated). Please verify the details with your doctor/pharmacist before following any instructions.`,
            language: userLanguage,
            safety: {
              disclaimer:
                'This is a demo scan and not a medical diagnosis. Prescriptions can be misread. Please confirm medicine name, strength, and dosage with a pharmacist/doctor. If you have severe breathing difficulty, chest pain, confusion, or worsening symptoms, seek urgent care.',
              urgency: 'clinic',
            },
            cards: [
              {
                cardType: 'prescription',
                title: 'Prescription scan (demo)',
                demo: true,
                confidence: 'demo',
                patientName: 'Juan Dela Cruz',
                date: 'December 22, 2024',
                age: 35,
                prescriberName: 'Dr. Maria Santos, MD',
                prescriberLicense: '12345678',
                needsVerification: true,
                items: [
                  {
                    medicationName: 'Ambroxol',
                    strength: '30mg',
                    form: 'Syrup',
                    sig: '1 tablespoon 3x a day after meals x 5 days',
                    durationDays: 5,
                    confidence: 'demo',
                  },
                  {
                    medicationName: 'Salbutamol',
                    strength: '2mg',
                    form: 'Tablet',
                    sig: '1 tab 3x a day as needed for cough',
                    prn: true,
                    confidence: 'demo',
                  },
                ],
                warnings: [
                  'Verify drug name/strength and directions before taking.',
                  'If you have allergies, pregnancy, heart disease, or other conditions, confirm safety first.',
                ],
              },
              {
                cardType: 'medication_plan',
                title: 'Medication plan (demo)',
                source: 'prescription_scan',
                needsVerification: true,
                items: [
                  {
                    medicationName: 'Ambroxol',
                    strength: '30mg',
                    form: 'Syrup',
                    scheduleSummary: '1 tablespoon, 3x/day after meals for 5 days',
                    timesOfDay: ['08:00', '13:00', '18:00'],
                    startDate: todayIso,
                    durationDays: 5,
                    needsVerification: true,
                  },
                  {
                    medicationName: 'Salbutamol',
                    strength: '2mg',
                    form: 'Tablet',
                    scheduleSummary: '1 tablet, up to 3x/day as needed for cough (PRN)',
                    prn: true,
                    needsVerification: true,
                  },
                ],
              },
            ],
            timestamp: new Date().toISOString(),
          };

          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const sseData = `0:${JSON.stringify(demoEnvelope)}\n`;
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
        }

        // ============================================
        // Step 1: Translate user message to English (with fallback)
        //
        // Strategy:
        // - Bikol: ALWAYS translate to English for better LLM quality, then translate back.
        // - Tagalog: Default to NO translation (LLM responds directly in Tagalog) for lower latency.
        // - English: no translation.
        // ============================================
        let messageForLLM = userMessage;
        let llmLanguage = userLanguage;
        let usedTranslationToEnglish = false;

        const shouldTranslateToEnglish =
          userLanguage === 'bikol' ? true : userLanguage === 'tagalog' ? false : userLanguage !== 'english';

        if (shouldTranslateToEnglish) {
          const translated = await translateText(userMessage, userLanguage, 'english');
          if (translated.ok) {
            messageForLLM = translated.text;
            llmLanguage = 'english';
            usedTranslationToEnglish = true;
          } else {
            // Translation service unavailable (common on Vercel if AI service isn't deployed).
            // Fall back to sending the original message and ask the LLM to respond in the user's language.
            messageForLLM = userMessage;
            llmLanguage = userLanguage;
          }
        }

        // ============================================
        // Step 2: Call n8n with English message
        // ============================================
        const sessionId = `web-${Date.now()}`;

        // Strongly enforce response language even if the user's input text is in a different language.
        // This matters in production when translation is unavailable (no Python service).
        const languageInstruction =
          llmLanguage === 'english'
            ? 'Please reply in English.'
            : llmLanguage === 'tagalog'
              ? 'Paki-sagot sa Filipino/Tagalog.'
              : llmLanguage === 'bikol'
                ? 'Paki-sagot sa Bikol.'
                : '';

        const llmMessage = languageInstruction
          ? `${languageInstruction}\n\n${messageForLLM}`
          : messageForLLM;

        console.log(`[Chat API] Calling LLM (${llmLanguage}): "${llmMessage.substring(0, 50)}..."`);

        let llmResponse: string;
        try {
            const response = await fetchWithTimeout(
                N8N_WEBHOOK_URL,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: llmMessage,
                        sessionId,
                        language: llmLanguage,
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
        // Only translate back if we actually translated the user message to English.
        // If translation was unavailable, we already asked the LLM to answer in the user's language.
        if (userLanguage !== 'english' && usedTranslationToEnglish) {
          const translatedBack = await translateText(llmResponse, 'english', userLanguage);
          finalResponse = translatedBack.text;
        }

        // ============================================
        // Step 4: Orchestrate structured response (cards, facilities, routes)
        // ============================================
        let envelope: AssistantEnvelope | null = null;

        if (shouldOrchestrate(userMessage)) {
            console.log('[Chat API] Orchestrating structured response...');
            try {
                envelope = await orchestrateResponse({
                    userMessage,
                    llmResponse: finalResponse,
                    language: userLanguage,
                    location,
                    wantsBooking,
                });
                console.log(`[Chat API] Orchestration complete: ${envelope.cards.length} cards`);
            } catch (err) {
                console.error('[Chat API] Orchestration failed:', err);
                // Continue with text-only response
            }
        }

        // ============================================
        // Step 5: Return SSE response
        // ============================================
        const encoder = new TextEncoder();

        // If we have an envelope, return it even if there are 0 cards.
        // This preserves safety banners/disclaimers in the UI for cases like ER triage
        // where we intentionally avoid medication cards and may have no location-based cards.
        const responsePayload = envelope ? envelope : finalResponse;

        const stream = new ReadableStream({
            start(controller) {
                const sseData = `0:${JSON.stringify(responsePayload)}\n`;
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
