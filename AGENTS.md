# MyNaga Gabay - AI Agent Instructions

## Project Overview
MyNaga Gabay is a voice-enabled Bikolano health assistant for Naga City residents. Built as a monorepo with npm workspaces.

## Tech Stack
- **Web**: Next.js 14 + Tailwind (apps/web)
- **API**: Express + TypeScript (apps/api)
- **Mobile**: Flutter (apps/mobile)
- **AI**: Claude API + pgvector RAG (packages/ai-core)
- **Database**: PostgreSQL with pgvector extension
- **Shared**: TypeScript types (packages/shared)

## Key Commands
```bash
npm install          # Install all dependencies
npm run dev:web      # Start Next.js (port 3000)
npm run dev:api      # Start Express (port 4000)
npm run build        # Build all packages
npm run lint         # Lint all code
```

## Directory Structure
```
apps/web/           # Next.js frontend (Jeremiah)
apps/api/           # Express backend (Jacob)
apps/mobile/        # Flutter app (Choi)
packages/shared/    # @mynaga/shared - types & constants
packages/ai-core/   # @mynaga/ai-core - Claude & RAG
data/knowledge-base/# RAG documents (medicines, facilities, Bikol phrases)
docs/               # Documentation
```

## Code Style
- TypeScript strict mode
- ESLint + Prettier configured
- Use workspace imports: `@mynaga/shared`, `@mynaga/ai-core`

## Languages Supported
- English (en)
- Filipino (fil)
- Bikol (bcl) - Central Bikol/Naga dialect

## Important Context
- Target users: Naga City residents, including elderly and Bikol speakers
- Voice-first design with Web Speech API
- RAG uses pgvector for semantic search
- Knowledge base includes local health facilities and PhilHealth info
