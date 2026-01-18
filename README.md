# AI Multi-Agent Customer Support System

An intelligent customer support system powered by multiple specialized AI agents with real-time streaming, context management, and durable workflows.

## 🚀 Features

- **Multi-Agent Architecture**: Router, Support, Order, and Billing agents
- **Real-time Streaming**: Live AI responses with typing indicators
- **Context Compaction**: Automatic summarization of long conversations
- **Rate Limiting**: 30 requests/minute per IP
- **Unit Tests**: Comprehensive test coverage with Vitest
- **Workflow Integration**: Durable workflow patterns for reliability
- **Type-Safe**: End-to-end TypeScript with Hono RPC

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo |
| **Frontend** | React + Vite + TailwindCSS |
| **Backend** | Hono.dev |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **AI** | Vercel AI SDK + Groq |

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your DATABASE_URL and GROQ_API_KEY

# Push database schema
cd apps/api && npx prisma db push

# Seed database
npx tsx prisma/seed.ts

# Run development servers
cd ../.. && npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3001

## 🧪 Running Tests

```bash
cd apps/api
npm run test
```

## 🌐 Deployment

### Frontend (Vercel)
```bash
npm i -g vercel
vercel
```

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
3. Deploy via dashboard

## 📁 Project Structure

```
ai-support-center/
├── apps/
│   ├── api/                 # Hono backend
│   │   ├── src/
│   │   │   ├── agents/      # AI agents (router, support, order, billing)
│   │   │   ├── tools/       # Agent tools (database queries)
│   │   │   ├── services/    # Business logic + workflows
│   │   │   ├── middleware/  # Rate limiting, error handling
│   │   │   └── routes/      # API endpoints
│   │   └── prisma/          # Database schema + seed
│   └── web/                 # React frontend
│       └── src/
│           ├── components/  # UI components
│           ├── hooks/       # Custom hooks
│           └── lib/         # API client
├── packages/
│   └── types/               # Shared TypeScript types
├── vercel.json              # Vercel config
├── railway.toml             # Railway config
└── netlify.toml             # Netlify config
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/messages` | Send message, get streaming response |
| GET | `/api/chat/conversations/:id` | Get conversation history |
| GET | `/api/chat/conversations` | List all conversations |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |
| GET | `/api/agents` | List available agents |
| GET | `/api/agents/:type/capabilities` | Get agent capabilities |
| GET | `/health` | Health check |


