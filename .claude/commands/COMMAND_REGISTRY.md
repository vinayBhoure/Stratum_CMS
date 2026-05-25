# Stratum CMS — Command Registry

> **Location:** All command files go in `/.claude/commands/`
> **Format:** Each `.md` file's filename becomes the `/command-name`
> **Invocation:** Developer types `/command-name` (optionally with arguments)
> **Parameters:** `$ARGUMENTS` captures everything typed after the command name

---

## Command Inventory (17 total)

### Database & Prisma (4)

| Command | What It Does | Arguments |
|---|---|---|
| `/migrate` | Run `prisma migrate dev` + regenerate client | Migration name (optional) |
| `/seed` | Run `prisma db seed` (seeds `featured` system tag) | None |
| `/db-reset` | Drop DB, remigrate, reseed — destructive, requires confirmation | None |
| `/studio` | Open Prisma Studio visual DB browser | None |

### Dev Servers (2)

| Command | What It Does | Arguments |
|---|---|---|
| `/dev` | Start both client (5173) and server (4000) dev servers | None |
| `/health-check` | Verify backend, frontend, DB connection, CORS — prints summary | None |

### Code Quality (3)

| Command | What It Does | Arguments |
|---|---|---|
| `/lint` | Run ESLint + Prettier check (no fix) on both sides | None |
| `/lint-fix` | Run ESLint + Prettier with auto-fix on both sides | None |
| `/typecheck` | Run `tsc --noEmit` on both sides — catch type errors without building | None |

### Documentation Tracking (4)

| Command | What It Does | Arguments |
|---|---|---|
| `/log-change` | Append to CHANGELOG.md, then git add + commit + push | Change description (optional) |
| `/log-error` | Append structured error entry to ERRORS.md | Error description (optional) |
| `/log-decision` | Append decision entry to DECISIONS.md | Decision topic (optional) |
| `/status` | Read TASKS.md, show phase progress summary | None |

### Validation & Sync (1)

| Command | What It Does | Arguments |
|---|---|---|
| `/sync-validators` | Compare FE vs BE Zod schemas, flag mismatches | None |

### Git Workflow (2)

| Command | What It Does | Arguments |
|---|---|---|
| `/new-branch` | Create branch with `phase-{N}/{feature}` naming, push upstream | `phase-number feature-name` (optional) |
| `/commit` | Stage all, format commit as `[Phase N] type: desc`, commit (no push) | Description (optional) |

### Scaffolding (1)

| Command | What It Does | Arguments |
|---|---|---|
| `/new-module` | Create stub files for a new domain module (controller, service, route, validator, RTK slice) | Module name (optional) |

---

## Key Workflow Combinations

**Starting a new work session:**
```
/new-branch → /dev → /status
```

**After writing code:**
```
/lint → /typecheck → /sync-validators
```

**Ready to commit and push:**
```
/log-change
```
(This does CHANGELOG + git add + commit + push in one go)

**Quick commit without push:**
```
/commit
```

**When something breaks:**
```
(fix the issue) → /log-error
```

**End of a phase:**
```
/status → (invoke phase-gate sub-agent) → /log-change
```

**Database trouble:**
```
/db-reset → /seed → /health-check
```

---

## `/log-change` vs `/commit` — When to Use Which

| Scenario | Use |
|---|---|
| Done with a feature chunk, want to record + push | `/log-change` |
| Quick save mid-work, not ready to push | `/commit` |
| Multiple small commits, one final push with changelog | `/commit` × N, then `/log-change` for the push |

`/log-change` is the full workflow: changelog entry + pull latest + stage + commit + push.
`/commit` is just: stage + commit. No push, no changelog.

---

## Installation

Copy all `.md` files from this folder into your project's `/.claude/commands/` directory:

```bash
mkdir -p .claude/commands
cp commands/*.md .claude/commands/
```

They'll be available as `/command-name` in the next Claude Code session.

---

*End of Command Registry*
