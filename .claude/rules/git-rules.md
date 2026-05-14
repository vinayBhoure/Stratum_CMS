# Git Rules

## Branch Strategy

### Branch Naming Convention
```
main              → Production-ready code (protected)
development       → Active development branch (default working branch)
feature/<name>    → New features (e.g., feature/project-crud)
fix/<name>        → Bug fixes (e.g., fix/auth-redirect)
refactor/<name>   → Code refactoring (e.g., refactor/api-response-format)
docs/<name>       → Documentation updates (e.g., docs/api-reference)
```

### Rules
- **Never commit directly to `main`** — all changes go through `development` first
- **`development`** is the day-to-day working branch
- Feature branches are created from `development` and merged back into `development`
- `main` is updated only via PR from `development` after phase completion or stable milestone

### Branch Lifecycle
```
1. Create branch:    git checkout -b feature/project-crud development
2. Work + commit:    (make changes, commit with conventional messages)
3. Push:             git push origin feature/project-crud
4. PR:               feature/project-crud → development
5. Merge:            Squash merge preferred for clean history
6. Delete branch:    git branch -d feature/project-crud
```

---

## Commit Message Convention

### Format
```
<type>: <short description>

[optional body]
[optional footer]
```

### Types
| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or functionality | `feat: add project CRUD endpoints` |
| `fix` | Bug fix | `fix: resolve auth redirect loop` |
| `refactor` | Code restructure (no behavior change) | `refactor: extract validation middleware` |
| `docs` | Documentation changes | `docs: add API endpoint reference` |
| `style` | Formatting, whitespace (no logic change) | `style: fix indentation in routes` |
| `test` | Adding or updating tests | `test: add project service unit tests` |
| `chore` | Tooling, config, dependencies | `chore: update prisma to v5.x` |
| `build` | Build system or deployment changes | `build: add docker configuration` |

### Rules
- **Subject line**: Max 72 characters, imperative mood ("add" not "added")
- **No period** at the end of the subject line
- **Body** (optional): Explain *why*, not *what* — the diff shows the what
- **Reference issues** in footer: `Closes #12` or `Related: #15`

### Examples
✅ **Good:**
```
feat: add project creation endpoint

Implements POST /api/v1/projects with Zod validation.
Stores project data in PostgreSQL via Prisma.

Closes #5
```

❌ **Bad:**
```
updated stuff
```
```
Fixed the thing that was broken in the projects page
```

---

## Pull Request Rules

### PR Title
Same format as commit messages: `<type>: <description>`

### PR Description Template
```markdown
## What
Brief description of what this PR does.

## Why
Context or motivation for the change.

## How
Technical approach taken.

## Checklist
- [ ] Code follows project coding standards
- [ ] No console.log or debug statements left
- [ ] Tested locally (frontend + backend if applicable)
- [ ] Documentation updated (if API or schema changed)
- [ ] Changelog entry added (if user-facing change)
```

### Merge Rules
- **Squash merge** into `development` for feature/fix branches (clean history)
- **Regular merge** from `development` into `main` (preserve phase history)
- Delete source branch after merge

---

## Staging & Committing

### What to Commit
✅ Source code, configuration, documentation, migrations
❌ `node_modules/`, `.env`, build artifacts, OS files

### .gitignore Essentials
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
Thumbs.db
```

### Commit Frequency
- Commit after each logical unit of work (not at end of day)
- Each commit should be buildable — never commit broken code
- Small, focused commits > large, multi-purpose commits

---

## Tagging & Releases

### Version Tags
Format: `vX.Y.Z` (semantic versioning)
- **Major (X)**: Breaking changes
- **Minor (Y)**: New features (backward compatible)
- **Patch (Z)**: Bug fixes

### When to Tag
- After merging `development` → `main` for a phase milestone
- Example: `v0.1.0` after Phase 0 (Foundation) is complete
