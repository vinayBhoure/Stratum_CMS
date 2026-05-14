# Git Workflow - Single Command

## `/git-flow`

**Sequential workflow:**

1. **Analyze & Commit** (if changes exist)
   - `git status && git diff`
   - Categorize: feat/fix/dev/chore
   - Generate message: `<type>: <description>`
   - Show files + message, ask approval
   - `git add . && git commit -m "<message>"`

2. **Sync with Remote**
   - Get branch: `BRANCH=$(git branch --show-current)`
   - `git fetch origin`
   - If remote exists: `git pull origin $BRANCH`
   - If conflicts: Show files, analyze, propose fix, `git add . && git commit -m "merge: resolve conflicts"`

3. **Push to Remote**
   - Show unpushed commits: `git log origin/$BRANCH..HEAD --oneline`
   - Ask approval
   - `git push origin $BRANCH` (or `-u` if new branch)

4. **Merge to Main** (optional, ask user)
   - If current branch is feature/dev/bug/fix:
   - `git checkout main && git pull origin main`
   - `git merge --no-ff $BRANCH`
   - Handle conflicts if any
   - `git push origin main && git checkout $BRANCH`

**Commit types**: feat/fix/dev/chore