# Error Documentation Template

Use this template to document resolved errors for future reference.

---

## Error: [Error Name/Code]

**Date:** YYYY-MM-DD
**Layer:** Frontend / Backend / Database / Auth / Storage
**Severity:** Critical / High / Medium / Low

### Error Message
```
[Exact error message or stack trace]
```

### Context
- What operation was being performed
- Which endpoint or component was involved
- User action that triggered the error

### Root Cause
[Explanation of why the error occurred]

### Resolution
[Steps taken to fix the error]

### Code Change
```diff
- [old code]
+ [new code]
```

### Prevention
[How to prevent this error in the future]

---

## Common Error Codes

### Prisma
| Code | Meaning |
|------|---------|
| P2002 | Unique constraint violation |
| P2025 | Record not found |
| P2003 | Foreign key constraint violation |

### HTTP
| Status | Meaning |
|--------|---------|
| 400 | Validation error (Zod parse failure) |
| 404 | Resource or route not found |
| 401 | Unauthorized (Clerk session invalid) |
| 500 | Internal server error |
