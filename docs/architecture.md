# MyNaga Gabay System Architecture

## Overview

MyNaga Gabay is a voice-enabled health assistant for Naga City residents, providing healthcare information in Bikol, Filipino, and English.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
├─────────────────┬─────────────────┬────────────────────────┤
│   Web App       │   Mobile App    │   Future: Voice Bot    │
│   (Next.js)     │   (Flutter)     │   (Messenger/SMS)      │
└────────┬────────┴────────┬────────┴───────────┬────────────┘
         │                 │                    │
         └─────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API       │
                    │  (Express)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
    │ Claude  │      │ PostgreSQL│    │   RAG     │
    │   AI    │      │ + pgvector│    │  Service  │
    └─────────┘      └───────────┘    └───────────┘
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

### Backend (apps/api)
- **Framework**: Express + TypeScript
- **Functions**:
  - Chat processing with Claude
  - RAG search for context
  - Health facilities lookup
  - (Future) Prescription OCR

### AI Layer (packages/ai-core)
- **Claude Client**: Wrapper for Anthropic API
- **RAG Service**: Vector similarity search via Supabase
- **Voice Service**: Placeholder for STT/TTS processing
- **System Prompts**: Gabay persona configuration

### Database (PostgreSQL)
- **PostgreSQL**: User data, chat history
- **pgvector**: Document embeddings for RAG
- **Future**: User authentication

---

## Data Flow

### Chat Request Flow

```
1. User sends message (text or voice)
         │
2. Frontend converts voice → text (Web Speech API)
         │
3. POST /api/chat { message, language }
         │
4. API: RAG search for relevant context
         │
5. API: Build prompt with context + system prompt
         │
6. API: Send to Claude API
         │
7. Claude generates response
         │
8. API: Return response to client
         │
9. Frontend displays response (+ optional TTS)
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
     │Embed  │ (text → vector)
     └───┬───┘
         │
     ┌───▼───┐
     │Store  │ (Supabase pgvector)
     └───────┘

On Query:
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

## Security Considerations

| Area | MVP | Production |
|------|-----|------------|
| API Auth | None | Supabase Auth / JWT |
| Rate Limiting | None | 100 req/min |
| Secrets | .env file | Environment variables |
| HTTPS | localhost only | Required |
| Input Validation | Basic | Comprehensive |

---

## Scalability Notes

For MVP (hackathon):
- Single API instance is sufficient
- In-memory session state
- Direct Claude API calls

For Production:
- Consider request queuing for Claude API
- Implement caching for common queries
- Use CDN for static assets
- Add logging and monitoring

---

## Technology Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | npm workspaces | Native, simple |
| Build | Turborepo | Fast, parallel builds |
| Frontend | Next.js 14 | App Router, RSC, fast |
| Backend | Express | Simple, well-known |
| Mobile | Flutter | Cross-platform, fast dev |
| Database | PostgreSQL + pgvector | Direct control, any host |
| AI | Claude | Best reasoning for health |
| Voice | Web Speech API | Free, browser-native |

---

## Future Enhancements

1. **Voice**: Server-side Whisper for better Bikol recognition
2. **OCR**: Prescription scanning with Vision models
3. **SMS Bot**: For feature phones (via Twilio/Globe Labs)
4. **Offline**: PWA with cached responses
5. **Analytics**: Query patterns, language usage
