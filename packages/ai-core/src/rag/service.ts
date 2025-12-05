import { Pool } from 'pg';
import type { RAGSource } from '@mynaga/shared';

export interface RAGServiceOptions {
    connectionString: string;
}

export class RAGService {
    private pool: Pool;

    constructor(options: RAGServiceOptions) {
        this.pool = new Pool({
            connectionString: options.connectionString,
        });
    }

    /**
     * Search knowledge base using pgvector similarity search
     */
    async search(query: string, limit: number = 5): Promise<RAGResult[]> {
        const embedding = await this.generateEmbedding(query);

        const result = await this.pool.query(
            `SELECT id, type, title, content, 
              1 - (embedding <=> $1::vector) as similarity
       FROM documents
       WHERE 1 - (embedding <=> $1::vector) > 0.7
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
            [JSON.stringify(embedding), limit]
        );

        return result.rows;
    }

    /**
     * Build context string from RAG results for Claude
     */
    buildContext(results: RAGResult[]): string {
        if (results.length === 0) return '';

        return results
            .map((r) => `[${r.type}] ${r.title}:\n${r.content}`)
            .join('\n\n---\n\n');
    }

    /**
     * Convert RAG results to source citations
     */
    toSources(results: RAGResult[]): RAGSource[] {
        return results.map((r) => ({
            type: r.type,
            title: r.title,
            relevance: r.similarity,
        }));
    }

    /**
     * Generate embedding using external API
     * TODO: Implement with actual embedding model
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        console.warn('Embedding generation not yet implemented');
        return new Array(1536).fill(0);
    }

    /**
     * Close database connection pool
     */
    async close(): Promise<void> {
        await this.pool.end();
    }
}

export interface RAGResult {
    id: string;
    type: 'medication' | 'facility' | 'philhealth' | 'bikol_phrase';
    title: string;
    content: string;
    similarity: number;
}
