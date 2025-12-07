/**
 * N8n Chat Service
 * Proxies chat requests to the n8n RAG chatbot workflow
 */

export interface N8nChatRequest {
    message: string;
    sessionId: string;
    language?: 'auto' | 'bikol' | 'tagalog' | 'english';
}

export interface N8nChatResponse {
    response: string;
    language: string;
    sessionId: string;
    model: string;
    timestamp: string;
}

export interface N8nChatServiceOptions {
    webhookUrl: string;
    timeout?: number;
}

export class N8nChatService {
    private webhookUrl: string;
    private timeout: number;

    constructor(options: N8nChatServiceOptions) {
        this.webhookUrl = options.webhookUrl;
        this.timeout = options.timeout || 60000; // 60 second default
    }

    /**
     * Send a chat message to the n8n RAG pipeline
     */
    async chat(
        message: string,
        sessionId: string,
        language: string = 'auto'
    ): Promise<N8nChatResponse> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    sessionId,
                    language,
                } as N8nChatRequest),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`N8n webhook error (${response.status}): ${errorText}`);
            }

            const data = (await response.json()) as N8nChatResponse;

            return {
                response: data.response || '',
                language: data.language || 'unknown',
                sessionId: data.sessionId || sessionId,
                model: data.model || 'unknown',
                timestamp: data.timestamp || new Date().toISOString(),
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('N8n chat request timed out');
            }

            throw error;
        }
    }

    /**
     * Health check - verify n8n webhook is accessible
     */
    async healthCheck(): Promise<boolean> {
        try {
            // Just check if the URL is reachable (will get 405 for GET, but that's OK)
            const response = await fetch(this.webhookUrl, {
                method: 'HEAD',
            });
            return response.status !== 404;
        } catch {
            return false;
        }
    }
}

/**
 * Create N8nChatService from environment variables
 */
export function createN8nChatService(): N8nChatService | null {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('N8N_WEBHOOK_URL not configured');
        return null;
    }

    return new N8nChatService({
        webhookUrl,
        timeout: parseInt(process.env.N8N_TIMEOUT || '60000', 10),
    });
}
