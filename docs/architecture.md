# MyNaga Gabay System Architecture

## Overview

MyNaga Gabay is a voice-enabled health assistant for Naga City residents, providing healthcare information in Bikol, Filipino, and English.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
├─────────────────┬─────────────────┬────────────────────────┤
│   Web App       │   Mobile App    │   Future: SMS Bot      │
│   (Next.js)     │   (Flutter)     │   (Globe Labs)         │
└────────┬────────┴────────┬────────┴───────────┬────────────┘
         │                 │                    │
         └─────────────────┴────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
    ┌────▼────┐                        ┌─────▼─────┐
    │   n8n   │ (Chat Workflow)        │  Express  │ (Static APIs)
    │ Webhook │                        │   API     │
    └────┬────┘                        └─────┬─────┘
         │                                   │
    ┌────▼────┐                        ┌─────▼─────┐
    │ Claude  │                        │ Facilities│
    │   AI    │                        │ Health    │
    └────┬────┘                        └───────────┘
         │
    ┌────▼────┐
    │PostgreSQL│
    │+ pgvector│
    └──────────┘
```

---

## Component Details

### Frontend (apps/web)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with glassmorphism theme
- **Voice**: Web Speech API for browser-native STT
- **State**: React hooks (no external state library for MVP)

### Mobile (apps/mobile)
- **Framework**: Flutter 3.2+
- **Voice**: speech_to_text package
- **Camera**: image_picker for prescription scanning

### n8n Chat Workflow (Primary Chat Backend)
- **Webhook Endpoint**: Receives chat requests from clients
- **RAG Node**: Queries PostgreSQL pgvector for context
- **Claude Node**: Sends prompt with RAG context to Claude API
- **Response**: Returns AI response to client
- **Benefits**:
  - Visual workflow design
  - Easy prompt iteration
  - No-code AI integration
  - Built-in error handling

### Express API (apps/api)
- **Purpose**: Static data endpoints (non-AI)
- **Endpoints**:
  - GET /api/facilities - Health centers list
  - GET /api/health - API health check
  - POST /api/prescription - OCR (future)

### AI Layer (packages/ai-core)
- **Claude Client**: Wrapper for direct API calls (backup)
- **RAG Service**: Vector similarity search
- **System Prompts**: Gabay persona configuration
- **Voice Service**: Placeholder for STT/TTS

### Database (PostgreSQL)
- **PostgreSQL**: User data, chat history
- **pgvector**: Document embeddings for RAG
- **Future**: User authentication

---

## n8n Workflow Design

### Chat Workflow
```
┌─────────────────┐
│ Webhook Trigger │  POST /webhook/chat
│ { message,      │  { message: "Kumusta", language: "bcl" }
│   language }    │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │ Parse Request   │  Extract message, language, session_id
    └────────┬────────┘
         │
    ┌────▼────────────┐
    │ PostgreSQL      │  Query: SELECT * FROM documents
    │ pgvector Search │  WHERE embedding <=> $query_embedding
    └────────┬────────┘  LIMIT 5
         │
    ┌────▼────────────┐
    │ Build Prompt    │  Combine: system_prompt + RAG_context + user_message
    └────────┬────────┘
         │
    ┌────▼────────────┐
    │ Claude API      │  Model: claude-sonnet-4-20250514
    │ (Anthropic)     │  Send conversation with context
    └────────┬────────┘
         │
    ┌────▼────────────┐
    │ Format Response │  { reply, language, sources }
    └────────┬────────┘
         │
    ┌────▼────────────┐
    │ Webhook Response│  Return JSON to client
    └─────────────────┘
```

### n8n Environment Variables
```
CLAUDE_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```

---

## Data Flow

### Chat Request Flow (via n8n)

```
1. User sends message (text or voice)
         │
2. Frontend converts voice → text (Web Speech API)
         │
3. POST to n8n webhook { message, language }
         │
4. n8n: pgvector search for relevant context
         │
5. n8n: Build prompt with Gabay persona + context
         │
6. n8n: Call Claude API
         │
7. n8n: Return JSON response
         │
8. Frontend displays response (+ optional TTS)
```

### Static Data Flow (via Express)

```
1. Client needs facilities list
         │
2. GET /api/facilities
         │
3. Express: Query database or return static JSON
         │
4. Return facilities array
```

### RAG Pipeline

```
Knowledge Base (JSON files)
         │
     ┌───▼───┐
     │ Parse │
     └───┬───┘
         │
     ┌───▼───┐
     │Embed  │ (text → vector via embedding API)
     └───┬───┘
         │
     ┌───▼───┐
     │Store  │ (PostgreSQL pgvector)
     └───────┘

On Query (in n8n):
     ┌───────┐
     │Query  │ → embed → similarity search → top K results
     └───┬───┘
         │
     ┌───▼───────────┐
     │ Context for   │
     │ Claude prompt │
     └───────────────┘
```

---

## API Endpoints Summary

| Endpoint | Type | Handler | Purpose |
|----------|------|---------|---------|
| POST /webhook/chat | n8n | Chat workflow | AI chat with RAG |
| GET /api/facilities | Express | Static | Health facilities |
| GET /api/facilities/:id | Express | Static | Facility details |
| GET /api/health | Express | Static | Health check |
| POST /api/prescription | Express | Future | OCR processing |

---

## Security Considerations

| Area | MVP | Production |
|------|-----|------------|
| API Auth | None | JWT tokens |
| Rate Limiting | None | 100 req/min |
| Secrets | .env file | Environment variables |
| HTTPS | localhost only | Required |
| n8n Auth | Basic | Webhook signatures |

---

## Scalability Notes

For MVP (hackathon):
- Single n8n instance handles chat
- Express API for static endpoints
- Direct Claude API calls

For Production:
- n8n queue mode for high traffic
- Redis for caching common queries
- CDN for static assets
- Monitoring with n8n execution logs

---

## Technology Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | npm workspaces | Native, simple |
| Build | Turborepo | Fast, parallel builds |
| Frontend | Next.js 14 | App Router, RSC, fast |
| Chat Backend | n8n | Visual workflows, easy iteration |
| Static API | Express | Simple, well-known |
| Mobile | Flutter | Cross-platform, fast dev |
| Database | PostgreSQL + pgvector | Direct control, any host |
| AI | Claude | Best reasoning for health |
| Voice | Web Speech API | Free, browser-native |

---

## Deployment Options

### n8n
- **Self-hosted**: Docker on VPS (recommended for hackathon)
- **Cloud**: n8n.cloud (easier, paid)

### Express API
- **Vercel**: Serverless functions
- **Railway/Render**: Container hosting

### Database
- **Railway**: Managed PostgreSQL with pgvector
- **Supabase**: If you want auth later
- **Local**: Development only

---

## Future Enhancements

1. **Voice**: Server-side Whisper for better Bikol recognition
2. **OCR**: Prescription scanning with Claude Vision
3. **SMS Bot**: For feature phones (via Twilio/Globe Labs)
4. **Offline**: PWA with cached responses
5. **Analytics**: Query patterns via n8n execution data
