# Workflow: Sync Documentation

## Purpose
Ensure that project documentation stays consistent with the current codebase state after significant changes.

## Trigger Conditions
- After completing a development phase
- After major schema changes or API endpoint additions
- When manually invoked by developer

## Automated Steps

### 1. Identify Documentation Files
Check the following files for consistency:

**Agent docs (`.claude/docs/`):**
- `architecture.md` — System architecture overview
- `current_architecture.md` — As-implemented state
- `data-models.md` — Entity definitions
- `progress.md` — Phase completion tracker
- `reference.md` — API contracts and data models

**Project docs (`docs/`):**
- `architecture/technical-architecture.md` — Tech stack, folder structure, API design
- `architecture/schema.md` — Prisma schema documentation
- `architecture/class-diagram.md` — Class relationships
- `architecture/erd-diagram.md` — Entity-relationship diagram
- `project-description/features.md` — Feature specifications

### 2. Cross-Reference Against Codebase
For each documentation file, verify:
- **API endpoints** match routes defined in `server/routes/`
- **Data models** match `server/prisma/schema.prisma`
- **Folder structure** matches actual directory layout
- **Tech stack** matches dependencies in `client/package.json` and `server/package.json`

### 3. Flag Discrepancies
Generate a report listing:
- Documented endpoints not found in code
- Code endpoints not documented
- Schema fields missing from data model docs
- Outdated folder references

### 4. Update Documentation
Apply corrections to documentation files where discrepancies are found:
- Add missing endpoints or models
- Remove references to deleted features
- Update folder structure diagrams

### 5. Update Progress
Mark documentation sync as complete in `/.claude/docs/progress.md`.

## Output
Updated documentation files and a discrepancy report.
