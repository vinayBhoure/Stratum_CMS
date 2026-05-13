# Phase 0 — Implementation Plan

**Phase:** Foundation & Setup
**Status:** In Progress
**Created:** 2026-05-14
**Goal:** Complete local dev environment so both servers boot, Prisma is connected, and all verification criteria pass.

---

## Current State Summary

The tracker is behind actual progress. Here is the real build state as of 2026-05-14:

### What Is Done

**Backend (`server/`)**
- Express app with cors, morgan, dotenv configured
- `GET /health` route implemented and mounted
- Global error-handling middleware wired
- `utils/response.js` — `sendSuccess` / `sendError` helpers
- `config/clerk.js` — Clerk SDK exported
- `config/cloudinary.js` — Cloudinary configured from env vars
- `prisma/schema.prisma` — all 10 models defined, schema validates cleanly
- `package.json` scripts: `dev`, `start`, `lint`, `db:migrate`, `db:studio`, `db:generate`
- ESLint configured for CommonJS + Node globals
- `.env` — all keys present: `DATABASE_URL`, Clerk, Cloudinary, `PORT`, `NODE_ENV`

**Frontend (`client/`)**
- Vite + React 19 + Tailwind CSS v4 + `@/` alias
- shadcn/ui configured (`components.json`, style: radix-nova)
- `src/lib/utils.js` — `cn()` helper
- `src/components/ui/button.jsx` — Button with all variants
- All shadcn/ui runtime deps installed (clsx, tailwind-merge, class-variance-authority, radix-ui)
- ESLint configured
- `src/App.jsx` — still default Vite scaffold (expected at this phase)

### What Is Missing

| Item | Blocker |
|------|---------|
| `.gitignore` excludes `.claude/` and `docs/` | Nothing meaningful is committed to git |
| `generated/prisma/` missing | Prisma client not generated |
| `prisma/migrations/` missing | Initial migration not run |
| PostgreSQL not confirmed running locally | Blocks migration + Prisma connection |
| Both dev servers unverified | Needs confirmation after above is done |

---

## Tasks

### Task 1 — Fix `.gitignore` and make the first real commit

**Why first:** All subsequent work should be committed. The current `.gitignore` blocks tracking of source code, docs, and agent config.

**Problems in current `.gitignore`:**
- `.claude/` — excludes agent rules, commands, progress tracker, changelog
- `Docs/` — on Windows (case-insensitive filesystem) this excludes `docs/`, hiding all architecture docs and specs

**Replace `.gitignore` with:**
```
node_modules/
.env
.env.*
.env.local
dist/
build/
generated/
*.log
.DS_Store
Thumbs.db
```

**Then commit all current work:**
```bash
git add .
git commit -m "feat: Phase 0 scaffolding — backend, frontend, schema, config"
```

---

### Task 2 — Generate Prisma client

**Why:** `server/generated/prisma/` does not exist. Without it, any code that imports `@prisma/client` will fail at runtime. The schema is valid — this is a one-command step.

**No database connection needed for this step.**

```bash
cd server
npx prisma generate
```

Expected output: `Generated Prisma Client ... to ./generated/prisma`

**Verify:** `server/generated/prisma/` folder now exists.

---

### Task 3 — Set up local PostgreSQL and run initial migration

**Current `DATABASE_URL`:** `postgresql://vinay:password123@localhost:5432/mydb`

**Step 3a — Create the database role and database**

Option A — create a role matching the existing URL:
```sql
-- run as postgres superuser in psql
CREATE USER vinay WITH PASSWORD 'password123';
CREATE DATABASE mydb OWNER vinay;
```

Option B — update `DATABASE_URL` to an existing local user (e.g. `postgres`):
```
DATABASE_URL="postgresql://postgres:<your-password>@localhost:5432/stratum_cms"
```

**Step 3b — Run the initial migration**
```bash
cd server
npm run db:migrate
# migration name when prompted: init
```

Expected: `server/prisma/migrations/<timestamp>_init/migration.sql` created and applied.

**Step 3c — Verify Prisma Studio opens**
```bash
npm run db:studio
```

Expected: Browser opens at `http://localhost:5555` showing all 10 tables.

---

### Task 4 — Verify both dev servers start clean

**Backend:**
```bash
cd server
npm run dev
```
Expected log: `Server is running on port 5000`

Then confirm health check:
```
GET http://localhost:5000/health
```
Expected response:
```json
{
  "success": true,
  "data": { "status": "ok", "timestamp": "2026-05-14T..." },
  "error": null
}
```

**Frontend:**
```bash
cd client
npm run dev
```
Expected: Vite server starts on `http://localhost:5173` with no errors in terminal.

---

## Completion Checklist

Once all 4 tasks are done, mark these items complete in `/.claude/docs/progress.md`:

```
- [x] Prisma schema defined
- [x] PostgreSQL database running locally
- [x] Prisma connected to database
- [x] Initial migration applied
- [x] Backend dev server runs without errors
- [x] Frontend dev server runs without errors
```

And all 4 Verification Criteria:
```
- [x] cd client && npm run dev → starts without errors
- [x] cd server && npm run dev → starts without errors
- [x] GET http://localhost:5000/health → returns { "status": "ok" }
- [x] npx prisma studio → opens and shows tables
```

**Phase 0 status → Complete. Phase 1 can begin.**

---

## Phase 1 Head Start

Two Phase 1 tasks are already done before Phase 1 begins:
- `[x] Error handling middleware` — `server/middlewares/error-handler.js`
- `[x] Standardized API response format` — `server/utils/response.js`

8 of 10 Phase 1 tasks remain on first day of Phase 1.
