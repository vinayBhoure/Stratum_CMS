# Stratum CMS — Tasks

## Table of Contents

- [In Progress](#in-progress)
- [Backlog](#backlog)
- [Completed](#completed)

---

## In Progress

---

## Backlog

### Phase 4 — Public API (pending manual validation)

- [ ] Manual HTTP validation: all 6 endpoints × test matrix
- [ ] Full typecheck server + client clean
- [ ] Merge to `development`

---

## Completed

### Phase 3 — CRUD + Media (2026-05-27)

- [x] `utils/pagination.ts` — `parsePagination`, `buildPagination`, `paginatedData` helpers; used by all list endpoints
- [x] **me** (`§4`): `validators/me.schema.ts`, `services/me.service.ts`, controller + routes; GET + PUT; `Prisma.DbNull` for nullable JSON fields; verified end-to-end
- [x] **skills** (`§5`): `validators/skills.schema.ts`, `services/skills.service.ts`, controller + routes; list/create/update/delete; block-delete returns `SKILL_IN_USE` with `referencedBy.{experiences,projects}`; P2002 unique → `VALIDATION_FAILED`
- [x] **tags** (`§6`): `validators/tags.schema.ts`, `services/tags.service.ts`, controller + routes; list returns user + system tags; system tag rename/delete → `SYSTEM_TAG_PROTECTED`; block-delete → `TAG_IN_USE`
- [x] **projects** (`§7`): `validators/projects.schema.ts`, `services/projects.service.ts`, controller + routes; junction diffing atomic via `$transaction`; `assertReferences` validates skillIds (owner) + tagIds (owner or system); reads moved outside transaction (D-P3-04)
- [x] **experience** (`§8`): `validators/experience.schema.ts`, `services/experience.service.ts`, controller + routes; `assertDuration` (D-P3-01); cert merge by url (D-P3-02) preserving `updatedAt`; skill junction diffing
- [x] **media** (`§11`): `config/cloudinary.ts`, `middleware/upload.middleware.ts`, `services/media.service.ts`, controller + routes; multer memory storage; MIME+size guards per type; `Cloudinary.upload_stream`; `UploadApiErrorResponse` mapped to `ApiError`
- [x] **resume** (`§9`): `services/resume.service.ts`, controller + routes; PDF-only multer; `upsert` pattern; old asset deletion via parsed `public_id` (D-P3-03); `data: null` when none exists
- [x] Cloudinary creds wired into `env.ts` + `.env.example`; lodash corrupt install fixed
- [x] Full typecheck (server + client) clean; CHANGELOG + DECISIONS + TASKS updated; merged to `development`

### Phase 2 — Authentication (2026-05-26)

- [x] Auth deps installed: `bcryptjs`, `jsonwebtoken`, `cookie-parser`; `JWT_SECRET` required in `env.ts`; `cookie-parser` wired into app
- [x] Utilities: `nanoId.ts` (id 12), `jwt.ts` (sign/verify minimal `{userId, role}`, 7d), `password.ts` (bcryptjs, 12 rounds), `cookie.ts` (per-env `stratum_token` options)
- [x] Validators: `auth.schema.ts` (signup/login/deleteAccount, `.strict()`); `validate.middleware.ts` parses `req.body` → `VALIDATION_FAILED`
- [x] Service: `auth.service.ts` — signup (EMAIL_EXISTS guard + transactional Auth/UserInformation), login (no email enumeration), logout/deleteAccount (blacklist), getSession
- [x] Middleware: `authMiddleware` (UNAUTHENTICATED / INVALID_TOKEN / TOKEN_REVOKED, attaches `req.user`), `roleMiddleware` (FORBIDDEN), `types/express.d.ts` Request augmentation
- [x] Controllers + routes wired: signup 201, login/logout/session/delete 200; validate → auth chain; signup/login public
- [x] `jobs/blacklistCleanup.ts` — 7-day purge (scheduling deferred to Phase 6)
- [x] Verified end-to-end (manual HTTP): signup 201 + cookie, duplicate 409, weak-pw 400, session 200/401, logout 200 + TOKEN_REVOKED on reuse, login wrong/nonexistent 401, delete wrong-pw 401, delete 200 + cascade confirmed (re-signup 201)

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
