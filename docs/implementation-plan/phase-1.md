# Phase 1 — Implementation Plan

**Phase:** Core Backend API
**Status:** Complete ✅
**Completed:** 2026-05-18
**Created:** 2026-05-18
**Goal:** Build all CRUD endpoints for portfolio content plus the public unauthenticated API, with Zod validation on every mutating endpoint.

---

## Current State Summary

### What Is Done (Phase 0 carry-over)

**Backend (`server/`)**
- Express 5 app with cors, morgan, dotenv; CommonJS (`require`/`module.exports`)
- `GET /health` route mounted
- Global error-handling middleware wired (`middlewares/error-handler.js`)
- `utils/response.js` — `sendSuccess` / `sendError` helpers
- `config/clerk.js` — Clerk SDK exported
- `config/cloudinary.js` — Cloudinary configured from env vars
- `prisma/schema.prisma` — all 10 models, migration `20260514152445_init` applied
- Prisma client generated at `server/generated/prisma/`

Two Phase 1 checklist items are therefore already complete:
- `[x] Standardized API response format`
- `[x] Error handling middleware`

### What Is Missing

| Item | Needed for |
|------|------------|
| Prisma client singleton (`lib/prisma.js`) | Every service |
| `asyncHandler` wrapper | Routing errors to global handler without try/catch boilerplate |
| Zod validation middleware | All mutating endpoints |
| Clerk auth middleware (sync-on-request) | All protected routes + User provisioning |
| `/api/v1` base router | Mounting all resources |
| Resource layers (Skills, Projects, Experience, Contact, Social, Resume) | Phase 1 functionality |
| Public API router | Unauthenticated portfolio reads |

---

## Architecture

```
routes → controllers (thin) → services (business logic) → Prisma
                 ↑ Zod validation middleware
                 ↑ requireAuth (Clerk session → upsert User → req.user)
```

- All responses via existing `sendSuccess` / `sendError`
- All errors flow to the existing global error handler via an `asyncHandler` wrapper
- **User provisioning:** sync-on-request — auth middleware upserts the User row from Clerk session claims on first authenticated call (no webhook in Phase 1)
- All work on the `development` branch; `main` only via PR at phase end

### Per-chunk execution loop

Each task is independently buildable and ends in one commit:

1. Implement
2. `npm run lint` (server) — clean
3. Manual smoke test — happy path + one failure case
4. `/update-progress` — tick the matching checklist item
5. `git commit` (conventional message) on `development`
6. `/add-changelog` for user-facing endpoint tasks

---

## Tasks

### Task 1 — API Infrastructure

**Why first:** every resource depends on the Prisma singleton, auth, validation, and the `/api/v1` mount point.

**Files:**
- `lib/prisma.js` — single PrismaClient instance imported from `generated/prisma`
- `utils/async-handler.js` — wraps async route handlers, forwards errors to global handler
- `middlewares/validate.js` — runs a Zod schema against `req.body`, 400 on failure
- `middlewares/require-auth.js` — reads Clerk session → `clerkId`; upserts User; attaches `req.user`
- `routes/index.js` — `/api/v1` base router; mount in `server.js`

**Test:** server boots; protected test route returns 401 without auth.
**Commit:** `feat: add API infrastructure (prisma client, auth, validation middleware)`

---

### Task 2 — User + Clerk integration

**Files:**
- `services/user-service.js` — `upsertFromClerk(claims)`, `getByUsername(username)`
- `controllers/user-controller.js`
- `routes/user-routes.js` — `GET /api/v1/me`

Sync-on-request logic lives in the Task 1 middleware; this exposes the user-facing endpoint and the reusable service.

**Test:** authenticated `GET /api/v1/me` returns the synced user; row auto-created on first call.
**Commit:** `feat: add user model and Clerk sync-on-request integration`
**Progress:** User model + Clerk integration ✅

---

### Task 3 — Skills CRUD

Built before Projects/Experience so those can link to skills.

**Files:** `schemas/skill-schema.js`, `services/skill-service.js`, `controllers/skill-controller.js`, `routes/skill-routes.js`
**Endpoints:** `POST/GET/PUT/DELETE /api/v1/skills` — all scoped to `req.user.id`
**Commit:** `feat: add skills CRUD endpoints`
**Progress:** Skills CRUD ✅ · `/add-changelog`

---

### Task 4 — Projects CRUD

**Files:** `schemas/project-schema.js`, `services/project-service.js`, `controllers/project-controller.js`, `routes/project-routes.js`
**Endpoints:** `POST/GET/PUT/DELETE /api/v1/projects`

🔸 **Tags/skills decision (overridable):** project payload accepts `tags: string[]` (backend find-or-creates `Tag` rows, links via `ProjectTag`) and `skillIds: string[]` (links via `ProjectSkill`). No separate Tag endpoints in Phase 1.

**Validation:** title ≤ 100, description ≤ 500, URL format on `githubUrl`/`liveUrl` (security-rules).
**Test:** create with tags + skills, verify relations; oversized title rejected.
**Commit:** `feat: add projects CRUD endpoints`
**Progress:** Projects CRUD ✅ · `/add-changelog`

---

### Task 5 — Experience CRUD

**Files:** schema / service / controller / routes
**Endpoints:** `POST/GET/PUT/DELETE /api/v1/experience`; optional `skillIds[]` linking via `ExperienceSkill`
**Validation:** `endDate` nullable and must be after `startDate`.
**Commit:** `feat: add experience CRUD endpoints`
**Progress:** Experience CRUD ✅ · `/add-changelog`

---

### Task 6 — Contact + Social Accounts

**Files:** contact + social-account schema / service / controller / routes
**Endpoints:**
- Contact is **one-per-user** → upsert: `POST` create-or-replace, `GET`, `DELETE` `/api/v1/contact`
- `POST/GET/PUT/DELETE /api/v1/social-accounts`

**Validation:** URL format on social `url` and `googleMapsUrl`; email format on contact email.
**Commit:** `feat: add contact and social account endpoints`
**Progress:** Contact CRUD ✅ · `/add-changelog`

---

### Task 7 — Resume upload (Cloudinary)

**Files:** add `multer` dep; `middlewares/upload.js` (memory storage, MIME allowlist JPG/PNG/WebP/PDF, 5MB cap); `services/resume-service.js`; `controllers/`, `routes/`
**Endpoints:** generic `POST /api/v1/upload`; `POST/GET/DELETE /api/v1/resume`
**Rule:** single resume per user — on re-upload, delete old Cloudinary asset + DB row first.
**Test:** upload PDF, re-upload replaces, oversized/wrong-type rejected.
**Commit:** `feat: add resume upload with Cloudinary integration`
**Progress:** Resume upload endpoint ✅ · `/add-changelog`

---

### Task 8 — Public API endpoints

**Files:** `routes/public-routes.js`
**Endpoints (unauthenticated):**
```
GET /api/v1/:username/projects
GET /api/v1/:username/experience
GET /api/v1/:username/skills
GET /api/v1/:username/contact
GET /api/v1/:username/resume
```
**Rules:** 404 if username unknown; `[]` if user exists but no data; no sensitive fields exposed. Mount the public router so `:username` does not shadow protected routes (Express 5 ordering).
**Test:** known username returns data; unknown → 404; empty → `[]`; works with no auth header.
**Commit:** `feat: add public unauthenticated API endpoints`
**Progress:** Public API endpoints ✅ · Input validation with Zod ✅ · `/add-changelog`

---

### Task 9 — Security review + docs sync

- `/security-review` on the branch — input validation, upload safety, no raw error leakage, auth boundaries (public GETs only)
- Confirm Zod coverage on every mutating endpoint
- `/sync-docs` — reconcile `progress.md`, `changelog.md`, technical-architecture doc
- `/check-current-progress` — verify Phase 1 → Complete
- **Commit:** `docs: sync Phase 1 progress, changelog, and architecture`
- Then offer (user's call): PR `development` → `main` via `/git-flow`

---

## Completion Checklist

Mark complete in `/.claude/docs/progress.md` as each task lands:

```
- [x] User model + Clerk integration          (Task 2)
- [x] Projects CRUD (POST, GET, PUT, DELETE)   (Task 4)
- [x] Experience CRUD                          (Task 5)
- [x] Skills CRUD                              (Task 3)
- [x] Contact CRUD (single record per user)    (Task 6)
- [x] Resume upload endpoint (Cloudinary)      (Task 7)
- [x] Public API endpoints                     (Task 8)
- [x] Input validation with Zod on all         (Tasks 3–8)
- [x] Standardized API response format         (done in Phase 0)
- [x] Error handling middleware                (done in Phase 0)
```

**Phase 1 status → Complete when all 9 tasks land. Phase 2 (Dashboard Frontend) can begin.**

---

## Notes / flags

- **Dependency adds:** `multer` (Task 7). Existing `@clerk/clerk-sdk-node@5` provides the session middleware for sync-on-request — verify its API in Task 1 before building on it.
- **Schema smell:** `User.password` is dead weight under Clerk-managed auth. Not touched in Phase 1; recommend a `drop_user_password` migration in Phase 3.
- **Skills/commands:** `backend` skill drives Tasks 1–8; `database` skill for Prisma/Zod patterns; `debugger` skill on failing smoke tests. Commands: `/update-progress`, `/add-changelog` (per task), `/sync-docs`, `/check-current-progress`, `/security-review`, `/git-flow` (Task 9).
- 9 tasks → 9 buildable commits, each independently revertible.
