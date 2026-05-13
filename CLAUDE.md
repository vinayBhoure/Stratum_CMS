# Stratum CMS — Agent Configuration

## Project Overview
**Stratum CMS** is a developer-focused headless CMS for managing portfolio content via a dashboard and exposing it through public REST APIs. Target users are junior developers (0–3 years) who want to update portfolio content without touching code.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui + Zustand + React Router
- **Backend**: Node.js + Express.js + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Clerk (Google OAuth + email)
- **Storage**: Cloudinary (images, PDFs)
- **Language**: JavaScript (not TypeScript)
- **Validation**: Zod (frontend + backend)

## Architecture
- **Pattern**: Monolith (single Express backend)
- **API Style**: REST with `/api/v1/` prefix
- **Response Format**: `{ success: boolean, data: any, error: any }`

## Project Structure
```
/client        → React frontend (Vite)
/server        → Express backend API
/docs          → Project documentation
/.claude       → Agent configuration and rules
```

## Key Documentation
- Product Spec: `/docs/project-description/product-spec-doc.md`
- Features: `/docs/project-description/features.md`
- Technical Architecture: `/docs/architecture/technical-architecture.md`
- Progress Tracker: `/.claude/docs/progress.md`
- Changelog: `/.claude/docs/changelog.md`

## Rules (must follow)
- `/.claude/rules/coding-standards.md` — JS conventions, JSDoc, React patterns
- `/.claude/rules/database-rules.md` — Prisma schema, queries, migrations
- `/.claude/rules/git-rules.md` — Branch strategy, commit format, PR rules
- `/.claude/rules/api-design-rules.md` — REST endpoints, response format, validation
- `/.claude/rules/security-rules.md` — Input validation, error handling, auth, uploads

## Workflows (execute when applicable)
- `/.claude/commands/add-changelog.md` — After commits
- `/.claude/commands/check-current-progress.md` — Verify phase status
- `/.claude/commands/task-breakdown.md` — Decompose deliverables
- `/.claude/commands/generate-migration.md` — After schema changes
- `/.claude/commands/git-rebase.md` — Before PR from feature branch
- `/.claude/commands/pre-commit-check.md` — Before every commit
- `/.claude/commands/sync-docs.md` — After major changes
- `/.claude/commands/update-progress.md` — After completing tasks

## Important Constraints
- **No TypeScript** — Use JavaScript with JSDoc for type hints
- **No Blogs in MVP** — Blogs feature is deferred to Phase 2+
- **Fixed schema** — Users cannot customize data models
- **Public API has no auth** — GET endpoints are unauthenticated
- **Single resume per user** — Replace on re-upload
