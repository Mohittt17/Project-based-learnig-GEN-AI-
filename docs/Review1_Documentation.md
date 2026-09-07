# Review 1 Documentation
## AI Code Generator and Intelligent Debugging Assistant

---

## 1. Abstract

This project presents an AI-powered web platform designed to assist developers and engineering students with software development tasks. The system integrates Large Language Model (LLM) APIs within a secure, modular full-stack architecture to provide code generation, intelligent debugging, and code explanation capabilities. The platform demonstrates the practical application of Artificial Intelligence, REST API design, database engineering, secure authentication, and modern frontend development. Review 1 establishes the foundational architecture and a fully functional prototype covering user authentication, an AI code generator, an intelligent debugger, a code explainer, and a persistent session history system.

---

## 2. Problem Statement

Software development involves repetitive and time-consuming tasks such as writing boilerplate code, identifying bugs, and understanding unfamiliar codebases. Junior developers and students in particular face steep learning curves. Existing tools such as ChatGPT provide raw text responses that lack structure, code formatting, and integration within a development workflow. There is a need for a structured, purpose-built AI coding assistant that provides organized, actionable output within a professional developer interface.

---

## 3. Existing Systems

| Tool | Description | Limitations |
|---|---|---|
| GitHub Copilot | AI code completion in IDE | No standalone debugging or explanation; requires IDE plugin |
| ChatGPT | General-purpose LLM chat | Unstructured output; no history management; no code editor |
| Replit Ghostwriter | AI coding in Replit IDE | Proprietary; limited to Replit environment |
| Tabnine | AI autocomplete | Completion only; no generation from description |

---

## 4. Limitations of Existing Systems

- Generic chat interfaces return unstructured plain text, not developer-friendly structured data
- No separation of concerns between code, explanation, issues, and suggestions
- No persistent user-specific history linked to a database
- AI providers are tightly coupled — cannot be swapped
- No purpose-built debugging report with severity, category, line number, and fix
- ChatGPT and similar tools lack a professional code editor interface

---

## 5. Proposed System

An AI-powered developer platform featuring:
- **Structured AI responses** (JSON schemas, not raw text)
- **Purpose-built modules**: Code Generator, Debugger, Explainer
- **Professional Monaco code editor** (same engine as VS Code)
- **Secure JWT authentication** with user-specific session history
- **Provider-agnostic AI layer** (Gemini now, extensible to OpenAI/Claude)
- **RESTful FastAPI backend** with Pydantic validation and OpenAPI documentation
- **SQLAlchemy ORM database** designed to migrate from SQLite to PostgreSQL

---

## 6. Objectives

1. Allow users to generate code from natural language descriptions
2. Detect and categorize bugs with line-level precision
3. Explain code purpose, logic, and potential issues
4. Store all sessions in a persistent, searchable history
5. Provide a professional IDE-style user interface
6. Demonstrate secure software engineering practices
7. Build a modular architecture that supports incremental feature addition

---

## 7. Scope

**In Scope (Review 1):**
- User registration, login, and authentication
- Code generation (Python, JavaScript, Java, C++, C)
- Code debugging with structured issue report
- Code explanation with logic breakdown
- Session history (create, read, delete, paginate)
- Dashboard with usage statistics
- SQLite database with proper relational schema
- Backend unit tests (pytest)

**Out of Scope (Review 1 — planned for Review 2/3):**
- Code execution (requires Docker sandbox)
- Complexity analysis, test case generation
- Code quality scoring
- Security vulnerability detection
- AI chat assistant
- Admin analytics dashboard

---

## 8. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | User can register with username, email, and password |
| FR-02 | User can login and receive a JWT access token |
| FR-03 | All AI features require authentication |
| FR-04 | User can enter a natural language prompt and select a language to generate code |
| FR-05 | Generated code is displayed in a Monaco editor with explanation and suggestions |
| FR-06 | User can paste code and receive a structured debug report (issues, severity, fix) |
| FR-07 | Debug report includes corrected code |
| FR-08 | User can paste code and receive a structured explanation (purpose, logic, sections) |
| FR-09 | All AI sessions are stored in the database and shown in history |
| FR-10 | User can delete individual history sessions |
| FR-11 | Dashboard shows total, generate, debug, and explain counts |
| FR-12 | History is paginated (10 per page) |
| FR-13 | History can be filtered by session type |

---

## 9. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | API keys must never be exposed to the frontend |
| NFR-02 | All passwords must be hashed using bcrypt |
| NFR-03 | JWT tokens expire after 60 minutes |
| NFR-04 | AI provider must be abstracted and swappable without API changes |
| NFR-05 | Database must support migration to PostgreSQL without code rewrite |
| NFR-06 | All AI responses must be structured JSON — not raw text |
| NFR-07 | Frontend must be responsive |
| NFR-08 | AI service failures must return user-friendly error messages (no stack traces) |
| NFR-09 | Input validation must occur at both frontend and backend |
| NFR-10 | Backend must provide automatic API documentation (OpenAPI/Swagger) |

---

## 10. Technology Stack

### Frontend
- **React 18** with TypeScript — type-safe component development
- **Vite** — fast dev server and bundler
- **Tailwind CSS v3** — utility-first styling
- **Monaco Editor** — VS Code's editor engine (syntax highlighting, language support)
- **React Router v6** — client-side routing
- **Axios** — HTTP client with request/response interceptors
- **Lucide React** — modern icon library

### Backend
- **FastAPI** — Python async web framework with automatic OpenAPI docs
- **SQLAlchemy 2.0** — ORM with Pydantic integration
- **Pydantic v2** — request/response validation
- **python-jose** — JWT creation and verification
- **passlib (bcrypt)** — password hashing

### AI Layer
- **Google Gemini 1.5 Flash** — LLM for code generation, debugging, explanation
- **Custom prompt engineering** — structured JSON prompt format for reliable parsing

### Database
- **SQLite** (development) — zero-configuration, file-based
- **Architecture supports PostgreSQL** — single DATABASE_URL change

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React + TypeScript + Vite + Tailwind            │
│  Monaco Editor  │  React Router  │  Axios        │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST (JSON)
                     │ JWT in Authorization header
┌────────────────────▼────────────────────────────┐
│                   BACKEND                        │
│  FastAPI + Pydantic + python-jose                │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ API Routes  │  │   AI Abstraction Layer   │  │
│  │ /auth       │  │   AIServiceBase (ABC)    │  │
│  │ /api/gen    │  │   ↓                      │  │
│  │ /api/debug  │  │   GeminiAdapter          │  │
│  │ /api/explain│  │   (OpenAIAdapter: R2)    │  │
│  │ /api/history│  └──────────┬───────────────┘  │
│  └──────┬──────┘             │                  │
│         │              Google Gemini API         │
│  ┌──────▼──────────────────────────────────┐    │
│  │       SQLAlchemy ORM                    │    │
│  │  Users | CodeSessions | AIRequests      │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                         │
                    SQLite (dev)
              PostgreSQL (production)
```

---

## 12. Module Description

### Authentication Module
- **Files**: `app/api/auth.py`, `app/core/security.py`, `app/schemas/auth.py`
- **Purpose**: User registration, login, JWT creation and validation
- **Key decisions**: bcrypt for passwords, JWT stored client-side (no server sessions), `get_current_user` dependency injects user into all protected routes

### AI Abstraction Module
- **Files**: `app/ai/base.py`, `app/ai/gemini_adapter.py`, `app/ai/ai_factory.py`
- **Purpose**: Decouples the application from any specific AI provider
- **Key pattern**: `AIServiceBase` is an abstract base class. `GeminiAdapter` implements it. `ai_factory.get_ai_service()` returns the right adapter from config. To add OpenAI: create `openai_adapter.py`, add case to factory.

### Code Generation Module
- **Files**: `app/api/generate.py`, `app/schemas/generate.py`
- **Purpose**: Accepts a natural language prompt + language, returns structured code + explanation

### Debug Module
- **Files**: `app/api/debug_explain.py` (debug route), `app/schemas/debug_explain.py`
- **Purpose**: Accepts code, returns structured issue list with severity, category, line, explanation, fix, and corrected code

### Explanation Module
- **Files**: `app/api/debug_explain.py` (explain route)
- **Purpose**: Accepts code, returns purpose, logic breakdown, key sections, and potential issues

### History Module
- **Files**: `app/api/history.py`, `app/models/session.py`, `app/models/ai_request.py`
- **Purpose**: Stores every AI interaction, exposes paginated + filterable history, delete endpoint

---

## 13. Database Schema

### Users Table
```sql
CREATE TABLE users (
    id          VARCHAR(36) PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  DATETIME NOT NULL
);
```

### CodeSessions Table
```sql
CREATE TABLE code_sessions (
    id                  VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    session_type        VARCHAR(20) NOT NULL,  -- generate/debug/explain
    language            VARCHAR(20) NOT NULL,
    input_prompt        TEXT NOT NULL,
    output_code         TEXT,
    output_explanation  TEXT,
    output_raw          TEXT,                  -- full JSON from AI
    created_at          DATETIME NOT NULL
);
```

### AIRequests Table
```sql
CREATE TABLE ai_requests (
    id              VARCHAR(36) PRIMARY KEY,
    session_id      VARCHAR(36) REFERENCES code_sessions(id) ON DELETE CASCADE,
    user_id         VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    request_type    VARCHAR(20) NOT NULL,
    tokens_used     INTEGER,
    status          VARCHAR(20) DEFAULT 'success',
    error_message   VARCHAR(500),
    created_at      DATETIME NOT NULL
);
```

---

## 14. Initial Test Cases

| ID | Module | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|---|
| TC-AUTH-001 | Auth | Register valid user | username, email, password | 201 + JWT token | PASS |
| TC-AUTH-002 | Auth | Register duplicate username | existing username | 400 "already taken" | PASS |
| TC-AUTH-003 | Auth | Register duplicate email | existing email | 400 "already registered" | PASS |
| TC-AUTH-004 | Auth | Weak password | 5-char password | 422 validation error | PASS |
| TC-AUTH-005 | Auth | Login correct credentials | email + password | 200 + JWT | PASS |
| TC-AUTH-006 | Auth | Login wrong password | wrong password | 401 Unauthorized | PASS |
| TC-GEN-001 | Generate | No auth | request without JWT | 401 Unauthorized | PASS |
| TC-GEN-002 | Generate | Empty prompt | prompt="" | 422 validation error | PASS |
| TC-GEN-003 | Generate | Valid prompt (mocked AI) | valid prompt | 200 + code + explanation | PASS |
| TC-GEN-004 | Generate | AI failure (mocked) | AI returns error | 502 Bad Gateway | PASS |

---

## 15. Review 1 Demo Flow

**Scenario: A student uses the platform to write and debug a Python sorting function.**

1. Open browser at `http://localhost:5173`
2. Click "Create one" → Register with username/email/password
3. Observe: Redirected to Dashboard showing 0 sessions, greeting with username
4. Click **Generate Code** in sidebar
5. Select language: **Python**
6. Enter prompt: *"Create a function to sort a list using bubble sort and return both the sorted list and number of swaps"*
7. Click **Generate Code**
8. Observe: Monaco editor populates with complete bubble sort code; explanation panel appears below
9. Click **Copy** — code is in clipboard
10. Navigate to **Debug Code**
11. Click "Load example" to load buggy code
12. Click **Analyze & Debug**
13. Observe: Issue cards appear (off-by-one error, wrong initial value) with severity badges, line numbers, explanations, and suggested fixes
14. Observe: Corrected code appears in Monaco editor below
15. Navigate to **Explain Code**
16. Load the quicksort example
17. Click **Explain Code**
18. Observe: Purpose, "How it works", Key Sections, and Potential Issues panels appear
19. Navigate to **History**
20. Observe: 3 sessions listed (generate, debug, explain) with timestamps and types
21. Hover over a session — delete button appears
22. Navigate to **Dashboard**
23. Observe: Stats show Total=3, Generated=1, Debugged=1, Explained=1

---

## 16. Future Scope (Review 2 & 3)

### Review 2
- Secure code execution via Docker sandbox
- Time and space complexity analysis
- Automated test case generation
- Code quality score (0–100)
- Auto-fix ("Fix this code" one-click)
- Advanced multi-issue debug report

### Review 3
- AI coding chat assistant with code context
- Security vulnerability scanner (static analysis)
- Project workspace (group sessions into projects)
- PDF/HTML report generation
- Admin analytics dashboard
- Comprehensive test suite generation
