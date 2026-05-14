# Workflow: Add Changelog Entry

## Trigger Conditions
- After committing code to `development` or `main` branch
- When manually invoked by developer

## Automated Steps

### 1. Analyze Recent Commits
```bash
git log --since="1 day ago" --pretty=format:"%h - %s (%an)"
```

### 2. Categorize Changes
Parse commit messages to extract:
- **Features**: Commits starting with `feat:` or `feature:`
- **Fixes**: Commits starting with `fix:` or `bugfix:`
- **Refactor**: Commits starting with `refactor:`
- **Docs**: Commits starting with `docs:`
- **Tests**: Commits starting with `test:`
- **Chore**: Commits starting with `chore:`

### 3. Update Changelog File
Append to `/.claude/docs/changelog.md`:

```markdown
## [Date] - Phase X

### Added
- [Feature description from commit]

### Fixed
- [Bug fix description from commit]

### Changed
- [Refactor description from commit]

### Technical
- [Internal changes, dependency updates]
```

### 4. Verify Entry
Check that:
- Date is in YYYY-MM-DD format
- Phase number matches current phase in `progress.md`
- No duplicate entries

## Manual Override
Developer can edit the generated entry before committing.

## Output Location
`/.claude/docs/changelog.md`