# MyNaga Gabay Development Setup Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- **Flutter** >= 3.2.0 (for mobile development)
- **Git**

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/mynaga-gabay.git
cd mynaga-gabay
```

### 2. Install Dependencies
```bash
npm install
```
This installs all workspace dependencies for web, api, and shared packages.

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
CLAUDE_API_KEY=sk-ant-api03-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
DATABASE_URL=postgresql://...
```

### 4. Start Development Servers

**Option A: Start all (with Turborepo)**
```bash
npm run dev
```

**Option B: Start individually**
```bash
# Terminal 1 - Web (Next.js)
npm run dev:web

# Terminal 2 - API (Express)
npm run dev:api
```

### 5. Access Applications
- **Web**: http://localhost:3000
- **API**: http://localhost:4000

---

## Flutter Mobile Setup

```bash
cd apps/mobile

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run

# Run on specific device
flutter run -d chrome  # Web
flutter run -d android # Android
flutter run -d ios     # iOS
```

---

## Project Structure

```
mynaga-gabay/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # Express backend
│   └── mobile/       # Flutter app
├── packages/
│   ├── shared/       # Shared TypeScript types
│   └── ai-core/      # Claude API & RAG
├── data/
│   └── knowledge-base/   # RAG documents
└── docs/             # Documentation
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all code |
| `npm run typecheck` | Type check all TypeScript |
| `npm run clean` | Clean all build artifacts |

---

## PostgreSQL Setup

1. Install PostgreSQL locally or use a cloud provider
2. Create database:
   ```bash
   createdb mynaga_gabay
   ```
3. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Create documents table for RAG:
   ```sql
   CREATE TABLE documents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     embedding VECTOR(1536),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
5. Add connection string to `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/mynaga_gabay
   ```

---

## Troubleshooting

### "Module not found" errors
```bash
npm run build  # Build shared packages first
```

### TypeScript errors in web/api
Ensure packages are built:
```bash
npx turbo run build --filter=@mynaga/shared
npx turbo run build --filter=@mynaga/ai-core
```

### Flutter "pub get" fails
Ensure Flutter is installed and in PATH:
```bash
flutter doctor
```

---

## Team Workflow

1. Each team member works on their designated app
2. Shared types go in `packages/shared`
3. AI/RAG logic goes in `packages/ai-core`
4. Pull latest before starting work
5. Test your changes locally before pushing
