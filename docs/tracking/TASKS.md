# Stratum CMS — Tasks

## Table of Contents

- [In Progress](#in-progress)
- [Backlog](#backlog)
- [Completed](#completed)

---

## In Progress

---

## Backlog

---

## Completed

### Phase 1 — Core Backend Structure (2026-05-26)

- [x] `ApiError` class (`utils/apiError.ts`) — typed error with `statusCode`, `code`, `message`, `details?`
- [x] `asyncHandler` utility (`utils/asyncHandler.ts`) — wraps async controllers, forwards errors to `next()`
- [x] Global error handler enriched — handles `ApiError`, `ZodError` (VALIDATION_FAILED), body-parser `SyntaxError` (malformed JSON), fallback INTERNAL_ERROR
- [x] Body parser hardened — 1mb limit on `express.json()` and `urlencoded()`
- [x] 404 handler (`middleware/notFound.middleware.ts`) — unknown routes return `NOT_FOUND` envelope
- [x] Middleware placeholders — `validate.middleware.ts`, `auth.middleware.ts`, `role.middleware.ts` (pass-through no-ops with TODO)
- [x] Dummy controllers (9 domains) — auth, me, skills, tags, projects, experience, resume, media, admin — all return `501 NOT_IMPLEMENTED` envelope via `asyncHandler`
- [x] Domain routes scaffolded (9 files) — auth, me, skills, tags, projects, experience, resume, media, admin
- [x] `routes/index.ts` aggregator wired — all domain routers mounted under `/api/v1`
- [x] `zod` installed as server dependency
- [x] Verified: `/health` 200, stub routes 501, malformed JSON 400, unknown route 404

### Phase 0 — Project Setup (2026-05-26)

- [x] Monorepo root: `.gitignore`, root `package.json` with `concurrently` dev scripts
- [x] Backend skeleton: `env.ts` (Phase 0 vars), `prisma.ts` singleton, `responseEnvelope.ts`, `error.middleware.ts`, `routes/index.ts` aggregator, `app.ts` (body parser + CORS + `/health` + `/api/v1` + error), `server.ts`
- [x] `/health` route returning standard envelope
- [x] Frontend skeleton: Vite + React 18 + TS (strict), Tailwind config with `design.md` tokens, `App.tsx` health handshake
- [x] Database: schema + seed moved to `server/prisma`, initial migration `init` applied to Neon Postgres, `featured` system tag seeded
- [x] Integration verified: backend `/health` 200, frontend 200, CORS headers present, DB connected (11 tables)
