# Stratum CMS — Changelog

## Format
Entries follow the [Keep a Changelog](https://keepachangelog.com/) format.
Categories: Added, Fixed, Changed, Technical.

---

## [2026-05-18] - Phase 1 Complete

### Added
- **API Infrastructure**: Prisma client singleton (`lib/prisma.js`), `asyncHandler` wrapper, Zod validation middleware, Clerk sync-on-request auth middleware (`middlewares/require-auth.js`), `/api/v1` base router
- **User + Clerk integration**: `GET /api/v1/me` — user row auto-created on first authenticated request from Clerk session claims
- **Skills CRUD**: `POST/GET/PUT/DELETE /api/v1/skills` — scoped to authenticated user, name validated (max 100 chars)
- **Projects CRUD**: `POST/GET/PUT/DELETE /api/v1/projects` — inline `tags[]` (find-or-create `Tag`/`ProjectTag`) and `skillIds[]` (`ProjectSkill`) replaced atomically on update
- **Experience CRUD**: `POST/GET/PUT/DELETE /api/v1/experience` — optional `skillIds[]` linking, `endDate` must be after `startDate`
- **Contact + Social Accounts**: `POST/GET/DELETE /api/v1/contact` (single record per user, upsert); `POST/GET/PUT/DELETE /api/v1/social-accounts`
- **Resume upload**: `POST /api/v1/upload` (generic Cloudinary upload); `POST/GET/DELETE /api/v1/resume` — single resume per user, replaces on re-upload
- **Public API**: Unauthenticated `GET /api/v1/:username/{projects,experience,skills,contact,resume}` — 404 for unknown username, `[]` for empty resources
- `multer` dependency for multipart file upload handling

### Fixed
- Switched Prisma schema generator from `prisma-client` (Prisma 6 TypeScript-native, outputs `.ts` only) to `prisma-client-js` (outputs `index.js`, required by CommonJS `require()`)

### Technical
- Upload middleware: memory storage, MIME allowlist (JPG/PNG/WebP/PDF), 5 MB size cap
- Public `:username` router mounted last in `routes/index.js` to prevent shadowing fixed-path routes
- `updateMany`/`deleteMany` pattern used for ownership-scoped mutations (avoids separate auth check)
- Zod validation applied to all mutating endpoints; `validate(schema)` middleware pattern

---

## [2026-05-14] - Phase 0 Complete

### Added
- Prisma schema with 10 models: `User`, `Project`, `Skill`, `Experience`, `Contact`, `SocialAccount`, `Resume`, `Tag`, `ProjectTag`, `ProjectSkill`, `ExperienceSkill`
- Initial database migration applied (`20260514152445_init`) via Neon DB (serverless PostgreSQL)
- Prisma client generated to `server/generated/prisma/`
- Full project committed to git — `.claude/`, `docs/`, `client/`, `server/` all tracked
- Error registry and first error documented: ERR-001 (Prisma P1000 Docker pg_hba.conf auth mismatch)

### Fixed
- `.gitignore` was incorrectly excluding `.claude/` and `Docs/` — replaced with correct ignore rules

### Technical
- Switched database from local Docker PostgreSQL to Neon DB cloud PostgreSQL
- `DATABASE_URL` uses direct (non-pooled) Neon endpoint with `sslmode=require`
- Both dev servers verified: backend on port 5000, frontend on port 5173

---

## [2026-04-29] - Phase 0

### Added
- Project documentation: product spec, features, assumptions, risk assessment
- Technical architecture documentation with tech stack, folder structure, and API design
- Class diagram and ERD diagram for all database entities
- Agent configuration (`CLAUDE.md`) with project overview and constraints
- Coding standards with ESLint, JSDoc, and React component rules
- Database rules with Prisma conventions, migration workflow, and query best practices
- Git rules with branch strategy, commit conventions, and PR templates
- Development progress tracker with Phase 0–4 roadmap

### Changed
- Standardized API base URL to `/api/v1/` across all documentation
- Standardized route parameters to `:username` format
- Replaced deprecated `prisma.$use()` with Prisma Client Extensions in database rules
- Converted `prisma.config.ts` to `prisma.config.js` (JavaScript only)
- Converted `seed.ts` reference to `seed.js`

### Technical
- Configured `@/` path alias for frontend (`vite.config.js` + `jsconfig.json`)
- Configured `@/` path alias for backend (`package.json` subpath imports)
- Backend initialized with Express + Node.js
- Environment variables configured (`.env` files)
