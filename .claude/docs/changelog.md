# Stratum CMS — Changelog

## Format
Entries follow the [Keep a Changelog](https://keepachangelog.com/) format.
Categories: Added, Fixed, Changed, Technical.

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
