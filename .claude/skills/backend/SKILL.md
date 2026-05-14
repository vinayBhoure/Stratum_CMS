---
name: backend-development
description: Build and maintain the Express.js backend API for Stratum CMS. Use this skill when working on API endpoints, controllers, services, middleware, or server configuration. Covers route creation, Prisma queries, Clerk authentication integration, Cloudinary uploads, and standardized response formatting.
---

This skill guides development of the Stratum CMS backend API using Express.js, Prisma ORM, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: Clerk (session-based)
- **Storage**: Cloudinary (images, PDFs)
- **Validation**: Zod
- **Language**: JavaScript (not TypeScript) with JSDoc for type hints

## Architecture Pattern
- **Monolith**: Single Express backend service
- **API Style**: REST with `/api/v1/` prefix
- **Stateless**: No server-side session storage (Clerk handles auth)

## Code Organization
```
/server
├── /controllers      # Request handlers (thin, delegate to services)
├── /routes           # API route definitions
├── /middlewares       # Auth, validation, error handling
├── /services         # Business logic, Prisma queries
├── /prisma           # ORM schema + migrations
├── /utils            # Helpers (logger, response formatters)
├── /config           # Environment variables, constants
└── server.js         # Entry point
```

## Key Patterns

### Controller Pattern
Controllers are thin — validate input, call service, return response:
```javascript
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createProject(req, res) {
  try {
    const validated = ProjectSchema.parse(req.body);
    const project = await projectService.create(validated);
    res.status(201).json({ success: true, data: project, error: null });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
```

### Response Format
All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### File Structure
```javascript
// 1. Imports
// 2. Constants
// 3. Main logic (functions)
// 4. Exports
```

## Constraints
- No TypeScript — use JSDoc for type hints
- Always use try-catch for async operations
- Never expose raw database errors to the client
- Use `@/` path alias for imports (configured in package.json)
