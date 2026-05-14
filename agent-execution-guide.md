# Stratum CMS — Agent Execution Guide

> **Purpose**: Defines how every component of this project (code, rules, workflows, skills, docs) should be used so an agent can build and modify the project autonomously using natural-language prompts.

---

## 1. System Overview

The agent configuration lives entirely in `.claude/`. It consists of four component types:

| Type | Location | Count | Role |
|------|----------|-------|------|
| **Rules** | `.claude/rules/` | 5 | Hard constraints — always enforced |
| **Workflows** | `.claude/commands/` | 8 | Procedural steps — triggered by events |
| **Skills** | `.claude/skills/` | 4 | Domain expertise — activated by work area |
| **Agent Docs** | `.claude/docs/` | 6 | Live state — read before acting, updated after |

The entry point for every session is **`CLAUDE.md`** — the agent reads it first to orient itself: tech stack, architecture, all rule/workflow/skill paths, and project constraints.

---

## 2. Rules — Constraints That Never Bend

Rules are **always active**. Every code change the agent makes must comply with all applicable rules simultaneously. Rules are not "applied" — they are enforced as invariants.

### Rule Map

#### `coding-standards.md` — JavaScript & React Conventions
**Purpose**: Enforces code quality, naming, structure, and documentation across all JS files.

**Applies to**: Every file written or modified in `/client/src/` or `/server/`.

**Key constraints**:
- **Language**: JavaScript only. No TypeScript. Use JSDoc `@param` / `@returns` for type hints.
- **Naming**:
  - Variables/functions → `camelCase`
  - Classes/components → `PascalCase`
  - Constants → `SCREAMING_SNAKE_CASE`
  - File names → `kebab-case.js` (backend), `PascalCase.jsx` (React components)
- **Error handling**: Every `async` function must have a `try/catch`. Never expose raw errors to the client.
- **React**: Functional components only. Hooks must follow the prescribed order: state → context → refs → effects → custom hooks → handlers → return.
- **Imports**: External libs first, then internal modules, then assets.
- **Linting**: `npm run lint` must pass before any commit.

**When violated**: The agent must fix the violation before proceeding, even if the user's prompt did not address it.

---

#### `api-design-rules.md` — REST API Shape
**Purpose**: Defines the contract that all endpoints must conform to.

**Applies to**: All files in `/server/routes/`, `/server/controllers/`, and any frontend code consuming the API.

**Key constraints**:
- **Base prefix**: All routes start with `/api/v1/`.
- **Public endpoints** (no auth): `GET /api/v1/:username/{resource}` — returns `[]` if no data, `404` if user not found.
- **Authenticated endpoints**: `POST`, `PUT`, `DELETE` on `/api/v1/{resource}` and `/api/v1/{resource}/:id`.
- **Response format** (mandatory, always):
  ```json
  { "success": true, "data": { ... }, "error": null }
  { "success": false, "data": null, "error": { "code": "...", "message": "..." } }
  ```
- **Controller pattern**: Controllers are thin. Validate → call service → return response. Business logic belongs in `/server/services/`.
- **Validation**: Zod schema parses `req.body` before any database call.
- **Status codes**: `400` for validation, `404` for not found, `500` for server errors.

---

#### `database-rules.md` — Prisma + PostgreSQL
**Purpose**: Governs all schema design, migration, and query patterns.

**Applies to**: `/server/prisma/schema.prisma`, all migration files, and all service files that use Prisma.

**Key constraints**:
- **Naming duality**: Prisma model = PascalCase; DB table = snake_case via `@@map("table_name")`. Prisma field = camelCase; DB column = snake_case via `@map("column_name")`. Both annotations are **mandatory on every model and field that differs**.
- **Primary keys**: Always `id String @id @default(uuid())`.
- **Timestamps**: Every model must have `createdAt` and `updatedAt` with `@map()`.
- **Cascading deletes**: Always define `onDelete:` explicitly on relations.
- **Queries**: Always `select` only needed fields. Use `prisma.$transaction()` for multi-step operations. Use `skip/take` for pagination.
- **Migrations**: Named as `action_entity_detail` (e.g., `add_projects_table`). Never modify an existing committed migration — always create a new one.
- **Row-level security** (Phase 4+): Use Prisma Client Extensions, not deprecated `$use()` middleware.

---

#### `git-rules.md` — Branch Strategy & Commit Format
**Purpose**: Defines the git workflow the agent must follow when suggesting or performing version control actions.

**Applies to**: All `git` commands the agent proposes or executes.

**Key constraints**:
- **Never commit to `main`** — use `development` as the working branch.
- **Branch naming**: `feature/<name>`, `fix/<name>`, `refactor/<name>`, `docs/<name>`.
- **Commit format**: `<type>: <short description>` (max 72 chars, imperative mood, no period). Valid types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`.
- **Merge strategy**: Squash merge feature→development; regular merge development→main.
- **Never stage**: `node_modules/`, `.env`, `dist/`, `*.log`, `.DS_Store`.

---

#### `security-rules.md` — Defensive Coding
**Purpose**: Prevents security vulnerabilities in all layers.

**Applies to**: All input-handling code (controllers, middlewares, forms), file upload handlers, and auth-gated routes.

**Key constraints**:
- Validate all input with Zod before processing — enforce length limits on all text fields.
- File uploads: JPG, PNG, WebP, PDF only; 5MB max; store only Cloudinary URL in DB.
- Never expose `error.message` from DB or system to the client — log internally, return generic message.
- Public API routes must never include sensitive user data.
- Env secrets stay in `.env` files, never committed.
- Auth: Clerk handles sessions. All `POST`/`PUT`/`DELETE` routes require a valid Clerk session.

---

## 3. Workflows — Event-Driven Procedural Steps

Workflows are **triggered by specific events** or prompt types. They define an ordered sequence of steps the agent must execute. The agent identifies the appropriate workflow(s) based on what the prompt is asking for, then runs the steps in order.

### Workflow Selection Logic

```
Prompt contains: "schema" / "model" / "field" / "table"
  → generate-migration.md (after schema edits)

Prompt contains: "commit" / "push" / "done" / "finished task"
  → pre-commit-check.md → add-changelog.md → update-progress.md

Prompt contains: "PR" / "pull request" / "merge"
  → git-rebase.md → pre-commit-check.md

Prompt contains: "what's done" / "what phase" / "status" / "how far"
  → check-current-progress.md

Prompt contains: "plan" / "break down" / "phase" / "feature"
  → task-breakdown.md

Prompt contains: "large change" / "phase complete" / "refactored" / "API changed"
  → sync-docs.md → update-progress.md
```

Multiple workflows can chain. The canonical post-commit chain is:
```
pre-commit-check → add-changelog → update-progress
```

---

### Workflow Reference

#### `pre-commit-check.md`
**Trigger**: Before every `git commit`.
**Steps**:
1. Run `cd client && npm run lint` and `cd server && npm run lint` — must pass.
2. Run `npx prettier --check .` — must pass.
3. Validate commit message format (`<type>: <description>`).
4. Verify no forbidden files are staged (`node_modules`, `.env`, `dist`, `*.log`).
5. Grep staged files for `console.log` — flag if found.
**Block commit if**: Any step fails.

---

#### `add-changelog.md`
**Trigger**: After committing to `development` or `main`.
**Steps**:
1. `git log --since="1 day ago"` — extract recent commits.
2. Categorize by prefix: `feat:` → Added, `fix:` → Fixed, `refactor:` → Changed, `chore:` → Technical.
3. Append formatted entry to `/.claude/docs/changelog.md` under `## [YYYY-MM-DD] - Phase X`.
4. Verify: date format, phase number matches `progress.md`, no duplicates.
**Output**: Updated `.claude/docs/changelog.md`.

---

#### `update-progress.md`
**Trigger**: After completing a task or merging a PR.
**Steps**:
1. Read `.claude/docs/progress.md` — identify current phase and open checklist items.
2. Cross-reference recent git commits to identify what was completed.
3. Mark completed items `[x]` and update `last_updated`.
4. Calculate phase % complete (completed/total items).
5. If all items complete → flag for phase transition (do NOT auto-transition).
**Output**: Updated `.claude/docs/progress.md`.

---

#### `check-current-progress.md`
**Trigger**: When asked about status, phase, or what's done.
**Steps**:
1. Read `.claude/docs/progress.md` → find `current_phase`.
2. Load the corresponding phase document from `/docs/project-phases/`.
3. Run automated checks: `npm run build` (client + server), `npx prisma db pull`, `curl /health`.
4. Generate status report: Completed ✓ / In Progress 🔄 / Blocked ⚠️.
5. For blocked items: provide blocker description + suggested resolution.
**Output**: Status report in `.claude/docs/progress.md`.

---

#### `generate-migration.md`
**Trigger**: After modifying `server/prisma/schema.prisma`.
**Steps**:
1. `cd server && npx prisma validate` — abort if invalid.
2. `npx prisma migrate dev --name <action_entity_detail>` — name must follow convention.
3. Review generated SQL: verify `snake_case` tables/columns, cascade rules, indexes.
4. `npx prisma generate` — regenerate client.
5. Update `.claude/docs/progress.md` with migration status.
**Rules**: Never modify an existing committed migration file.

---

#### `git-rebase.md`
**Trigger**: Before creating a PR from a feature branch.
**Steps**:
1. `git status` — must be clean (all changes committed or stashed).
2. `git fetch origin`.
3. `git rebase origin/development` on the feature branch.
4. Resolve conflicts if any → `git add <file>` → `git rebase --continue`.
5. `git push origin feature/<name> --force-with-lease`.
6. `git log --oneline -10` — verify feature commits sit cleanly on top.
**Constraint**: Never rebase `main` or `development`.

---

#### `task-breakdown.md`
**Trigger**: When given a phase deliverable or high-level feature to implement.
**Steps**:
1. Parse the deliverable into four component areas: Data Models, API Endpoints, Frontend Components, Integration Points.
2. Generate a nested task tree with checkboxes in three layers: feature → sub-task → implementation step.
3. Assign effort: Small (<2h), Medium (2–4h), Large (4–8h).
4. Identify blocking dependencies between tasks.
**Output**: Append task tree to `.claude/docs/progress.md` under the active phase.

---

#### `sync-docs.md`
**Trigger**: After completing a phase or after major API/schema changes.
**Steps**:
1. Cross-reference `server/routes/` against `reference.md` and `technical-architecture.md` — flag missing/extra endpoints.
2. Cross-reference `server/prisma/schema.prisma` against `data-models.md`, `schema.md`, `erd-diagram.md` — flag field discrepancies.
3. Cross-reference actual directory layout against `architecture.md` and `current_architecture.md`.
4. Cross-reference `client/package.json` + `server/package.json` against tech stack docs.
5. Apply corrections to all flagged documentation files.
6. Mark sync complete in `progress.md`.
**Output**: Updated documentation files + discrepancy report.

---

## 4. Skills — Domain-Scoped Expertise

Skills are activated based on **which layer of the project the prompt targets**. A skill scopes the agent's behavior to domain-specific patterns, constraints, and code structures.

### Skill Activation Logic

| Prompt involves… | Activate skill |
|-----------------|----------------|
| Routes, controllers, services, middlewares, auth, upload | `backend/SKILL.md` |
| Schema, migrations, Prisma queries, seed data, indexes | `database/SKILL.md` |
| React components, pages, Zustand stores, CSS, forms | `frontend/SKILL.md` |
| Error diagnosis, stack traces, unexpected behavior | `debugger/SKILL.md` |

Multiple skills can be active simultaneously (e.g., a prompt adding a new API endpoint activates both `backend` and `database`).

---

### Skill Reference

#### `backend/SKILL.md` — Express.js API Development
**Scope**: `/server/controllers/`, `/server/routes/`, `/server/middlewares/`, `/server/services/`, `/server/utils/`, `/server/config/`, `server.js`.

**Code organization enforced**:
```
controllers/    → Thin request handlers (validate → service → respond)
routes/         → Route definitions only, no logic
middlewares/    → Auth (Clerk), validation, error handling
services/       → All business logic and Prisma queries
utils/          → Response formatters, logger helpers
config/         → Env vars, constants
```

**Patterns**:
- Controller → `try { validate → service.method() → res.json({success, data, error}) } catch { log + generic 500 }`
- Import order: external → internal (use `@/` alias) → assets
- File structure: imports → constants → logic → exports

---

#### `database/SKILL.md` — Prisma + PostgreSQL
**Scope**: `server/prisma/schema.prisma`, `server/prisma/migrations/`, `server/prisma/seed.js`, all service files.

**Core entities** the agent must know: `User`, `Project`, `Skill`, `Experience`, `Contact`, `Resume`, `Tag`, `SocialAccount` plus join tables `ProjectTag`, `ProjectSkill`, `ExperienceSkill`.

**Patterns**:
- Every model → `createdAt + updatedAt + @@map()`
- Every FK field → `@map()` annotation
- Queries → always `select:` specific fields
- Multi-step operations → `prisma.$transaction()`
- Post-migration → always run `npx prisma generate`

---

#### `frontend/SKILL.md` — React UI Development
**Scope**: `/client/src/` — components, pages, stores, services, utils, styles.

**Design direction**: Production-grade, visually distinctive. The agent must commit to a bold aesthetic — specific typography choices, a dominant color palette with sharp accents, CSS animations for micro-interactions. Avoid generic "AI slop" aesthetics (no plain Inter/Roboto, no purple-gradient-on-white).

**Tech patterns**:
- State: Zustand stores in `/client/src/store/`
- API calls: Service layer in `/client/src/services/`
- Routing: React Router in `App.jsx`
- Validation: Zod on all forms
- Components: Functional only, JSDoc-documented props

**Component file structure**: imports → JSDoc → component function → export

---

#### `debugger/SKILL.md` — Error Diagnosis
**Scope**: Any layer — triggered when something is broken.

**Diagnostic framework**:
1. **Reproduce** → identify exact steps + expected vs actual
2. **Layer identification** → Frontend? Backend? DB? Auth? Storage?
3. **Inspect logs** → Express console, Prisma Studio, browser DevTools
4. **Match error pattern** → Prisma codes (P2002, P2025, P2003), HTTP codes (400/401/404/500), Clerk session errors
5. **Apply fix** → always inside `try/catch`, never expose raw errors
6. **Verify** → reproduce original issue is gone, run `npm run lint`, check adjacent behavior

**After resolution**: Document in `docs/errors/error-registry.md` using the template in `docs/errors/error-example-${0}.md`.

---

## 5. Agent Execution Model

### Step 1 — Session Initialization (every session)
1. Read `.claude/claude.md` → load tech stack, constraints, all component paths.
2. Read `.claude/docs/progress.md` → identify `current_phase` and active tasks.
3. Read `.claude/docs/reference.md` → load current API contracts.

### Step 2 — Prompt Classification

On receiving a prompt, the agent classifies it across three dimensions:

```
WORK AREA          → which skill(s) to activate
OPERATION TYPE     → what kind of change (add/modify/fix/document/query)
EVENT TRIGGERS     → which workflow(s) the operation will invoke
```

**Classification table**:

| Prompt type | Skill(s) | Workflows triggered |
|-------------|---------|-------------------|
| "Add a new API endpoint for X" | backend + database | generate-migration (if schema change), pre-commit-check, add-changelog, update-progress |
| "Create a React component for Y" | frontend | pre-commit-check, add-changelog, update-progress |
| "Modify the Prisma schema to add Z" | database | generate-migration, sync-docs, update-progress |
| "Fix bug where W fails" | debugger | pre-commit-check, add-changelog, update-progress |
| "Break down Phase 1 tasks" | — | task-breakdown |
| "What's the status / what's done" | — | check-current-progress |
| "Prepare to submit PR" | — | git-rebase, pre-commit-check |
| "Phase X is complete" | — | sync-docs, update-progress, add-changelog |

### Step 3 — Rules Validation (before writing code)

Before producing any code, the agent verifies that the planned implementation satisfies all applicable rules:

```
[ ] coding-standards.md: naming, JSDoc, try-catch, no-TypeScript
[ ] api-design-rules.md: /api/v1/ prefix, response format, controller thinness
[ ] database-rules.md: @@map, @map, timestamps, cascade, select-only-needed
[ ] security-rules.md: Zod validation, no raw errors, auth on mutations
[ ] git-rules.md: correct branch, conventional commit message
```

### Step 4 — Code Generation

The agent generates code following the active skill's architecture:

**Backend change**:
```
routes/<resource>.js        → add route definition
controllers/<resource>.js   → thin handler, delegates to service
services/<resource>-service.js → business logic + Prisma query
```

**Frontend change**:
```
src/components/ or src/pages/ → React component (functional, JSDoc)
src/store/                    → Zustand store if new state needed
src/services/                 → API call wrapper if new endpoint consumed
```

**Database change**:
```
server/prisma/schema.prisma   → model edit
→ trigger generate-migration workflow immediately
```

### Step 5 — Post-Change Workflow Execution

After generating and applying code changes, the agent executes workflows in order:

```
1. pre-commit-check      (always, before any commit)
2. generate-migration    (if schema changed)
3. add-changelog         (after commit)
4. update-progress       (after commit)
5. sync-docs             (if API or schema changed significantly)
```

### Step 6 — Consistency Verification

The agent confirms:
- All new routes are documented in `.claude/docs/reference.md`
- All new/modified models are reflected in `.claude/docs/data-models.md`
- `progress.md` task items for completed work are marked `[x]`
- Changelog entry added for the session's work

---

## 6. Codebase Modification Guidelines

### Adding a New Resource (e.g., "Add Skills API")

**Order of operations** (must follow exactly):
1. `database/SKILL.md` → define/verify `Skill` model in `schema.prisma` → trigger `generate-migration`
2. `backend/SKILL.md` → create `services/skill-service.js` (Prisma queries)
3. `backend/SKILL.md` → create `controllers/skill-controller.js` (thin handlers)
4. `backend/SKILL.md` → create `routes/skill-routes.js` (route wiring)
5. Register routes in `server.js`
6. `frontend/SKILL.md` → create service wrapper in `src/services/`
7. `frontend/SKILL.md` → create React component/page consuming the API
8. Run `pre-commit-check` → commit → `add-changelog` → `update-progress`

### Modifying an Existing Feature

1. Identify affected layer(s) → activate corresponding skill(s)
2. Check `reference.md` for current API contract — note if contract is changing
3. Make change → if contract changed, update `reference.md`
4. If schema changed → trigger `generate-migration`
5. Standard post-commit workflow chain

### Extending the Codebase (new module)

Follow the existing folder structure strictly:
- No new top-level folders without updating `architecture.md` and `current_architecture.md`
- New backend modules: `routes/`, `controllers/`, `services/` — never mix responsibilities
- New frontend modules: add to `components/` (reusable) or `pages/` (route-level), `features/` (domain-scoped)
- New Zustand store → `/client/src/store/<resource>Store.js`
- New API service → `/client/src/services/<resource>-service.js`

---

## 7. Documentation Usage

### Which doc to read, when

| Situation | Read |
|-----------|------|
| Starting any session | `.claude/claude.md`, `.claude/docs/progress.md` |
| Need current API contracts | `.claude/docs/reference.md` |
| Need entity definitions | `.claude/docs/data-models.md` |
| Need architecture context | `.claude/docs/architecture.md`, `.claude/docs/current_architecture.md` |
| Need schema details | `docs/architecture/schema.md` |
| Need full feature spec | `docs/project-description/features.md` |
| Need product context | `docs/project-description/product-spec-doc.md` |
| Diagnosing a known error | `docs/errors/error-registry.md` |

### Which doc to update, after

| Action | Update |
|--------|--------|
| API added/changed | `.claude/docs/reference.md` |
| Schema changed | `.claude/docs/data-models.md`, `docs/architecture/schema.md`, `docs/architecture/erd-diagram.md` |
| Architecture changed | `.claude/docs/architecture.md`, `.claude/docs/current_architecture.md`, `docs/architecture/technical-architecture.md` |
| Task completed | `.claude/docs/progress.md` |
| Commit made | `.claude/docs/changelog.md` |
| Error resolved | `docs/errors/error-registry.md` |

---

## 8. Hard Constraints (Non-Negotiable)

These constraints override any user prompt that conflicts with them:

| Constraint | Source |
|------------|--------|
| No TypeScript — JavaScript + JSDoc only | `claude.md` |
| No Blogs in MVP — defer to Phase 2+ | `claude.md` |
| Fixed schema — users cannot customize data models | `claude.md` |
| Public API has no auth — GET endpoints are unauthenticated | `claude.md` + `api-design-rules.md` |
| Single resume per user — replace on re-upload | `claude.md` + `data-models.md` |
| Never commit directly to `main` | `git-rules.md` |
| Never modify an existing committed migration | `database-rules.md` |
| Never expose raw errors to the client | `security-rules.md` + `coding-standards.md` |
| All mutations require Clerk session validation | `security-rules.md` |
| All API responses must follow `{ success, data, error }` format | `api-design-rules.md` |

---

## 9. Component Index

```
.claude/
├── claude.md                          ← ALWAYS read first — project config entry point
├── |
│   ├── rules/
│   │   ├── coding-standards.md        ← Always active — JS, JSDoc, React conventions
│   │   ├── api-design-rules.md        ← Always active — REST shape, response format
│   │   ├── database-rules.md          ← Always active — Prisma conventions, migrations
│   │   ├── git-rules.md               ← Always active — branch strategy, commits
│   │   └── security-rules.md          ← Always active — validation, auth, error handling
│   ├── commands/
│   │   ├── pre-commit-check.md        ← Before every commit
│   │   ├── add-changelog.md           ← After every commit
│   │   ├── update-progress.md         ← After completing tasks or PRs
│   │   ├── check-current-progress.md  ← On status queries
│   │   ├── generate-migration.md      ← After schema.prisma edits
│   │   ├── git-rebase.md              ← Before PR submission
│   │   ├── task-breakdown.md          ← On high-level deliverables
│   │   └── sync-docs.md               ← After phase completion or major changes
│   └── skills/
│       ├── backend/SKILL.md           ← Activated for API/server work
│       ├── database/SKILL.md          ← Activated for schema/query work
│       ├── frontend/SKILL.md          ← Activated for UI/React work
│       └── debugger/SKILL.md          ← Activated when diagnosing errors
└── docs/
    ├── architecture.md                ← System design — read for context, update after arch changes
    ├── current_architecture.md        ← As-implemented state — update after structural changes
    ├── data-models.md                 ← Entity definitions — update after schema changes
    ├── progress.md                    ← Phase tracker — update after every task completion
    ├── changelog.md                   ← Change history — update after every commit
    └── reference.md                   ← API contracts + dev commands — update after API changes
```
