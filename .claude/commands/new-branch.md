Create a new git branch following Stratum CMS naming conventions.

**Branch naming format:** `phase-{N}/{feature-name}`

If `$ARGUMENTS` is provided, parse it as `phase-number feature-name` (e.g., `/new-branch 2 auth-signup`).
If not provided, ask the developer for:
- Phase number
- Short feature name (lowercase, hyphens, no spaces)

**Steps:**

1. Ensure working directory is clean: `git status`
   - If there are uncommitted changes, warn the developer and ask if they want to stash or commit first
2. Fetch latest: `git fetch origin`
3. Switch to main: `git checkout main`
4. Pull latest main: `git pull origin main`
5. Create and switch to new branch: `git checkout -b phase-{N}/{feature-name}`
6. Push the branch upstream: `git push -u origin phase-{N}/{feature-name}`
7. Confirm: "Created and pushed branch `phase-{N}/{feature-name}` from latest main."

**Naming rules:**
- Always prefix with `phase-{N}/`
- Feature name is lowercase with hyphens: `auth-signup`, `crud-projects`, `public-api`
- No underscores, no camelCase in branch names
