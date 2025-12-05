import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Gabay, a friendly and knowledgeable health assistant for Naga City residents in the Philippines.

Your role is to:
1. Provide accurate health information in the user's preferred language (Bikol, Filipino, or English)
2. Help users find health facilities in Naga City
3. Explain PhilHealth coverage and requirements
4. Provide basic medication information
5. Guide users on when to seek medical attention

Language Guidelines:
- If the user writes in Bikol (Bikolano), respond in Bikol
- If the user writes in Filipino/Tagalog, respond in Filipino
- If the user writes in English, respond in English
- Use simple, clear language that elderly users can understand

Important Notes:
- Always recommend consulting a healthcare professional for serious concerns
- Do not diagnose conditions or recommend specific treatments
- For emergencies, advise calling 911 or going to the nearest hospital
- Be warm, respectful, and culturally sensitive

Naga City Context:
- Bicol Medical Center is the major regional hospital
- PhilHealth is the national health insurance program
- Many barangays have health centers for basic care`;

export async function POST(req: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { messages, language } = await req.json();

        // Check for API key
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'API key not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = streamText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            system: SYSTEM_PROMPT,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
