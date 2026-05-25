---
globs: "server/src/**/*.ts"
---

# Backend Rules — Stratum CMS (Express + Prisma)

## Controller Layer
- Every controller function must be wrapped in `asyncHandler`. Never use raw try/catch in controllers.
- Controllers are thin: parse `req.body`, `req.params`, `req.query`, or `req.user`, call the service, wrap result in `ResponseEnvelope`, return. No business logic.
- Controllers must not import Prisma, PrismaService, or any database module directly.
- One controller file per domain: `auth.controller.ts`, `projects.controller.ts`, etc. Never combine domains.

## Service Layer
- Services contain all business logic. They receive typed parameters and return data.
- Services must not import `req`, `res`, `next`, or any Express types. They are framework-agnostic.
- Throw `ApiError` for all known error conditions: `new ApiError(statusCode, 'ERROR_CODE', 'message')`. Use only error codes from the locked catalogue in `api_contracts.md` §2.
- Use `PrismaService` singleton for all database access. Never instantiate a new `PrismaClient`.

## Response Envelope
- Every response — success or failure — must use `ResponseEnvelope`: `{ success, data, error, statusCode }`.
- Do not construct the envelope shape manually. Use the `ResponseEnvelope` utility.
- Success status codes: 200 for reads/updates, 201 for creates, 204 for deletes.

## Middleware Chain
- Middleware order is fixed and must not be rearranged: Body parser → ValidateMiddleware (Zod) → AuthMiddleware → RoleMiddleware → Controller.
- AuthMiddleware must not be applied to public endpoints. RoleMiddleware must not be applied to non-admin endpoints.

## Security
- Never write raw SQL. All database access through Prisma parameterized queries only.
- Never hardcode secrets, tokens, passwords, or API keys. All secrets come from `env.ts` config.
- Content queries on private endpoints must always filter by `req.user.userId` from the JWT. Never accept `userId` from request body or params on authenticated content endpoints.
- Login error responses must not differentiate between "user not found" and "wrong password" — both return `INVALID_CREDENTIALS`.

## File Organization
- Shared infrastructure lives under `/config` and `/services` — never inlined into controllers.
- `/jobs` is reserved for scheduled work only (e.g., `blacklistCleanup.ts`).
- One file per domain across controllers, services, routes, validators. No multi-domain files.
