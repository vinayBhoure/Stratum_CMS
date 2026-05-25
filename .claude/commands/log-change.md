Log a change to the Stratum CMS changelog AND commit + push it via git.

This command performs two jobs: documentation tracking and git workflow.

**Step 1 — Determine change details**

If `$ARGUMENTS` is provided, use it as the change description.
If not, look at the current git diff (`git diff --cached --stat` and `git diff --stat`) to infer what changed, then ask the developer for a one-line description.

**Step 2 — Determine the current phase**

Read `/docs/tracking/TASKS.md` or `CLAUDE.md` to identify the current phase number.

**Step 3 — Append to CHANGELOG.md**

Append a new entry to `/docs/tracking/CHANGELOG.md` in this exact format:

```
### [YYYY-MM-DD] [Phase N] type: description
- Detail of what changed
- Files affected: list key files
```

Where `type` is one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`

**Step 4 — Git workflow**

Execute these git commands in sequence:

1. `git pull origin <current-branch>` — pull latest to avoid conflicts
   - If pull fails due to conflicts, STOP and alert the developer. Do not proceed.
2. `git add -A` — stage all changes (including the updated CHANGELOG.md)
3. `git status` — show the developer what will be committed
4. Ask the developer to confirm the commit. Show them:
   - The proposed commit message: `[Phase N] type: description`
   - The list of staged files
5. On confirmation: `git commit -m "[Phase N] type: description"`
6. `git push origin <current-branch>`
   - If push fails (e.g., rejected due to remote changes), run `git pull --rebase origin <current-branch>` and retry the push once
   - If it still fails, STOP and alert the developer

**Important rules:**
- NEVER force push (`--force` or `-f`)
- NEVER commit to `main` directly — always work on a feature branch
- ALWAYS pull before committing to catch drift early
- ALWAYS show the staged files and get confirmation before committing
- The commit message MUST follow the format: `[Phase N] type: description`
