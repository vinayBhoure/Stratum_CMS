---
name: debugger
description: Debug and troubleshoot issues in the Stratum CMS application. Use this skill when diagnosing errors, investigating unexpected behavior, or resolving failures in the frontend, backend, or database layers. Covers structured error analysis, log inspection, and systematic resolution workflows.
---

This skill guides debugging and troubleshooting for the Stratum CMS project across all layers.

## Debugging Workflow

### 1. Reproduce the Issue
- Identify the exact steps to reproduce
- Note the expected vs actual behavior
- Capture the error message and stack trace

### 2. Identify the Layer
Determine which component is responsible:

| Layer | Indicators |
|-------|-----------|
| **Frontend** | UI not rendering, state issues, fetch errors, React component errors |
| **Backend** | API returns wrong status code, validation failures, route not found |
| **Database** | Prisma query errors, migration failures, connection issues |
| **Auth** | Clerk session issues, redirect failures, unauthorized access |
| **Storage** | Cloudinary upload failures, invalid URLs |

### 3. Inspect Logs

**Backend errors:**
```bash
cd server && npm run dev
# Watch console output for Express error logs
```

**Database errors:**
```bash
cd server && npx prisma studio
# Inspect data directly in the database
```

**Frontend errors:**
- Open browser DevTools → Console tab
- Check Network tab for failed API calls

### 4. Common Error Patterns

#### Prisma Query Errors
- `P2002` — Unique constraint violation (duplicate data)
- `P2025` — Record not found
- `P2003` — Foreign key constraint violation

#### Express Errors
- `404` — Route not defined or wrong HTTP method
- `400` — Validation error (Zod parse failure)
- `500` — Unhandled exception (check try-catch blocks)

#### Clerk Auth Errors
- Session expired — User needs to re-authenticate
- Invalid token — Clerk middleware misconfiguration

### 5. Resolution Pattern
```javascript
try {
  // Operation
} catch (error) {
  // 1. Log the full error internally
  console.error('Context:', error);

  // 2. Return safe error to client
  res.status(500).json({
    success: false,
    data: null,
    error: 'Internal server error'
  });
}
```

### 6. Verify Fix
- Reproduce the original issue — confirm it no longer occurs
- Run related lint checks: `npm run lint`
- Test adjacent functionality to prevent regressions

## Error Documentation
Document resolved errors in `docs/errors/error-registry.md` with:
- Error code/message
- Root cause
- Resolution steps
- Prevention measures
