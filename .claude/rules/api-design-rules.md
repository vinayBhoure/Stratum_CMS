# API Design Rules

## Base URL
All API endpoints use the `/api/v1/` prefix.
```
https://api.stratumcms.com/api/v1/
```

## Endpoint Conventions

### Public Endpoints (Unauthenticated)
Read-only `GET` endpoints scoped by username:
```
GET /api/v1/:username/projects
GET /api/v1/:username/experience
GET /api/v1/:username/skills
GET /api/v1/:username/contact
GET /api/v1/:username/resume
```

**Rules:**
- No authentication required
- Username must exist (return 404 if not)
- Return empty array `[]` if no data exists for the user

### Authenticated Endpoints (Protected)
CRUD operations on user-owned resources:
```
POST   /api/v1/projects
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```
Repeat pattern for: `experience`, `skills`, `contact`, `resume`

**Upload:**
```
POST /api/v1/upload
```
Uploads file to Cloudinary, returns URL.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

## Validation
- All input validated with Zod on both frontend and backend
- Return `400` for validation errors
- Return `404` for missing resources
- Return `500` for internal server errors (never expose raw error details)

## Controller Pattern
Controllers are thin — delegate business logic to services:
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
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
```

## Versioning
- All endpoints are prefixed with `/api/v1/`
- Future breaking changes will use `/api/v2/`
