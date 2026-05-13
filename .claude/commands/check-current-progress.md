# Workflow: Check Current Progress

## Purpose
Verify completion status of the active development phase against defined checklist.

## Automated Steps

### 1. Identify Active Phase
Read `/.claude/docs/progress.md` to find:
```yaml
current_phase: "Phase 0"
started_at: "2024-01-15"
```

### 2. Load Phase Checklist
Read `/docs/project-phases/phase-0-foundation.md` (or active phase)

### 3. Check Completion Criteria
For Phase 0:
- [ ] Frontend runs locally without errors
- [ ] Backend runs locally without errors
- [ ] Database connection verified
- [ ] Prisma schema defined
- [ ] Environment variables configured
- [ ] Health check endpoint returns 200

Run automated checks:
```bash
# Frontend check
cd client && npm run build

# Backend check
cd server && npm run build

# Database check
cd server && npx prisma db pull

# Health check
curl http://localhost:3000/health
```

### 4. Generate Status Report
Output to `/.claude/docs/progress.md`:

```markdown
## Phase 0 — Foundation
**Status**: In Progress (67% complete)
**Started**: 2024-01-15
**Last Updated**: 2024-01-20

### Completed ✓
- [x] Frontend runs locally without errors
- [x] Backend runs locally without errors
- [x] Database connection verified
- [x] Prisma schema defined

### In Progress 🔄
- [ ] Environment variables configured (50%)

### Blocked ⚠️
- [ ] Health check endpoint (Blocked: Express not configured)
```

### 5. Alert on Blockers
If any item is marked "Blocked", notify developer with:
- Blocker description
- Suggested resolution steps
- Related documentation links

## Manual Triggers
Developer can run: `npm run check-progress`