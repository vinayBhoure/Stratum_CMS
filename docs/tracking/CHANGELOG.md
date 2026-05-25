# Stratum CMS — Changelog

## Table of Contents

- [Phase 0 — Project Setup](#phase-0--project-setup)
- [Phase 1 — Foundation](#phase-1--foundation)
- [Phase 2 — Dashboard Frontend](#phase-2--dashboard-frontend)
- [Phase 3 — CRUD Modules](#phase-3--crud-modules)
- [Phase 4 — Public API](#phase-4--public-api)
- [Phase 5 — Admin Panel](#phase-5--admin-panel)

---

## Phase 0 — Project Setup

- `[Phase 0] chore: scaffold monorepo root with concurrently dev scripts and gitignore`
- `[Phase 0] feat: add Express + TypeScript backend skeleton (env config, Prisma singleton, CORS, /health route, response envelope, global error handler)`
- `[Phase 0] feat: add Vite + React + Tailwind frontend skeleton with design-system tokens and /health handshake page`
- `[Phase 0] feat: move Prisma schema + seed into server/prisma; apply initial migration; seed featured system tag`
- `[Phase 0] chore: verify FE↔BE↔DB integration locally (health 200, CORS, DB connected)`

---

## Phase 1 — Foundation

- `[Phase 1] feat: add ApiError class with statusCode, code, message, details`
- `[Phase 1] feat: add asyncHandler utility to wrap async controllers`
- `[Phase 1] feat: enrich global error handler — ApiError, ZodError (VALIDATION_FAILED), malformed JSON, fallback INTERNAL_ERROR`
- `[Phase 1] chore: install zod as server dependency`
- `[Phase 1] feat: harden body parser with 1mb size limit`
- `[Phase 1] feat: add 404 notFound handler returning NOT_FOUND envelope`
- `[Phase 1] feat: add validate, auth, role middleware placeholders`
- `[Phase 1] feat: scaffold dummy controllers for auth, me, skills, tags, projects, experience, resume, media, admin (501 NOT_IMPLEMENTED)`
- `[Phase 1] feat: scaffold domain routes for all 9 modules and wire into /api/v1 aggregator`

---

## Phase 2 — Dashboard Frontend

---

## Phase 3 — CRUD Modules

---

## Phase 4 — Public API

---

## Phase 5 — Admin Panel
