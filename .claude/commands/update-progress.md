# Workflow: Update Progress

## Purpose
Update the development progress tracker after completing tasks or milestones.

## Trigger Conditions
- After completing a task from the active phase checklist
- After a PR is merged into `development`
- When manually invoked by developer

## Automated Steps

### 1. Read Current Progress
Load `/.claude/docs/progress.md` and identify:
- Current phase (from `current_phase` field)
- Active checklist items
- Items already marked complete

### 2. Identify Completed Work
Cross-reference recent changes with the phase checklist:
- Check git log for recent commits and their types
- Match commit descriptions to checklist items
- Verify completion through automated checks where possible

### 3. Update Checklist
Mark completed items:
```markdown
- [x] Completed task description
```

Update the `last_updated` timestamp:
```yaml
last_updated: "YYYY-MM-DD"
```

### 4. Calculate Phase Progress
Count completed vs total items and update the status:
- **All items complete** → Status: `Complete`
- **Some items complete** → Status: `In Progress`
- **No items started** → Status: `Not Started`

### 5. Check Phase Transition
If all items in the current phase are complete:
- Update current phase status to `Complete`
- Suggest transitioning to the next phase
- Do not auto-transition without developer confirmation

## Output Location
`/.claude/docs/progress.md`
