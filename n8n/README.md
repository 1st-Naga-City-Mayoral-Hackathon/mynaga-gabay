# MyNaga Gabay - N8N Workflows

This folder contains n8n workflow definitions for the MyNaga Gabay health assistant.

## Workflows

### 1. RAG Ingestion Pipeline (`rag-ingestion-pipeline.json`)

Ingests knowledge base data (facilities, medicines, government services) into Supabase vector store for RAG retrieval.

#### Setup

1. **Import workflow**: In n8n, go to Workflows → Import → paste the JSON
2. **Configure credentials**:
   - Supabase API credentials
   - Google Gemini API credentials (for embeddings)
3. **Update credential IDs** in the workflow nodes

#### Webhook Endpoint

```
POST /webhook/ingest-knowledge-base
```

#### Request Body

```json
{
  "category": "all",  // "all" | "facilities" | "medicines" | "government"
  "facilities": [...],
  "medicines": [...],
  "government": [...]
}
```

#### Trigger with Script

```bash
# Set your n8n webhook URL
export N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ingest-knowledge-base

# Run ingestion
python trigger_rag_ingestion.py

# Or ingest specific category
python trigger_rag_ingestion.py --category facilities

# Dry run (show what would be sent)
python trigger_rag_ingestion.py --dry-run
```

## Supabase Setup

Before using the workflow, create the vector store table in Supabase:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table for RAG
create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768)  -- Google Gemini embedding dimension
);

-- Create index for similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create match function for n8n
create or replace function match_documents (
  query_embedding vector(768),
  match_count int default 5,
  filter jsonb default '{}'
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## Knowledge Base Data Summary

| Category | Entries | Description |
|----------|---------|-------------|
| Facilities | 133 | Hospitals, clinics, pharmacies in Naga City |
| Medicines | 102 | Generic drugs with uses and warnings |
| Government | 46 | City offices and services |
| **Total** | **281** | All embeddable entries |
