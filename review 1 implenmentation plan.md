# AI Code Generator & Intelligent Debugging Assistant — Review 1 Implementation Plan

## Overview

We are building a professional, production-style AI-powered developer platform from scratch.
This plan covers **Review 1 only**. Reviews 2 and 3 will be added later without rewriting the foundation.

---

## Technology Stack (Confirmed)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast dev server, type safety, modern |
| Styling | Tailwind CSS v3 | Utility-first, consistent design tokens |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | Same engine as VS Code |
| Backend | Python 3.11 + FastAPI | Async, auto OpenAPI docs, Pydantic validation |
| Database | SQLite (via SQLAlchemy ORM) | Zero-config for dev, easy migration to PostgreSQL |
| AI Layer | Google Gemini API (abstracted via AIService) | Free tier available, strong code understanding |
| Auth | JWT tokens (python-jose + passlib) | Stateless, production-ready |
| Testing | pytest (backend) + Vitest (frontend) | Standard for each ecosystem |

> [!IMPORTANT]
> The AI provider is abstracted behind an `AIService` interface. Swapping to OpenAI, Claude, or another provider only requires adding a new adapter — zero changes to API routes or frontend.

---

## Project Structure

```
/GEN AI (pbl)
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── layouts/           # Shell/sidebar layout
│   │   ├── services/          # API client (axios)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Helpers
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                   # Python FastAPI
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── api/               # Route handlers
│   │   │   ├── auth.py
│   │   │   ├── generate.py
│   │   │   ├── debug.py
│   │   │   ├── explain.py
│   │   │   └── history.py
│   │   ├── core/              # Config, security, DB
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/            # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── session.py
│   │   │   └── ai_request.py
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── generate.py
│   │   │   ├── debug.py
│   │   │   └── explain.py
│   │   ├── services/          # Business logic
│   │   │   └── history_service.py
│   │   └── ai/                # AI abstraction layer
│   │       ├── base.py        # Abstract AIService interface
│   │       ├── gemini_adapter.py   # Gemini implementation
│   │       └── ai_factory.py  # Returns correct adapter
│   ├── tests/                 # pytest test files
│   ├── .env.example
│   └── requirements.txt
│
├── docs/                      # Review 1 documentation
└── README.md
```

---

## Database Schema (Review 1)

### Users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| username | VARCHAR(50) | Unique |
| email | VARCHAR(100) | Unique |
| hashed_password | VARCHAR | bcrypt |
| created_at | DATETIME | |
| is_active | BOOLEAN | default True |

### CodeSessions
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | FK → Users | |
| session_type | ENUM | generate/debug/explain |
| language | VARCHAR(20) | python/c/cpp/java |
| input_prompt | TEXT | User's input |
| output_code | TEXT | Generated/fixed code |
| output_explanation | TEXT | AI explanation |
| created_at | DATETIME | |

### AIRequests (audit log)
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| session_id | FK → CodeSessions | |
| user_id | FK → Users | |
| request_type | VARCHAR | generate/debug/explain |
| tokens_used | INTEGER | from API response |
| status | VARCHAR | success/error |
| created_at | DATETIME | |

---

## API Endpoints (Review 1)

```
POST   /auth/register         → Create account
POST   /auth/login            → Returns JWT
POST   /auth/logout           → Invalidate token (client-side)

POST   /api/generate          → AI code generation
POST   /api/debug             → AI bug detection
POST   /api/explain           → AI code explanation

GET    /api/history           → Paginated user history
GET    /api/history/{id}      → Single session detail
DELETE /api/history/{id}      → Delete session

GET    /api/stats             → Dashboard statistics
```

---

## AI Service Architecture

```
Frontend Request
      ↓
FastAPI Route Handler
      ↓
AIService.generate(prompt, language) / .debug(code) / .explain(code)
      ↓
GeminiAdapter (implements AIService interface)
      ↓
Gemini REST API
      ↓
Structured JSON response parsed + returned
```

All AI responses will be **structured JSON**, not raw text:
```json
{
  "success": true,
  "language": "python",
  "code": "...",
  "explanation": "...",
  "issues": [],
  "suggestions": []
}
```

---

## Frontend Pages (Review 1)

| Route | Page | Description |
|---|---|---|
| `/` | Landing / Login redirect | |
| `/login` | Login | JWT auth |
| `/register` | Register | New account |
| `/dashboard` | Dashboard | Stats, quick actions, recent activity |
| `/generate` | Code Generator | Monaco editor + AI generation |
| `/debug` | Debugger | Paste code, get structured debug report |
| `/explain` | Explain Code | Paste code, get explanation |
| `/history` | History | Paginated list of past sessions |
| `/settings` | Settings | Theme toggle, profile |

---

## Review 1 Features Checklist

- [x] Plan created
- [ ] Backend scaffold (FastAPI, DB, config)
- [ ] Auth system (register, login, JWT)
- [ ] AI service abstraction layer
- [ ] Code generation API
- [ ] Debug API
- [ ] Explain API
- [ ] History API + DB storage
- [ ] Frontend scaffold (Vite + React + Tailwind)
- [ ] Auth pages (Login, Register)
- [ ] Dashboard page
- [ ] Code Generator page (Monaco editor)
- [ ] Debugger page
- [ ] Explain Code page
- [ ] History page
- [ ] Settings page
- [ ] Backend tests (pytest)
- [ ] Review 1 documentation

---

## Open Questions

> [!IMPORTANT]
> **AI Provider API Key**: You will need a Google Gemini API key. Get one free at https://aistudio.google.com/app/apikey — it's free for development. Do you have one, or should I set up the system to accept any key via `.env`?

> [!NOTE]
> **Gemini as default**: I'll use Google Gemini 1.5 Flash as the default AI provider (free tier, fast, excellent code understanding). The architecture makes it trivial to swap to OpenAI GPT-4 or Anthropic Claude later.

> [!NOTE]
> **No Docker for Review 1**: Code execution sandbox (Docker) is a Review 2/3 feature. For Review 1 the "execute" button will show a planned UI but be marked as "coming in Review 2" to avoid security risks.
