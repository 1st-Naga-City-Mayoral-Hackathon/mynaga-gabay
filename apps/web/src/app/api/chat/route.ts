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

        const data = await response.json() as { response?: string };
        const text = data.response || 'Pasensya, may problema sa sistema.';

        // Return as SSE stream format compatible with AI SDK useChat
        // Format: 0:"chunk text"\n
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Send the entire response as a single chunk in SSE format
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
