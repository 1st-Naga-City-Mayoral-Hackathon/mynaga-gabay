import Anthropic from '@anthropic-ai/sdk';
import type { Message, ConversationContext } from '@mynaga/shared';
import { GABAY_SYSTEM_PROMPT } from '../prompts/gabay';

export interface ClaudeClientOptions {
    apiKey: string;
    model?: string;
}

export class ClaudeClient {
    private client: Anthropic;
    private model: string;

    constructor(options: ClaudeClientOptions) {
        this.client = new Anthropic({ apiKey: options.apiKey });
        this.model = options.model || 'claude-sonnet-4-20250514';
    }

    async chat(
        userMessage: string,
        context?: ConversationContext,
        ragContext?: string
    ): Promise<string> {
        const systemPrompt = ragContext
            ? `${GABAY_SYSTEM_PROMPT}\n\n<context>\n${ragContext}\n</context>`
            : GABAY_SYSTEM_PROMPT;

        const messages = this.buildMessages(userMessage, context);

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            system: systemPrompt,
            messages,
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        return textBlock?.type === 'text' ? textBlock.text : '';
    }

    private buildMessages(
        userMessage: string,
        context?: ConversationContext
    ): Anthropic.MessageParam[] {
        const messages: Anthropic.MessageParam[] = [];

        // Add conversation history if available
        if (context?.messages) {
            for (const msg of context.messages.slice(-10)) {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({
                        role: msg.role,
                        content: msg.content,
                    });
                }
            }
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage,
        });

        return messages;
    }
}

export function createClaudeClient(apiKey: string): ClaudeClient {
    return new ClaudeClient({ apiKey });
}
