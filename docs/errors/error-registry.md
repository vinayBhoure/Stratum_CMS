# Error Registry — Stratum CMS

Central registry of documented errors encountered during development.

---

## How to Use
1. When a non-trivial error is resolved, add an entry below
2. Use the template in `error-example-${0}.md` for detailed documentation
3. Reference this registry when debugging similar issues

---

## Registry

| # | Error Code | Layer | Summary | Status | Doc Link |
|---|-----------|-------|---------|--------|----------|
| — | *No errors documented yet* | — | — | — | — |

---

## Error Categories

### Prisma / Database
| Code | Meaning | Common Cause |
|------|---------|-------------|
| P2002 | Unique constraint violation | Duplicate entry (e.g., username, email) |
| P2025 | Record not found | Invalid ID in query |
| P2003 | Foreign key constraint violation | Referencing non-existent parent record |

### HTTP / API
| Status | Meaning | Common Cause |
|--------|---------|-------------|
| 400 | Bad Request | Zod validation failure on input |
| 401 | Unauthorized | Missing or invalid Clerk session |
| 404 | Not Found | Invalid route or missing resource |
| 500 | Internal Server Error | Unhandled exception in try-catch |

### Frontend
| Type | Common Cause |
|------|-------------|
| Fetch error | Backend not running or wrong API URL |
| State mismatch | Zustand store not updated after CRUD |
| Render error | Missing required prop or null data |

---

## Response Format Reference
All API errors follow this format:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```
