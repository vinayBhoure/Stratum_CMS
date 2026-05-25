Show the current development status of Stratum CMS.

1. Read `/docs/tracking/TASKS.md`
2. Identify the current active phase
3. Count tasks by status category and produce a summary:

```
Stratum CMS — Status Report
Phase: [N] — [Name]

  ✅ Done:        [count]
  🔄 In Progress: [count]
  ⬚ Todo:         [count]
  🚫 Blocked:     [count]
  ─────────────────
  Total:          [count]

Progress: [percentage]% complete

Currently in progress:
- [task name]
- [task name]

Blocked items:
- [task name] — [reason]

Next up:
- [first todo task]
- [second todo task]
```

4. If all tasks for the current phase are done, suggest running the `phase-gate` sub-agent to verify exit criteria
5. Keep the output concise — this is a quick status glance, not a report
