// Claude
export { ClaudeClient, createClaudeClient } from './claude/client';
export { GABAY_SYSTEM_PROMPT } from './prompts/gabay';

// RAG (Legacy - direct database access)
export { RAGService } from './rag/service';
export { createEmbedding } from './rag/embeddings';

// N8n Chat (Recommended - uses n8n RAG pipeline)
export { N8nChatService, createN8nChatService } from './n8n/chat-service';
export type { N8nChatRequest, N8nChatResponse } from './n8n/chat-service';

// Bikol Language Support
export { BikolEnhancer, createBikolEnhancer } from './bikol/enhancer';
export type { Language } from './bikol/enhancer';

// Guardrails
export {
    validateInput,
    validateSessionId,
    generateSessionId,
    addHealthDisclaimer,
} from './guardrails/validator';
export type { ValidationResult, GuardrailOptions } from './guardrails/validator';

// Voice
export { VoiceService } from './voice/service';
