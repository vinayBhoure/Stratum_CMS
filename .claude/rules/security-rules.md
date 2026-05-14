# Security Rules

## Input Validation
- Validate all user input with Zod before processing
- Enforce field length limits (e.g., title max 100 chars, description max 500 chars)
- Validate URL fields for correct format (GitHub URL, Live URL, LinkedIn, etc.)
- Restrict file upload types: JPG, PNG, WebP, PDF only
- Max file size: 5MB

## Error Handling

### Never Expose Raw Errors
❌ **Bad:**
```javascript
catch (error) {
  res.status(500).json({ error: error.message });
}
```

✅ **Good:**
```javascript
catch (error) {
  console.error('DB Error:', error);
  res.status(500).json({ success: false, data: null, error: 'Internal server error' });
}
```

### Error Response Format
Always use the standard error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message"
  }
}
```

## SQL Injection Prevention
- Prisma parameterizes all queries automatically
- Never use raw SQL with user-provided values without parameterization

## XSS Prevention
- Sanitize HTML content on the backend (DOMPurify or similar)
- Validate content length limits on all text fields

## File Upload Security
- Cloudinary handles file validation on upload
- Restrict file types via MIME type check before upload
- Max file size: 5MB
- Store only Cloudinary URLs in the database, not files themselves

## Authentication
- Clerk handles session-based authentication
- Protected routes require valid Clerk session
- Public API endpoints (`GET /api/v1/:username/...`) are unauthenticated
- No sensitive data exposed in public endpoints

## Data Access
- Users can only access their own data for write operations
- Row-Level Security via Prisma Client Extensions (Phase 4):
```javascript
const xprisma = prisma.$extends({
  query: {
    project: {
      async findMany({ args, query }) {
        args.where = { ...args.where, userId: currentUserId };
        return query(args);
      }
    }
  }
});
```

## Rate Limiting
- Not implemented in MVP (Phase 1)
- Planned for Phase 2: 100 req/hour per API key
- Monitor unusual traffic patterns on public endpoints

## Environment Variables
- Never commit `.env` or `.env.local` files
- Store secrets (DB connection string, Clerk keys, Cloudinary keys) in environment variables only
- `.gitignore` must include: `.env`, `.env.local`
