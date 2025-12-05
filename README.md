# MyNaga Gabay 🏥

> Bikolano Health Assistant for Naga City Residents

A voice-enabled health assistant that provides accessible healthcare information in Bikol and Filipino, powered by Claude AI with RAG (Retrieval-Augmented Generation).

## 🏗️ Project Structure

```
mynaga-gabay/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # Express + TypeScript backend
│   └── mobile/       # Flutter mobile app
├── packages/
│   ├── shared/       # Shared types and constants
│   └── ai-core/      # Claude API + RAG logic
├── data/
│   └── knowledge-base/   # RAG documents
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0
- Flutter (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mynaga-gabay.git
cd mynaga-gabay

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Start development servers
npm run dev:web   # Start Next.js on http://localhost:3000
npm run dev:api   # Start API on http://localhost:4000
```

### Flutter (Mobile)

```bash
cd apps/mobile
flutter pub get
flutter run
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Express, TypeScript, Node.js |
| Mobile | Flutter, Dart |
| Database | PostgreSQL + pgvector |
| AI | Claude API |
| Voice | Web Speech API (MVP) |

## 📁 Packages

- **@mynaga/shared** - TypeScript types, constants, utilities
- **@mynaga/ai-core** - Claude API wrapper, RAG queries, voice utilities

## 👥 Team

- **Meg** - Web Frontend (Next.js)
- **Jeremiah** - Backend API (Express)
- **Choi** - Mobile (Flutter)
- **Jacob & Sheane** - AI/RAG Integration

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with ❤️ for the 1st Naga City Mayoral Hackathon
