# Claude Instructions for MyNaga Gabay

## Project Context
You are helping build **MyNaga Gabay**, a health assistant for Naga City, Philippines. The app supports **Bikol (Bikolano)**, Filipino, and English.

## Monorepo Structure
```
apps/web/        → Next.js 14 frontend
apps/api/        → Express + TypeScript backend
apps/mobile/     → Flutter mobile app
packages/shared/ → Shared types (@mynaga/shared)
packages/ai-core/→ Claude & RAG logic (@mynaga/ai-core)
```

## When Writing Code

### TypeScript
- Use strict mode, proper types
- Import from workspaces: `import { Message } from '@mynaga/shared'`
- Build packages before apps: `npm run build`

### API Routes (apps/api)
- Use Express Router pattern
- Return `ApiResponse<T>` type for consistency
- Handle errors with middleware

### React Components (apps/web)
- Use Next.js App Router (`src/app/`)
- Client components need `'use client'` directive
- Use Tailwind CSS with Gabay theme classes

### Flutter (apps/mobile)
- Follow screen/widget/service separation
- Use `speech_to_text` for voice input

## Bikol Language Notes
- ISO code: `bcl` (Central Bikol)
- Speakers: ~2.5 million in Bicol Region
- Similar to Filipino but distinct vocabulary
- Example: "Kumusta" (hello) = same as Filipino
- Example: "Maray na aldaw" (good day) vs "Magandang araw"
- Medical terms often borrowed from Filipino/Spanish

## Key Files
- `packages/ai-core/src/prompts/gabay.ts` - System prompt for health assistant
- `data/knowledge-base/` - RAG documents
- `.env.example` - Required environment variables

## Environment
```env
CLAUDE_API_KEY=...
DATABASE_URL=postgresql://...
```
