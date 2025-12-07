import { NextRequest } from 'next/server';

export const runtime = 'edge';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://cob-n8n-primary-production.up.railway.app/webhook/mynaga-gabay-chat';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // Get the last user message
        const lastMessage = messages?.[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            return new Response(
                JSON.stringify({ error: 'No user message provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate a session ID from the request
        const sessionId = `web-${Date.now()}`;

        // Call n8n RAG pipeline
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: lastMessage.content,
                sessionId,
                language: 'auto',
            }),
        });

        if (!response.ok) {
            throw new Error(`N8N error: ${response.status}`);
        }

        const data = await response.json();

        // Return as streamed text (compatible with ai sdk useChat)
        return new Response(data.response || 'Pasensya, may problema sa sistema.', {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
