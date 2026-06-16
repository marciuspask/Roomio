# Roomio

> Flatmate-finding platform for Vilnius — verified listings, real profiles, no scams.

Built to replace chaotic Facebook groups with something trustworthy and simple. Students and young professionals can browse rooms, post listings, and message directly.

**[Live Demo](https://roomio.lt)** · [Backend API Docs](https://api.roomio.lt/docs)

---

## Features

- **Listings** — post and browse rooms with photos, price, location, and availability
- **Verified profiles** — phone verification via SMS, verification badges
- **Real-time messaging** — WebSocket-based chat between landlords and tenants
- **Saved listings** — bookmark listings for later
- **Verified-only filter** — browse only listings from verified users
- **Block & report** — user safety tools with moderation system
- **Payments** — Stripe integration for listing promotions
- **Lithuanian & English** — full i18n support

---

## Tech Stack

### Backend
| | |
|---|---|
| **Runtime** | Python 3.12 |
| **Framework** | FastAPI |
| **Database** | PostgreSQL + SQLAlchemy (async) + asyncpg |
| **Authentication** | Clerk |
| **Real-time** | WebSockets |
| **Phone verification** | Twilio |
| **Payments** | Stripe |
| **Error tracking** | Sentry |
| **Logging** | structlog |
| **Package manager** | uv |

### Frontend
| | |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Authentication** | Clerk |
| **Testing** | Vitest |

### Infrastructure
| | |
|---|---|
| **Backend hosting** | Google Cloud Run |
| **Frontend hosting** | Cloudflare Pages |
| **Container registry** | Google Artifact Registry |
| **CI/CD** | GitHub Actions |
| **DNS & CDN** | Cloudflare |

---

## Architecture

```
Browser
  │
  ├── Cloudflare Pages (React SPA)
  │     └── api calls ──► Cloudflare Proxy
  │                             │
  │                             ▼
  │                       Google Cloud Run
  │                       (FastAPI + Docker)
  │                             │
  │                    ┌────────┴────────┐
  │                    ▼                 ▼
  │               PostgreSQL          Clerk
  │               (database)          (auth)
  │
  └── WebSocket ──► Cloud Run (real-time messaging)
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
cp .env.example .env      # fill in your values
uv sync
uv run uvicorn main:app --reload --app-dir src
```

API available at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
bun install
bun run dev
```

App available at `http://localhost:5173`

---

## CI/CD

Every push to `main` runs automated checks via GitHub Actions:

- **Backend**: ruff lint, ruff format, pyright type checking
- **Frontend**: ESLint, TypeScript type checking, Vitest tests

Every git tag (`v*`) triggers a full deployment to Cloud Run and Cloudflare Pages.

---

## Project Structure

```
roomio/
├── backend/
│   ├── src/
│   │   ├── auth/           # Clerk authentication
│   │   ├── listings/       # Listing CRUD + search
│   │   ├── messages/       # WebSocket messaging
│   │   ├── profile/        # User profiles
│   │   ├── payments/       # Stripe integration
│   │   ├── moderation/     # Block & report
│   │   ├── phone_verification/
│   │   └── saved/          # Saved listings
│   └── Dockerfile
└── frontend/
    └── src/
        ├── features/       # Feature-based modules
        ├── components/     # Shared UI components
        └── api/            # API client layer
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/roomio
CLERK_SECRET_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
STRIPE_SECRET_KEY=...
SENTRY_DSN=...
```

---

*Built by [Martynas Paškevicius](https://github.com/marciuspask)*
