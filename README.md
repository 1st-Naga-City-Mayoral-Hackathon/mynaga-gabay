# MyNaga Gabay 🏥

> **Bikolano Health Assistant for Naga City Residents**

A voice-enabled AI health assistant providing accessible healthcare information in **Bikol**, **Filipino**, and **English**. Built for the **1st Naga City Mayoral Hackathon**.

---

## 🎯 Problem Statement

Naga City residents, especially elderly and Bikol-speaking populations, face barriers accessing health information due to:
- Language limitations (most health apps are English-only)
- Digital literacy gaps
- Limited awareness of local health resources and PhilHealth coverage

## 💡 Solution

**MyNaga Gabay** ("My Naga Guide") provides:
- 🗣️ **Voice-first interface** - Talk naturally in Bikol, Filipino, or English
- 🏥 **Local health info** - Naga City hospitals, clinics, barangay health centers
- 💊 **Medication guidance** - Understand prescriptions and common medicines
- 📋 **PhilHealth help** - Coverage, requirements, and how to avail
- 📸 **Prescription scanning** - Upload photos to understand medications

---

## ✨ Features

### 🎙️ Voice-First Interaction
- **Speech-to-Text**: Speak in Bikol, Filipino, or English
- **Text-to-Speech**: Hear responses read aloud
- **Natural conversation**: Ask health questions like talking to a friend
- Works on web (Web Speech API) and mobile (native speech recognition)

### 🌐 Multilingual Support
- **Bikol (Bikolano)**: Native language of Naga City
- **Filipino**: National language
- **English**: For medical terminology
- Auto-detects language and responds appropriately

### 🏥 Local Health Information
- **Hospitals**: Bicol Medical Center, Naga City Hospital, Mother Seton
- **Health Centers**: City Health Office, Barangay Health Centers
- **Pharmacies**: Location and operating hours
- **Contact info**: Phone numbers and addresses

### 💊 Medication Assistance
- Explain what medications are for
- Common dosages and side effects
- Drug interactions warnings
- Generic vs brand name alternatives

### 📋 PhilHealth Guidance
- Check if treatment is covered
- Required documents for claims
- Step-by-step availment process
- Contribution requirements

### 📸 Prescription Scanner (Coming Soon)
- Take photo of prescription
- AI extracts medication names
- Explains each medication
- Warns about interactions

### 🤖 AI-Powered by Claude
- Accurate health information
- Conversational responses
- Context-aware follow-ups
- Safety-first recommendations (always suggests seeing a doctor)

---

## 🏗️ Project Structure

```
mynaga-gabay/
├── apps/
│   ├── web/                  # Next.js 14 + Tailwind frontend
│   ├── api/                  # Express + TypeScript backend
│   └── mobile/               # Flutter mobile app
│
├── packages/
│   ├── shared/               # @mynaga/shared - TypeScript types & constants
│   └── ai-core/              # @mynaga/ai-core - Claude API + RAG logic
│
├── data/
│   └── knowledge-base/       # RAG documents
│       ├── medicines/        # Common medications
│       ├── facilities/       # Naga City health centers
│       ├── philhealth/       # Coverage information
│       └── bikol-phrases/    # Medical terms in Bikol
│
└── docs/
    ├── api.md                # API documentation
    ├── setup.md              # Development setup
    └── architecture.md       # System architecture
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- **PostgreSQL** with pgvector extension
- **Flutter** >= 3.2.0 (for mobile)
- **Claude API key** from [Anthropic](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mynaga-gabay.git
cd mynaga-gabay

# Install all dependencies
npm install

# Build shared packages
npm run build

# Set up environment
cp .env.example .env
# Edit .env with your CLAUDE_API_KEY and DATABASE_URL
```

### Start Development

```bash
# Terminal 1 - Web App (http://localhost:3000)
npm run dev:web

# Terminal 2 - API (http://localhost:4000)
npm run dev:api
```

### Flutter Mobile

```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React, Tailwind | Modern web UI with glassmorphism |
| **Backend** | Express, TypeScript | REST API with Claude integration |
| **Mobile** | Flutter, Dart | Cross-platform iOS/Android app |
| **Database** | PostgreSQL + pgvector | Vector similarity search for RAG |
| **AI** | Claude API (Anthropic) | Health assistant reasoning |
| **Voice** | Web Speech API | Browser-native STT/TTS |
| **Build** | Turborepo | Fast parallel monorepo builds |

---

## 🌐 Supported Languages

| Code | Language | Region |
|------|----------|--------|
| `en` | English | International |
| `fil` | Filipino | National |
| `bcl` | Bikol (Central) | Naga City, Camarines Sur |

### Bikol Language Note
Bikol is a low-resource language (~2.5M speakers). We use:
- Manual curation of medical phrases
- Claude's multilingual capabilities
- Filipino as fallback for voice recognition

---

## � Workspace Packages

### @mynaga/shared
Shared TypeScript types and constants:
- `Message`, `User`, `HealthFacility` types
- Language constants and greetings
- API response types

### @mynaga/ai-core
AI and RAG functionality:
- Claude API client wrapper
- Gabay system prompt (health assistant persona)
- pgvector RAG service for knowledge retrieval
- Voice utilities (placeholder)

---

## � API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with Gabay health assistant |
| GET | `/api/facilities` | List Naga City health facilities |
| GET | `/api/facilities/:id` | Get facility details |
| GET | `/api/health` | API health check |
| GET | `/api/health/readiness` | Readiness check |

See [docs/api.md](docs/api.md) for full documentation.

---

## ⚙️ Environment Variables

```env
# Required
CLAUDE_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/mynaga_gabay

# Optional
API_PORT=4000
WEB_URL=http://localhost:3000
```

---

## 📊 Knowledge Base

Pre-loaded with Naga City-specific health information:

| Category | Contents |
|----------|----------|
| **Medicines** | 5 common medications (Paracetamol, Ibuprofen, etc.) |
| **Facilities** | 6 health centers (BMC, Naga City Hospital, etc.) |
| **PhilHealth** | Coverage types, requirements, process |
| **Bikol Phrases** | Medical terms, greetings, common questions |

---

## 👥 Team

| Member | Role | Workspace |
|--------|------|-----------|
| **Meg** | UX Research | User personas, wireframes, usability |
| **Jeremiah** | Web Developer | apps/web |
| **Jacob** | API Developer | apps/api |
| **Choi** | Mobile Developer | apps/mobile |
| **Sheane** | AI Engineer | packages/ai-core |

---

## 📋 Available Scripts

```bash
npm run dev          # Start all dev servers (Turborepo)
npm run dev:web      # Start Next.js only
npm run dev:api      # Start Express only
npm run build        # Build all packages
npm run lint         # Lint all code
npm run typecheck    # TypeScript check
npm run clean        # Clean all build artifacts
```

---

## 🗄️ Database Setup

```bash
# Create database
createdb mynaga_gabay

# Enable pgvector
psql mynaga_gabay -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create documents table
psql mynaga_gabay -c "
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);"
```

---

## 🔮 Future Roadmap

- [ ] Server-side Whisper for better Bikol speech recognition
- [ ] Prescription OCR with Claude Vision
- [ ] SMS bot for feature phones
- [ ] Offline mode with cached responses
- [ ] Community Bikol phrase contributions

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Naga City Government** - Hackathon organizers
- **Anthropic** - Claude AI
- **UP DSP Lab** - Philippine Languages Database research
- **Bikolano community** - Language preservation

---

<div align="center">

Built with ❤️ for the **1st Naga City Mayoral Hackathon**

🏥 *Gabay mo sa kalusugan* 🏥

</div>
