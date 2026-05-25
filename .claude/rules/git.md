# Git Rules — Stratum CMS

## Branch Naming
- Format: `phase-{N}/{feature-name}` (e.g., `phase-2/auth-signup`, `phase-3/crud-projects`).
- Feature name is lowercase with hyphens only. No underscores, no camelCase, no spaces.
- Never work directly on `main`. Always branch from latest main.

## Commit Messages
- Format: `[Phase N] type: description` (e.g., `[Phase 2] feat: add login endpoint with JWT cookie`).
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
- Description uses imperative mood: "add health endpoint" not "added health endpoint".
- Keep description under 72 characters.

## Push & Pull
- Always pull before pushing to catch conflicts early.
- Never force push (`--force` or `-f`) to any branch.
- Never push directly to `main`. All changes go through feature branches.

## What Gets Committed
- Never commit `.env` files — only `.env.example` with placeholder values.
- Never commit `node_modules/`, `dist/`, `.prisma/` generated files, or IDE-specific folders.
- Always commit `CHANGELOG.md` updates with the code change they describe — not in a separate commit.
- Prisma migration files (under `server/prisma/migrations/`) must be committed — they are version-controlled artifacts.
