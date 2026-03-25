---
name: project_architecture
description: Core architectural patterns, base classes, and module layout for the Roomio backend
type: project
---

# Roomio Backend Architecture

**Why:** Recorded to give future review sessions immediate context on established conventions.
**How to apply:** Use these facts to correctly interpret rule checks without re-reading every file.

## Key base classes
- `BaseAppError` is defined in `src/errors/base.py`. All module error classes must inherit from it.
- `ErrorData` (dataclass) is the required constructor argument for every `BaseAppError` subclass — it carries `detail`, `error_code`, `status_code`, and `context`.
- `TenantRepository` is defined in `src/common/database/repository.py`. Tenant-scoped repositories inherit from it.
- `UnitOfWork` is defined in `src/common/database/unit_of_work.py`. It owns the `session.commit()` call on success — repositories must only call `flush()`.
- `di.py` exports `TenantDep` and `AdminDep` as the canonical DI type aliases.

## Response envelope pattern
- All API responses use a `Response(data=...)` model, e.g. `SettingsResponse(data=result)`.
- `HealthResponse` and `MeResponse` / `AdminTestResponse` are flat models returned directly (not enveloped). These are intentionally exceptions to Rule 3 for simple informational endpoints.

## Module layout
- `src/settings/` — full stack: models, router, service, repositories, errors, ORM models, UoW.
- `src/profile/` — full stack: models, router, service, repositories, errors, ORM models, UoW. Reviewed 2026-03-24. See profile module notes below.
- `src/routes/` — thin utility routes: health, me (no service layer needed).
- `src/auth/` — Clerk JWT authentication. `AuthError` lives in `dependencies.py` (not a dedicated `errors.py`).
- `src/listings/` — full stack: models, router, service, repositories, errors, ORM models, UoW. Reviewed 2026-03-23 — CLEAN, zero violations across all 14 rules.

## listings module notes (reviewed 2026-03-23)
- `ListingType`, `GenderPref`, `ListingStatus` are all proper `StrEnum` subclasses (Rule 4 satisfied).
- `ListingResponse(data=...)` and `ListingsResponse(data=...)` are the envelope models used on all endpoints (Rule 3 satisfied).
- `ListingsRepository` inherits `TenantRepository`; public methods (`get_all_active`, `get_public_by_id`) intentionally bypass tenant filter for public-access endpoints — this is by design, not a Rule 11 violation.
- `di.py` exports `ListingsServiceDep` and `PublicListingsServiceDep` — both used correctly in the router (Rule 14 satisfied).
- `ListingError` in `errors.py` inherits `BaseAppError`, has two `@classmethod` factories both with `error_code` and explicit `context` (Rules 5, 6, 7 satisfied).
- DELETE endpoint uses `response_model=None` with HTTP 204 — this is the correct FastAPI pattern and is not a Rule 13 violation.

## profile module notes (reviewed 2026-03-24)
- Module is now a full DB-backed stack: models, router, service, repositories, errors, ORM models, UoW.
- `ProfileError` correctly lives in `src/profile/errors.py` and inherits `BaseAppError`. Previous debt (error class inside router.py) is resolved.
- `ProfileUnitOfWork` in `src/profile/database/unit_of_work.py` imports from `models` (top-level) and `profile.repositories` — correct structure.
- Rule 1: Both endpoints return `ProfileResponse(data=result)` — CLEAN.
- Rule 2: All fields in `Profile`, `ProfileUpdate`, `ProfileResponse` have `Field(description=...)` — CLEAN.
- Rule 3: Both endpoints wrap in `ProfileResponse(data=...)` — CLEAN.
- Rule 4: `Occupation` is a proper `StrEnum` — CLEAN.
- Rule 5: `ProfileError(BaseAppError)` in `errors.py` — CLEAN.
- Rule 6: Errors only created via `@classmethod` factories — CLEAN.
- Rule 7: Both factory methods pass `error_code` and `context` inside `ErrorData` — CLEAN.
- Rule 8: No raw `HTTPException` anywhere in the module — CLEAN.
- Rule 9: `ProfileRepository` returns Pydantic `Profile` models via `to_model()` — CLEAN.
- Rule 10: Repositories use `flush()` only (via `BaseRepository._create/_update`) — CLEAN.
- Rule 11: `ProfileRepository` inherits `TenantRepository` — CLEAN.
- Rule 12: `router.py` is thin — delegates entirely to `ProfileService` — CLEAN.
- Rule 13: Both endpoints have `response_model=ProfileResponse` — CLEAN.
- Rule 14: Router imports `ProfileServiceDep` from `di.py` — CLEAN.

## messages module notes (reviewed 2026-03-25)
- `MessageError(BaseAppError)` in `errors.py` with three `@classmethod` factories — all set `error_code` and `context` (Rules 5, 6, 7 satisfied).
- `ConversationRepository` and `MessageRepository` both inherit `BaseRepository` (not `TenantRepository`) — correct: conversations are shared between two participants, not owned by a single tenant.
- All repository methods return Pydantic models via `to_model()`/`to_model_list()` — CLEAN.
- Repositories use `flush()` only (never `commit()`) — CLEAN.
- `ConversationStatus` is a proper `StrEnum` — CLEAN (Rule 4).
- All models use `Field(description=...)` on every field — CLEAN (Rule 2).
- All five endpoints wrapped in `ConversationsResponse(data=...)`, `ConversationResponse(data=...)`, `MessagesResponse(data=...)` — CLEAN (Rules 1, 3).
- All five endpoints have `response_model=` — CLEAN (Rule 13).
- Router uses `MessagesServiceDep` from `di.py`; `di.py` wires `get_messages_service` with `TenantDep` — auth enforced on all endpoints (Rules 6, 14).
- No raw `HTTPException` anywhere in the module — CLEAN (Rule 8).
- Two routers exported: `router` (conversation routes) and `listings_router` (prefixed `/api/v1/listings`) — both registered in `main.py`.
- N+1 WARNING: `get_my_conversations` fetches last_message per-conversation in a Python loop (one extra query per conversation). Not a rule violation but a performance concern worth tracking.
- `send_message` returns `MessagesResponse(data=[msg])` (list-of-one). Semantically a WARNING: a single message is returned as a list response. Not a hard rule violation since `response_model=MessagesResponse` is set, but consider a `MessageResponse(data=Message)` envelope for this endpoint.
- `start_conversation` uses `MessageError.forbidden` to signal "owner cannot message themselves" — reuses the CONVERSATION_FORBIDDEN error code for a listing-context rejection. Not a hard violation but the `error_code` and `context` carry `listing_id` rather than `conversation_id`, which is accurate.

## Known architectural debt
- (Profile router debt resolved as of 2026-03-24 review.)
- `src/auth/dependencies.py:118` has an inline `Depends(get_tenant_context_from_header)` inside `require_admin` that is not aliased through `di.py` — WARNING (internal wiring, not a public router annotation).
- `src/routes/health.py` and `src/routes/me.py` return flat Pydantic models without a `Response(data=...)` envelope — teams have implicitly waived Rule 3 for these utility endpoints.

## Confirmed clean (previously flagged, now resolved)
- `src/settings/router.py` correctly imports `SettingsServiceDep` from `di.py`. `di.py` also defines `get_settings_service` and the `SettingsServiceDep` alias. Rule 14 is satisfied for the settings router as of the last review (2026-03-22).

## AuthError factory gap (Rule 7)
- `src/auth/dependencies.py`: `AuthError.missing_token()` and `AuthError.invalid_token()` do NOT pass a `context` argument to `ErrorData` — `ErrorData.context` defaults to `{}` via `field(default_factory=dict)`, so no explicit `context` key appears in the factory. Recorded as a Rule 7 WARNING (the default exists but is not explicit).
