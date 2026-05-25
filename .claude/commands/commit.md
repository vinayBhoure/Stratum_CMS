Stage and commit changes following Stratum CMS commit conventions.

**Commit message format:** `[Phase N] type: description`

Where `type` is one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`

If `$ARGUMENTS` is provided, use it as the description and infer the type and phase.
If not provided, look at `git diff --cached --stat` (or `git diff --stat` if nothing is staged) to infer what changed, then ask the developer for confirmation.

**Steps:**

1. Check current branch name to determine the phase number (extract from `phase-{N}/...`)
   - If not on a phase branch, ask the developer for the phase number
2. Run `git status` to see what's changed
3. Stage all changes: `git add -A`
4. Show the developer:
   - Proposed commit message
   - List of staged files
5. Ask for confirmation before committing
6. On confirmation: `git commit -m "[Phase N] type: description"`

**Rules:**
- Description should be imperative mood: "add health endpoint" not "added health endpoint"
- Keep description under 72 characters
- Do NOT push — `/log-change` handles push. This command is for quick commits only
- If the developer wants commit + push + changelog in one go, suggest `/log-change` instead
