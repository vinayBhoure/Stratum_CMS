Log an implementation decision to the Stratum CMS decision tracker.

Use this when an implementation choice diverges from the KB, or when a new architectural choice is made during coding that should be recorded.

If `$ARGUMENTS` is provided, use it as the decision topic.

**Gather the following** (ask the developer if not clear):
- What was decided?
- Why? (rationale)
- What alternatives were considered and rejected?
- Does this contradict or extend any KB v2.0 decision? If so, which one?

**Append to `/docs/tracking/DECISIONS.md`** in this format:

```
---

#### D-[next-number] [YYYY-MM-DD] — Brief title
**Decision:** What was decided
**Rationale:** Why this choice was made
**Alternatives rejected:** What else was considered
**KB reference:** Which KB decision this extends or overrides (if any, else "New")
**Phase:** Phase N
```

After appending, confirm the entry and remind the developer: if this overrides a KB v2.0 decision, the KB itself should be updated separately.
