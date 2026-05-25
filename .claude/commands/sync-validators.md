Compare frontend and backend Zod validation schemas for drift.

For each domain (auth, userInformation, projects, experience, skills, tags, resume):

1. Check if the backend validator exists: `/server/src/validators/{domain}.schema.ts`
2. Check if the frontend mirror exists: `/client/src/validators/{domain}.schema.ts`
3. If both exist, compare them for:
   - Field names that exist in one but not the other
   - Field types that differ (string vs number, optional vs required, etc.)
   - Constraint values that differ (min/max lengths, regex patterns)
   - `.strict()` usage on write schemas
   - `.refine()` rules that exist in one but not the other

Report findings:

```
Validator Sync Report
═══════════════════

auth.schema.ts          ✓ in sync
userInformation.schema  ✓ in sync
projects.schema.ts      ✗ DRIFT — FE missing field "mediaUrl"
experience.schema.ts    ✗ DRIFT — password max length differs (FE: 50, BE: 100)
skills.schema.ts        ⚠ BE exists, FE missing
tags.schema.ts          ✓ in sync
resume.schema.ts        ✓ in sync

Sync Score: 5/7
```

If any drift is found, list the specific differences with file paths so they can be fixed.
