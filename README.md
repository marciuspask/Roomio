# Roomio

> Flatmate-finding platform for Vilnius — verified listings, real profiles, no scams.

Built to replace chaotic Facebook groups with something trustworthy and simple. Students and young professionals can browse rooms, post listings, and message directly.

**[Live Demo](https://roomio.lt)** · [API Docs](https://api.roomio.lt/docs)

---

## Features

- Browse and post room listings with photos, price, location, and availability
- Phone-verified profiles with verification badges and verified-only filter
- Real-time messaging between landlords and tenants via WebSockets
- Stripe-powered listing boosts for promoted visibility
- Block & report system with moderation tools
- Anonymous browsing → seamless account migration on sign-up
- Bug report modal with direct Sentry integration
- Lithuanian & English (full i18n)

---

## Architecture

```
Browser
  │
  ├── Cloudflare Pages ──► React SPA (TypeScript + Vite)
  │         │
  │         │  HTTPS via Cloudflare Proxy
  │         ▼
  │   Google Cloud Run ──► FastAPI (Python 3.12, Docker)
  │         │
  │    ┌────┴────────────────────────────┐
  │    ▼                                 ▼
  │ PostgreSQL                      External APIs
  │ (async SQLAlchemy)         Clerk · Twilio · Stripe · Sentry
  │
  └── WebSocket ──────────────► Cloud Run (real-time chat)
```

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI + Python 3.12 |
| Database | PostgreSQL + SQLAlchemy (async) + asyncpg |
| Authentication | Clerk (JWT verification) |
| Real-time | WebSockets |
| Phone verification | Twilio SMS |
| Payments | Stripe (Checkout + Webhooks) |
| Error tracking | Sentry |
| Logging | structlog (structured JSON) |
| Package manager | uv |
| Containerization | Docker (`linux/amd64`) |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite + SWC |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Server state | TanStack React Query |
| Authentication | Clerk |
| Error tracking | Sentry |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |

### Infrastructure

| | |
|---|---|
| Backend hosting | Google Cloud Run |
| Frontend hosting | Cloudflare Pages |
| Container registry | Google Artifact Registry |
| DNS & CDN | Cloudflare |
| CI/CD | GitHub Actions |

---

## Backend Design Patterns

### Repository + Unit of Work
Data access is separated from business logic. Repositories handle queries; the Unit of Work manages transaction boundaries. No service ever calls `commit()` directly — the UoW handles atomicity.

```
Service → UnitOfWork → Repository → SQLAlchemy ORM → PostgreSQL
```

Generic base repository (`BaseRepository[TOrm, TModel]`) provides type-safe ORM-to-Pydantic conversion without boilerplate. Each repository flushes; the UoW commits when the full operation succeeds.

### Dependency Injection
Services are wired via FastAPI's DI system. Every endpoint declares its dependencies as function parameters — nothing is imported globally or instantiated inside business logic. Composable and testable.

### Multi-Tenant Isolation
All query repositories inherit from `TenantRepository`, which automatically scopes every query to the current user's `tenant_id`. It is impossible to accidentally read another user's data — the filter is enforced at the base class level, not left to individual developers.

### Error Handling
All business errors inherit from `BaseAppError` and carry a machine-readable `error_code`, HTTP status, and context. Every response shape is consistent — frontend never needs to guess the error format.

```python
raise ProfileError.not_found(user_id)
# → 404 { "error_code": "PROFILE_NOT_FOUND", "detail": "...", "context": { "user_id": "..." } }
```

A global FastAPI exception handler catches unhandled exceptions, logs them, and returns the same shape.

### Anonymous → Registered User Migration
Users can browse and interact anonymously (via `X-Anonymous-Id`). On sign-up, a migration service atomically re-attributes all their data (listings, saved items, messages) to their new registered account. Zero data loss, single transaction.

### Structured Logging
Every service logs structured JSON via `structlog`. Logs carry contextual fields (`tenant_id`, `listing_id`, `error_code`) and ship directly to Sentry in production. No `print()` debugging.

---

## Frontend Design Patterns

### Type-Safe API Client (OpenAPI Codegen)
FastAPI auto-generates an OpenAPI schema. The frontend runs `npm run codegen` to generate a fully-typed TypeScript HTTP client from that schema. No manual type duplication across the stack.

```
FastAPI routes → OpenAPI JSON → swagger-typescript-api → typed TS client
```

### Axios Interceptor
A single Axios interceptor fetches the Clerk JWT and injects `Authorization: Bearer {token}` on every outgoing request. No auth logic inside individual API calls.

### WebSocket with Exponential Backoff
Real-time chat is powered by a custom React hook that:
- Fetches a fresh Clerk token before opening the socket
- Reconnects with exponential backoff (up to 30s) on disconnect
- Pushes incoming messages directly into React Query's cache — no manual state sync

### Server State with React Query
All server data (listings, conversations, profiles) is managed by TanStack React Query. Query keys are parameterized for pagination. WebSocket events mutate the cache directly, so the UI updates without polling.

---

## External Integrations

| Service | What it does |
|---|---|
| **Clerk** | JWT authentication, user metadata, admin roles. Replaces traditional session management entirely. |
| **Twilio** | SMS OTP for phone verification. Runs in `asyncio.to_thread()` to avoid blocking the async event loop. Rate-limited per phone number. |
| **Stripe** | Creates Checkout sessions for listing boosts. Validates incoming webhooks with Stripe's signing secret. Marks listings as boosted on payment confirmation. |
| **Sentry** | Captures backend exceptions with full context (tenant_id, route, payload). Frontend errors only captured in production. User reports and feedback are forwarded as Sentry events. |

---

## Observability

- **Sentry** — exception tracking with context (backend + frontend)
- **structlog** — structured JSON logs on every operation (listing created, message sent, user blocked, payment received)
- **Health endpoint** — `/health` for Cloud Run uptime checks
- **Startup route logging** — all registered routes and HTTP methods logged on boot

---

## CI/CD

Every push to `main` runs automated checks:

```
push → GitHub Actions
         ├── Backend: ruff lint · ruff format · pyright typecheck
         └── Frontend: eslint · tsc --noEmit · vitest
```

Every git tag (`v1.0.0`, `v1.2.3`, ...) triggers a full deployment:

```
tag → GitHub Actions
        ├── Run all checks
        ├── docker build --platform linux/amd64
        ├── push → Google Artifact Registry
        ├── gcloud run deploy → Cloud Run
        └── wrangler pages deploy → Cloudflare Pages
```

---

## Running Locally

### Prerequisites
- Python 3.12+, [uv](https://docs.astral.sh/uv/)
- Node.js 18+, [Bun](https://bun.sh/)
- PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
uv sync
uv run uvicorn main:app --reload --app-dir src
# → http://localhost:8000
# → http://localhost:8000/docs  (interactive API docs)
```

### Frontend

```bash
cd frontend
bun install
bun run dev
# → http://localhost:5173
```

---

## Project Structure

```
roomio/
├── backend/
│   ├── src/
│   │   ├── auth/               # Clerk JWT verification, admin roles
│   │   ├── common/
│   │   │   └── database/       # Base repository, Unit of Work, ORM base models
│   │   ├── listings/           # Listing CRUD, search, filters
│   │   ├── messages/           # WebSocket chat, conversation management
│   │   ├── profile/            # User profiles, verification status
│   │   ├── phone_verification/ # Twilio OTP flow
│   │   ├── payments/           # Stripe checkout, webhook handling
│   │   ├── moderation/         # Block & report system
│   │   ├── migration/          # Anonymous → registered user migration
│   │   ├── feedback/           # Bug reports → Sentry
│   │   ├── saved/              # Saved listings
│   │   └── settings/           # User settings
│   └── Dockerfile
└── frontend/
    └── src/
        ├── api/
        │   ├── generated/      # Auto-generated TypeScript client (OpenAPI codegen)
        │   ├── hooks/          # React Query hooks per feature
        │   └── http/           # Axios instance + Clerk interceptor
        ├── features/           # Feature-based page components
        ├── components/         # Shared UI + shadcn/ui components
        └── hooks/              # useWebSocket, use-mobile, etc.
```

---

*Built by [Martynas Paškevicius](https://github.com/marciuspask)*
