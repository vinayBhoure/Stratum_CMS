---
name: api-endpoint
description: >
  Guides adding a new API endpoint to Stratum CMS following locked architectural
  conventions. Use when creating any new route, controller, or service method —
  whether in Phase 1 (scaffolding), Phase 2 (auth), Phase 3 (CRUD), Phase 4 (public API),
  or Phase 5 (admin). Triggers on "add endpoint", "new route", "create API",
  "wire up controller", or any request to expose new HTTP functionality.
---

# Adding an API Endpoint to Stratum CMS

## Purpose

This skill encodes the decision-making process and conventions for wiring a new HTTP endpoint.
It does NOT provide code templates. It provides the framework for deciding *what* the endpoint
should look like and *which* conventions apply.

**Source of truth:**
- Architecture: KB v2.0 §11 (Backend Architecture)
- Contracts: `api_contracts.md` (full endpoint catalogue)
- Error codes: `api_contracts.md` §2 (17-code catalogue)

---

## Step 1 — Identify the Endpoint's Surface

Before writing anything, decide which surface this endpoint belongs to. The decision drives
everything downstream.

| Surface | Base URL | Auth Level | When To Use |
|---|---|---|---|
| **Private (authenticated)** | `/api/v1/...` | `authenticated` | User managing their own content |
| **Private (admin)** | `/api/v1/admin/...` | `masterAdmin` | Master Admin operations |
| **Public** | `/v1/:userId/...` | `public` | Portfolio data consumed externally |

**Critical:** Public endpoints live under a separate base URL (`/v1/`) — not `/api/v1/`.
This separation is locked (KB §3.2). Do not blend them.

---

## Step 2 — Confirm the Endpoint is in the Locked Contracts

If the endpoint already appears in `api_contracts.md`:
- Use the exact path, method, request shape, response shape, and error codes documented there
- Do not invent new conventions for it

If the endpoint is NOT in the contracts:
- **Stop.** Adding endpoints outside the locked contract is a design decision, not an
  implementation decision. Surface this to the developer and update the contract first.

---

## Step 3 — Determine the Middleware Chain

The middleware chain order is fixed (KB §11.3). Apply only what's needed:

```
Body parser → Zod validator → AuthMiddleware → RoleMiddleware → asyncHandler-wrapped Controller
```

Decision rules:

| Endpoint Type | Body Parser | Validator | AuthMiddleware | RoleMiddleware | UploadMiddleware |
|---|---|---|---|---|---|
| Public read | ✓ (app-level) | optional | ✗ | ✗ | ✗ |
| Authenticated read | ✓ | optional (if query params) | ✓ | ✗ | ✗ |
| Authenticated write (JSON) | ✓ | ✓ | ✓ | ✗ | ✗ |
| Authenticated write (file) | ✓ | optional | ✓ | ✗ | ✓ |
| Admin | ✓ | optional | ✓ | ✓ | ✗ |

**Never:** Skip AuthMiddleware on a private endpoint. Never apply AuthMiddleware on a public endpoint.

---

## Step 4 — Decide HTTP Method

Per locked decision D36:
- **GET** — reads (list + single)
- **POST** — creates and non-idempotent actions (login, logout, upload)
- **PUT** — full updates in MVP (will migrate to PATCH later)
- **DELETE** — removals

**Do not:**
- Use PATCH yet (locked for post-MVP)
- Put verbs in paths (e.g., `/projects/create`) — use REST conventions

---

## Step 5 — Wire the Layers

The three-layer separation is non-negotiable (KB §11.1):

**Controller responsibilities:**
- Parse `req.body`, `req.params`, `req.query`, `req.user` (from JWT)
- Call the corresponding service method with typed parameters
- Wrap the result in `ResponseEnvelope` and return
- Must be wrapped in `asyncHandler` — never use raw try/catch
- Must NOT import Prisma directly
- Must NOT contain business logic

**Service responsibilities:**
- Contain all business logic (validation rules, cascade checks, cache invalidation)
- Talk to `PrismaService`, `MediaService`, `CacheService` as needed
- Throw `ApiError` instances for known error conditions
- Must NOT import `req` or `res`
- Must NOT return HTTP-specific shapes (return raw data; controller wraps it)

**Validator (Zod schema) responsibilities:**
- Define the expected shape of `req.body` (and `req.query` if applicable)
- Mirror exactly on the frontend in `/client/src/validators/`
- See the `zod-validation` skill for mirroring strategy

---

## Step 6 — Decide on userId Scoping

For private endpoints, the `userId` ALWAYS comes from the JWT (via `req.user.userId`).
Never from the request body, params, or query.

Decision rules:

| Endpoint Context | Where userId Comes From |
|---|---|
| `/api/v1/me` and content endpoints | `req.user.userId` (JWT) |
| `/api/v1/admin/users/:userId` | `req.params.userId` (admin targets a user) |
| `/v1/:userId/...` (public) | `req.params.userId` (no auth, public lookup) |

**Critical security rule:** A user must NEVER be able to specify a `userId` other than
their own on a private endpoint. The query must always filter by `req.user.userId`.

---

## Step 7 — Apply the Response Envelope

Every response — success or failure — uses the locked shape (decision D48):

```
Success: { success: true, data: <payload>, error: null, statusCode: <2xx> }
Failure: { success: false, data: null, error: { code, message, details? }, statusCode: <4xx/5xx> }
```

Use the helper utility `ResponseEnvelope`. Do not construct the object manually.

For paginated endpoints, the envelope's `data` must include both `items` and `pagination`
(see `api_contracts.md` §1.5).

---

## Step 8 — Choose Error Codes from the Catalogue

Use ONLY error codes from the locked catalogue (`api_contracts.md` §2). The 17 codes cover
every error condition the MVP needs.

Common pairings:
- Validation failure → `VALIDATION_FAILED` (400)
- Missing auth → `UNAUTHENTICATED` (401)
- Wrong role → `FORBIDDEN` (403)
- Resource not found → `NOT_FOUND` (404)
- Reference conflict → `SKILL_IN_USE` / `TAG_IN_USE` (409)
- Unexpected → `INTERNAL_ERROR` (500)

**Do not invent new error codes.** If a needed code is missing, surface to the developer first.

---

## Step 9 — File Placement

Per KB §14, one file per domain across all four locations:

```
/server/src/routes/{domain}.routes.ts
/server/src/controllers/{domain}.controller.ts
/server/src/services/{domain}.service.ts
/server/src/validators/{domain}.schema.ts
```

Then register the route file in `/server/src/routes/index.ts`.

**Do not:** Inline multiple domains in a single file. Do not create generic utility controllers.

---

## Step 10 — Update Documentation

After implementing the endpoint:
- Add an entry to `/docs/tracking/CHANGELOG.md`
- Update task status in `/docs/tracking/TASKS.md` if this completes a tracked task
- If the implementation diverged from the API contract, document the divergence in
  `/docs/tracking/DECISIONS.md` AND update `api_contracts.md` if appropriate

---

## What This Skill Does NOT Cover

- **Validator details** → see `zod-validation` skill
- **Auth implementation** → see `auth-flow` skill (Phase 2+)
- **File upload routes** → see `media-upload` skill (Phase 3+)
- **RTK Query consumption on frontend** → see `rtk-query-slice` skill (Phase 3+)
- **Public API specifics** → see `public-api-endpoint` skill (Phase 4+)
