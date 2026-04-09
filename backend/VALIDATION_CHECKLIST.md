# Validation Checklist — Code Review Judge

This checklist is used by automated reviewers to validate code changes against the project's established patterns. Each rule is a pass/fail check with a clear do/don't.

---

## 1. Error Handling

### 1.1 No HTTPException in services

- **Do:** Raise `BaseAppError` subclasses (e.g., `ProfileError.underage()`) from service files.
- **Don't:** Import or raise `HTTPException` from any file under `src/*/service.py`.
- **Check:** `grep -r "from fastapi" src/*/service.py` must return nothing.

### 1.2 No RuntimeError for expected conditions

- **Do:** Raise a `BaseAppError` subclass when the condition can occur in production (missing auth, not found, forbidden).
- **Don't:** Raise `RuntimeError`, `ValueError`, or bare `Exception` for business logic errors.
- **Exception:** `RuntimeError` is acceptable for truly impossible states (unreachable code, programming errors that indicate a bug).

### 1.3 No internal details in error responses

- **Do:** Log full error details server-side with `logger.error(...)` including `exc_info=True`.
- **Don't:** Include `str(exc)`, `type(exc).__name__`, stack traces, or file paths in JSON responses returned to clients.
- **Check:** The `generic_exception_handler` response `context` must be empty (`{}`).

### 1.4 Every domain error uses factory classmethods

- **Do:** Define errors as `@classmethod` factories on a `BaseAppError` subclass: `cls(ErrorData(detail=..., error_code=..., status_code=..., context=...))`.
- **Don't:** Instantiate `ErrorData` or `BaseAppError` directly at the call site.
- **Check:** Every `raise` in service files targets a `SomethingError.method_name()` pattern.

### 1.5 WebSocket errors are explicit

- **Do:** Catch specific exception types (`except MessageError`, `except AuthError`) separately from `except Exception`.
- **Don't:** Use `except Exception` as the only handler, or combine domain + base exceptions (e.g., `except (MessageError, Exception)`).
- **Do:** Log infrastructure errors in WebSocket handlers with `exc_info=True`.
- **Do:** Use defined `WsCloseCode` constants, not hardcoded integers.

---

## 2. Naming Conventions

### 2.1 ORM models use `*ORM` suffix

- **Do:** `ListingORM`, `ProfileORM`, `ConversationORM`, `ConversationParticipantORM`.
- **Don't:** `Listing`, `Profile`, `ConversationModel`, `ConversationTable`.
- **Check:** Every class inheriting from `Base` in `database/orm_models.py` files must end with `ORM`.

### 2.2 Route response models use `*Response` suffix with `data:` envelope

- **Do:** `ListingResponse(data=Listing)`, `ListingsResponse(data=list[Listing])`.
- **Don't:** Return domain models directly as `response_model`. Don't return unwrapped primitives or dicts.
- **Check:** Every `response_model=` in router files references a class ending in `Response`.

### 2.3 Route input models use `*Create` / `*Update` suffix

- **Do:** `ListingCreate`, `ListingUpdate`, `ProfileUpdate`, `MessageCreate`.
- **Don't:** Use the domain model (`Listing`) as a request body. Don't name them `*Request`.

### 2.4 Domain models have no suffix

- **Do:** `Listing`, `Profile`, `Conversation`, `Message`, `Settings`.
- **Don't:** `ListingModel`, `ListingDTO`, `ListingSchema`.

---

## 3. Repository Layer

### 3.1 Repositories are single-table

- **Do:** A repository queries only its own ORM model's table.
- **Don't:** Import or query another module's ORM model inside a repository (e.g., `ListingsRepository` must not import `ProfileORM`).
- **Check:** `grep -r "from profile.database" src/listings/` (and similar cross-module imports) must return nothing in repository files.

### 3.2 Use parent `_create` and `_update` methods

- **Do:** Call `await self._create(data)` or `await self._create(data, extra_fields=...)` from concrete repository methods.
- **Don't:** Manually construct ORM entities, call `session.add()`, `session.flush()`, `session.refresh()` when the parent method already does this.
- **Exception:** `ConversationRepository.create_conversation()` and `MessageRepository.create_message()` may construct entities directly because they don't use `TenantRepository` (conversations are not single-tenant-scoped).

### 3.3 Repositories flush, never commit

- **Do:** Call `await self.session.flush()` after mutations.
- **Don't:** Call `await self.session.commit()` — that's the UnitOfWork's job.

### 3.4 No Pydantic model mutation

- **Do:** Use `model.model_copy(update={...})` to create modified copies.
- **Don't:** Mutate Pydantic model attributes after creation (e.g., `listing.poster_display_name = ...`).
- **Check:** No direct attribute assignment on Pydantic model instances in repository or service files (except during construction).

### 3.5 Queries that return public data filter out anonymous

- **Do:** Add `.where(OrmClass.tenant_type == "user")` to queries that return data visible to other users (e.g., public listing feeds).
- **Don't:** Return anonymous tenant data in public-facing endpoints.

---

## 4. Service Layer

### 4.1 Services don't import from fastapi

- **Do:** Import only domain models, errors, repositories, and UoW.
- **Don't:** Import `HTTPException`, `status`, `Request`, `Depends`, or any other FastAPI symbol.
- **Check:** `grep -r "from fastapi" src/*/service.py` must return nothing.

### 4.2 Services use UnitOfWork for database access

- **Do:** Access repositories through a UoW context manager: `async with self._uow() as uow:`.
- **Don't:** Hold a session directly, call repository methods outside a UoW context, or create sessions manually.

### 4.3 Enrichment happens in services, not repositories

- **Do:** Fetch raw data from the repository, then enrich (add display names, redact fields) in the service using `model_copy()`.
- **Don't:** Join or query other modules' tables inside a repository to enrich data.

### 4.4 Tenant context is validated before use

- **Do:** Check `_require_tenant()` or equivalent before accessing tenant-scoped operations.
- **Don't:** Assume `tenant_context` is always present — `ListingsService` accepts `None` for public endpoints.
- **Do:** Raise `AuthError.missing_token()` (not `RuntimeError`) when tenant context is required but missing.

---

## 5. Dependency Injection

### 5.1 No global state or singletons

- **Do:** Use instance-based classes with `self` state. Store long-lived objects in `app.state` during lifespan.
- **Don't:** Use module-level globals with `global` keyword. Don't use `@staticmethod` on classes that manage state.
- **Check:** `grep -r "^global " src/` should return nothing.

### 5.2 All service construction goes through `di.py`

- **Do:** Define factory functions in `di.py` and use `Annotated[Service, Depends(factory)]` patterns.
- **Don't:** Manually construct services by pulling from `app.state` in route handlers or WebSocket handlers.
- **Check:** Only `di.py` and `lifespan()` should access `request.app.state` or `websocket.app.state`.

### 5.3 No duplicated anonymous context

- **Do:** Use a single centralized `get_anonymous_context()` function from `auth/dependencies.py`.
- **Don't:** Create `_ANON_CONTEXT` sentinel objects in service files.
- **Check:** `grep -r "_ANON_CONTEXT" src/` should return nothing.

---

## 6. Type Safety

### 6.1 No bare generic types

- **Do:** `Mapped[list[str]]`, `dict[str, int]`, `list[Listing]`.
- **Don't:** `Mapped[list]`, `dict`, `list` without type parameters in type annotations.
- **Check:** `grep -rn "Mapped\[list\]" src/` must return nothing.

### 6.2 No `Any` in business logic

- **Do:** Use specific types. If a method accepts multiple types, use `Union` or `TypeVar`.
- **Don't:** Use `Any` in service or repository method signatures for business parameters.
- **Exception:** `Any` is acceptable in framework plumbing (`UnitOfWorkFactory.create(*args: Any)`) with a comment explaining why.

### 6.3 All methods have return type annotations

- **Do:** Every public and private method has an explicit return type, including `-> None`.
- **Don't:** Omit return types on helper methods like `_uow()`, `_require_tenant()`, etc.

### 6.4 Minimize `# type: ignore` comments

- **Do:** Fix the underlying type issue when possible.
- **Don't:** Add `# type: ignore` without a comment explaining why it's necessary.
- **Check:** Every `# type: ignore` should have a justification suffix (e.g., `# type: ignore[attr-defined] — dynamic attribute from SQLAlchemy`).

---

## 7. Tenant Isolation

### 7.1 Tenant-scoped entities use `TenantAwareModel` mixin

- **Do:** All ORM models that belong to a single tenant inherit from `TenantAwareModel`.
- **Don't:** Manually add `tenant_id` and `tenant_type` columns without the mixin.
- **Exception:** `ConversationORM` (multi-participant — isolation via join table) and `MessageORM` (scoped via conversation, not tenant).

### 7.2 Tenant-scoped repositories extend `TenantRepository`

- **Do:** `ProfileRepository(TenantRepository[...])`, `SettingsRepository(TenantRepository[...])`.
- **Don't:** Use `BaseRepository` for entities that belong to a single tenant.

### 7.3 `TenantContext` is frozen (immutable)

- **Do:** `TenantContext` uses `ConfigDict(frozen=True)`. Never attempt to modify it after creation.
- **Don't:** Create mutable tenant context objects or modify tenant fields mid-request.

### 7.4 Multi-participant entities use a join table

- **Do:** Use a `conversation_participants` table with `TenantAwareModel` for many-to-many tenant relationships.
- **Don't:** Store participant lists as JSONB arrays on the parent entity.

### 7.5 Input models don't expose server-controlled fields

- **Do:** Separate client-facing update models from internal/system update models.
- **Don't:** Allow clients to set `age`, `is_email_verified`, `is_phone_verified`, `tenant_id`, `tenant_type`, or other server-computed/trust-sensitive fields via request body.
- **Check:** Fields like `age`, `is_*_verified`, `tenant_id` must not appear in `*Create` or `*Update` models used as route body parameters.

---

## 8. Unit of Work

### 8.1 UoW is the transaction boundary

- **Do:** UoW commits on success, rolls back on exception. Repositories only flush.
- **Don't:** Commit inside a repository. Don't create transactions outside the UoW.

### 8.2 UoW accepts TenantContext consistently

- **Do:** Every UoW that contains a `TenantRepository` must receive `TenantContext` in its constructor.
- **Don't:** Create UoWs that skip `TenantContext` when their repositories need it.

### 8.3 Cross-module reads use composite UoW

- **Do:** Add read-only repositories from other modules to the UoW constructor for enrichment.
- **Don't:** Create multiple UoW instances in a single service method to access different modules (wastes connections).

---

## 9. Pagination

### 9.1 List endpoints support pagination

- **Do:** Accept `limit` (with max cap, e.g., `le=100`) and `offset` query parameters.
- **Don't:** Return unbounded result sets from list endpoints.

### 9.2 Paginated queries have deterministic ordering

- **Do:** Always include `ORDER BY` with `LIMIT`/`OFFSET` (e.g., `.order_by(OrmClass.created_at.desc())`).
- **Don't:** Use `LIMIT`/`OFFSET` without `ORDER BY` — results may vary between pages.

### 9.3 Paginated responses include metadata

- **Do:** Return `total`, `limit`, and `offset` alongside `data` in list response models.
- **Don't:** Return only the data array with no indication of total count or current position.

---

## 10. Code Organization

### 10.1 Feature modules follow consistent structure

- **Do:** Each feature module has: `models.py`, `service.py`, `router.py`, `repositories.py`, `errors.py`, `database/orm_models.py`, `database/unit_of_work.py`.
- **Don't:** Put ORM models in `models.py`, mix route handlers with business logic, or skip the errors file.

### 10.2 No code duplication across modules

- **Do:** Extract shared logic to `common/` or a shared utility.
- **Don't:** Copy-paste the same pattern (sentinel objects, enrichment logic, context builders) across multiple service files.

### 10.3 Routes are thin adapters

- **Do:** Routes parse input, call one service method, wrap the result in a response model.
- **Don't:** Put business logic, database queries, or enrichment logic in route handlers.
- **Check:** Route functions should be 1-5 lines of logic (excluding decorators and type hints).

---

## Quick grep checks

Run these from the `backend/` directory to catch common violations:

```bash
# No fastapi imports in services
grep -r "from fastapi" src/*/service.py

# No global keyword
grep -rn "^global " src/

# No bare Mapped[list]
grep -rn "Mapped\[list\]" src/

# No _ANON_CONTEXT duplicates
grep -rn "_ANON_CONTEXT" src/

# No cross-module ORM imports in repositories
grep -rn "from profile.database" src/listings/ src/messages/ src/saved/ src/settings/
grep -rn "from listings.database" src/profile/ src/messages/ src/saved/ src/settings/

# No direct model mutation (assignment to pydantic model attributes)
# This requires manual review — grep for patterns like `listing.poster_` or `model.field =`

# type: ignore without justification
grep -rn "type: ignore$" src/
```
