# MyNaga Gabay - N8N Workflows

This folder contains n8n workflow definitions for the MyNaga Gabay health assistant.

## Workflows

### 1. RAG Ingestion Pipeline (`rag-ingestion-pipeline.json`)

Ingests knowledge base data into PGVector store for RAG retrieval.

**Webhook**: `POST /webhook/ingest-knowledge-base`

**Categories**: facilities, medicines, government, philhealth, emergency

```bash
# Ingest all data
python trigger_rag_ingestion.py --url "https://your-n8n.com/webhook/ingest-knowledge-base"

# Ingest specific category
python trigger_rag_ingestion.py --url "..." --category facilities
```

---

### 2. RAG Chatbot Pipeline (`rag-chatbot-pipeline.json`)

AI Health Assistant with RAG retrieval and multilingual support (Bikol, Tagalog, English).

**Webhook**: `POST /webhook/mynaga-gabay-chat`

**Request**:
```json
{
  "message": "Haen an ospital?",
  "sessionId": "user-123",
  "language": "auto"
}
```

**Response**:
```json
{
  "response": "An pinakahrani na ospital sa Naga City...",
  "language": "bikol",
  "sessionId": "user-123",
  "model": "qwen/qwen3-32b"
}
```

**Test with Script**:
```bash
# Single message
python test_rag_chatbot.py --message "Where is the nearest hospital?"

# Interactive mode
python test_rag_chatbot.py --interactive

# With language hint
python test_rag_chatbot.py --message "Haen an clinic?" --language bikol
```

---

## Setup

### 1. Import Workflows

1. In n8n: Workflows → Import → paste JSON
2. Configure credentials (Groq, Postgres, Google Gemini)
3. Activate workflow

### 2. PostgreSQL PGVector Table

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vectors table (n8n default)
CREATE TABLE IF NOT EXISTS n8n_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT,
  metadata JSONB,
  embedding VECTOR(768)
);

-- Create index for fast search
CREATE INDEX ON n8n_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Knowledge Base Summary

| Category | Entries | Description |
|----------|---------|-------------|
| Facilities | 133 | Hospitals, clinics, pharmacies |
| Medicines | 102 | Generic drugs with uses |
| Government | 46 | City offices and services |
| PhilHealth | 1 | Coverage and benefits |
| Emergency | 5 | Hotlines by category |
| **Total** | **287** | ~6,000 vectors after chunking |

