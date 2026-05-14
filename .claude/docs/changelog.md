# Stratum CMS — Changelog

## Format
Entries follow the [Keep a Changelog](https://keepachangelog.com/) format.
Categories: Added, Fixed, Changed, Technical.

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
