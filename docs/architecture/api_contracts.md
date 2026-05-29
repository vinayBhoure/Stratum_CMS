# Stratum CMS — API Contracts (LLD)

> Locked specification. Reflects all decisions from HLD + LLD sessions.
> Use this document as the contract between backend implementation and frontend RTK Query slices.

---

## 1. Conventions

### 1.1 Base URLs

| Surface | Base URL |
|---|---|
| Authenticated / private API | `https://api.domain.com/api/v1` |
| Public API (no auth) | `https://api.domain.com/v1` |

The public API has its own root (`/v1/...`) so it stays cleanly separated from the authenticated app surface (`/api/v1/...`).

### 1.2 Response Envelope

Every response, success or failure, uses this exact shape:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "statusCode": 200
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation",
    "details": { ... }
  },
  "statusCode": 400
}
```

`details` is optional and used for things like validation errors or referenced-by lists (block-delete).

### 1.3 Authentication

- JWT stored in `httpOnly` cookie named `stratum_token`.
- 7-day lifetime.
- Browser sends cookie automatically; frontend uses `credentials: 'include'`.
- Cookie attributes:
  - Production: `httpOnly: true, secure: true, sameSite: 'none'`
  - Development: `httpOnly: true, secure: false, sameSite: 'lax'`

### 1.4 Auth Levels

| Level | Description | Header/Cookie |
|---|---|---|
| `public` | No auth required | none |
| `authenticated` | Any logged-in user | `stratum_token` cookie |
| `masterAdmin` | Logged in AND role = masterAdmin | `stratum_token` cookie + role check |

### 1.5 Pagination

Offset-based, applied to all list endpoints (active or future).

**Query params:**
- `page` (integer, default 1)
- `limit` (integer, default 20, max 100)

**Response shape additions** when paginated:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 47,
      "totalPages": 3
    }
  },
  "error": null,
  "statusCode": 200
}
```

For MVP, list endpoints can ignore pagination params and return all items. The envelope must already include `pagination` so frontend code doesn't need to change later.

### 1.6 Content-Type

- All JSON endpoints: `application/json`
- File upload endpoints: `multipart/form-data`

---

## 2. Standard Error Codes

| Code | HTTP Status | When |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Zod schema rejected the request |
| `INVALID_DURATION` | 400 | Experience activeJob/durationTo mismatch |
| `INVALID_REFERENCE` | 400 | skillIds or tagIds reference non-existent or non-owned records |
| `INVALID_FILE` | 400 | Wrong MIME type or oversized upload |
| `UNAUTHENTICATED` | 401 | Missing or invalid JWT |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `INVALID_TOKEN` | 401 | JWT malformed or expired |
| `TOKEN_REVOKED` | 401 | JWT is in the blacklist |
| `FORBIDDEN` | 403 | Authenticated but not authorized (e.g., non-admin hitting admin route) |
| `NOT_FOUND` | 404 | Resource does not exist |
| `USER_NOT_FOUND` | 404 | Public API: userId does not exist |
| `EMAIL_EXISTS` | 409 | Signup with duplicate email |
| `SKILL_IN_USE` | 409 | Cannot delete skill — referenced by experience or projects |
| `TAG_IN_USE` | 409 | Cannot delete tag — referenced by projects |
| `SYSTEM_TAG_PROTECTED` | 409 | Cannot delete a system tag (e.g., featured) |
| `EMAIL_NOT_VERIFIED` | 403 | (Phase 7) Email verification required |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `NOT_IMPLEMENTED` | 501 | Phase 1 stub — endpoint not yet built (replaced when the domain is implemented) |

---

## 3. Auth Module — `/api/v1/auth`

### 3.1 Signup

```
POST /api/v1/auth/signup
Auth: public
```

**Request body:**
```json
{
  "email": "vinay@example.com",
  "password": "MySecure123",
  "name": "Vinay"
}
```

**Validation:**
- `email`: valid email format
- `password`: min 8 chars, must contain uppercase + lowercase + number
- `name`: 1–100 chars, trimmed

**Response 201:**
```json
{
  "success": true,
  "data": {
    "userId": "Vk3pXq9aZmN1",
    "name": "Vinay",
    "role": "user"
  },
  "error": null,
  "statusCode": 201
}
```

Sets `stratum_token` cookie. Frontend redirects to onboarding.

**Errors:** `VALIDATION_FAILED`, `EMAIL_EXISTS`

---

### 3.2 Login

```
POST /api/v1/auth/login
Auth: public
```

**Request body:**
```json
{
  "email": "vinay@example.com",
  "password": "MySecure123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "userId": "Vk3pXq9aZmN1",
    "name": "Vinay",
    "role": "user"
  },
  "error": null,
  "statusCode": 200
}
```

Sets `stratum_token` cookie.

**Errors:** `VALIDATION_FAILED`, `INVALID_CREDENTIALS`

---

### 3.3 Logout

```
POST /api/v1/auth/logout
Auth: authenticated
```

**Request body:** none

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Logged out" },
  "error": null,
  "statusCode": 200
}
```

Clears the cookie. Adds the token to the blacklist.

**Errors:** `UNAUTHENTICATED`

---

### 3.4 Delete Account

```
DELETE /api/v1/auth/account
Auth: authenticated
```

Hard delete — cascades to all user data.

**Request body:**
```json
{
  "password": "MySecure123"
}
```

Re-prompts for password as a confirmation step.

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Account deleted" },
  "error": null,
  "statusCode": 200
}
```

Clears cookie.

**Errors:** `UNAUTHENTICATED`, `INVALID_CREDENTIALS`

---

### 3.5 Get Current Session

```
GET /api/v1/auth/session
Auth: authenticated
```

Used by frontend on app load to verify the cookie and rehydrate Redux state.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "userId": "Vk3pXq9aZmN1",
    "name": "Vinay",
    "role": "user",
    "emailVerified": false
  },
  "error": null,
  "statusCode": 200
}
```

**Errors:** `UNAUTHENTICATED`, `TOKEN_REVOKED`

---

### 3.6 Deferred to Phase 7

These endpoints are not implemented in Phase 2 but documented here for forward planning:

- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`

---

## 4. User Information Module — `/api/v1/me`

Each authenticated user has exactly one UserInformation row. Routes are scoped to the caller via the JWT — no explicit userId needed.

### 4.1 Get My Profile

```
GET /api/v1/me
Auth: authenticated
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "userId": "Vk3pXq9aZmN1",
    "name": "Vinay",
    "email": "vinay@portfolio.com",
    "contactNumber": { "countryCode": "+91", "number": "9999999999" },
    "address": "Delhi, India",
    "googleLocationLink": "https://maps.google.com/...",
    "socialMediaLinks": {
      "linkedin": "https://linkedin.com/in/vinay",
      "github": "https://github.com/vinay",
      "twitter": "https://twitter.com/vinay"
    },
    "createdAt": "2026-05-23T10:30:00.000Z",
    "updatedAt": "2026-05-23T10:30:00.000Z"
  },
  "error": null,
  "statusCode": 200
}
```

**Errors:** `UNAUTHENTICATED`

---

### 4.2 Update My Profile

```
PUT /api/v1/me
Auth: authenticated
```

Full replacement (PUT semantics). All fields except `name` can be `null` to clear them.

**Request body:**
```json
{
  "name": "Vinay Kumar",
  "email": "vinay@portfolio.com",
  "contactNumber": { "countryCode": "+91", "number": "9999999999" },
  "address": "Delhi, India",
  "googleLocationLink": "https://maps.google.com/...",
  "socialMediaLinks": {
    "linkedin": "https://linkedin.com/in/vinay",
    "github": "https://github.com/vinay"
  }
}
```

**Validation:**
- `name`: required, 1–100 chars
- `email`: optional, valid email if present
- `contactNumber`: optional, both fields required if object present
- `address`, `googleLocationLink`: optional strings
- `socialMediaLinks`: optional object, all values must be valid URLs

**Response 200:** Same shape as GET.

**Errors:** `VALIDATION_FAILED`, `UNAUTHENTICATED`

---

## 5. Skills Module — `/api/v1/skills`

### 5.1 List My Skills

```
GET /api/v1/skills
Auth: authenticated
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "Sk1aBc2dEf3g", "skill": "React", "createdAt": "...", "updatedAt": "..." },
      { "id": "Sk4hIj5kLm6n", "skill": "Node.js", "createdAt": "...", "updatedAt": "..." }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
  },
  "error": null,
  "statusCode": 200
}
```

---

### 5.2 Create Skill

```
POST /api/v1/skills
Auth: authenticated
```

**Request body:**
```json
{ "skill": "TypeScript" }
```

**Validation:** `skill` required, 1–50 chars, trimmed. Unique per user (DB constraint).

**Response 201:**
```json
{
  "success": true,
  "data": { "id": "Sk7oPq8rSt9u", "skill": "TypeScript", "createdAt": "...", "updatedAt": "..." },
  "error": null,
  "statusCode": 201
}
```

**Errors:** `VALIDATION_FAILED` (includes case where skill name already exists for this user)

---

### 5.3 Update Skill

```
PUT /api/v1/skills/:skillId
Auth: authenticated
```

**Request body:**
```json
{ "skill": "TypeScript 5" }
```

**Response 200:** updated skill object.

**Errors:** `VALIDATION_FAILED`, `NOT_FOUND`

---

### 5.4 Delete Skill (Block-Delete)

```
DELETE /api/v1/skills/:skillId
Auth: authenticated
```

**Response 204** if deleted.

**Errors:**
- `NOT_FOUND` — skill doesn't exist or not owned by caller
- `SKILL_IN_USE` (409) — referenced by experience or projects, includes details:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SKILL_IN_USE",
    "message": "Cannot delete skill — it is referenced by other content.",
    "details": {
      "referencedBy": {
        "experiences": [
          { "id": "Ex1...", "title": "Senior Developer at Acme" }
        ],
        "projects": [
          { "id": "Pr2...", "title": "Portfolio Site" }
        ]
      }
    }
  },
  "statusCode": 409
}
```

---

## 6. Tags Module — `/api/v1/tags`

### 6.1 List Available Tags

```
GET /api/v1/tags
Auth: authenticated
```

Returns user-owned tags + all system tags (e.g., `featured`).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "Tg1...", "name": "featured", "isSystem": true, "userId": null },
      { "id": "Tg2...", "name": "frontend", "isSystem": false, "userId": "Vk3pXq9aZmN1" }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
  },
  "error": null,
  "statusCode": 200
}
```

---

### 6.2 Create Tag

```
POST /api/v1/tags
Auth: authenticated
```

**Request body:**
```json
{ "name": "backend" }
```

**Validation:** `name` required, 1–30 chars, lowercase, no spaces (regex `^[a-z0-9-]+$`). Unique per user.

**Response 201:** created tag (`isSystem: false`, `userId` set).

**Errors:** `VALIDATION_FAILED`

---

### 6.3 Update Tag

```
PUT /api/v1/tags/:tagId
Auth: authenticated
```

**Request body:** `{ "name": "back-end" }`

**Errors:** `VALIDATION_FAILED`, `NOT_FOUND`, `SYSTEM_TAG_PROTECTED` if attempting to rename a system tag.

---

### 6.4 Delete Tag

```
DELETE /api/v1/tags/:tagId
Auth: authenticated
```

**Response 204** if deleted.

**Errors:**
- `NOT_FOUND`
- `SYSTEM_TAG_PROTECTED` (409) — cannot delete `featured` or any other system tag
- `TAG_IN_USE` (409) — referenced by projects:

```json
{
  "error": {
    "code": "TAG_IN_USE",
    "message": "Cannot delete tag — it is referenced by projects.",
    "details": {
      "referencedBy": {
        "projects": [{ "id": "Pr2...", "title": "Portfolio Site" }]
      }
    }
  }
}
```

---

## 7. Projects Module — `/api/v1/projects`

### 7.1 List My Projects

```
GET /api/v1/projects
Auth: authenticated
Query: ?page=1&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "Pr1aBc2dEf3g",
        "title": "Portfolio Site",
        "description": "My personal portfolio site",
        "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
        "githubLink": "https://github.com/vinay/portfolio",
        "liveLink": "https://vinay.dev",
        "skills": [
          { "id": "Sk1...", "skill": "React" },
          { "id": "Sk2...", "skill": "TypeScript" }
        ],
        "tags": [
          { "id": "Tg1...", "name": "featured", "isSystem": true },
          { "id": "Tg2...", "name": "frontend", "isSystem": false }
        ],
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  },
  "error": null,
  "statusCode": 200
}
```

---

### 7.2 Get Project by ID

```
GET /api/v1/projects/:projectId
Auth: authenticated
```

Same shape as list item.

**Errors:** `NOT_FOUND`

---

### 7.3 Create Project

```
POST /api/v1/projects
Auth: authenticated
```

**Request body:**
```json
{
  "title": "Portfolio Site",
  "description": "My personal portfolio",
  "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
  "githubLink": "https://github.com/vinay/portfolio",
  "liveLink": "https://vinay.dev",
  "skillIds": ["Sk1aBc2dEf3g", "Sk4hIj5kLm6n"],
  "tagIds": ["Tg1...", "Tg2..."]
}
```

**Validation:**
- `title`: required, 1–200 chars
- `description`: optional, max 5000 chars (plain text in Phase 3, markdown in Phase 7)
- `mediaUrl`, `githubLink`, `liveLink`: optional, valid URLs
- `skillIds`: optional array, each must be a skill owned by caller
- `tagIds`: optional array, each must be a tag owned by caller OR a system tag

**Important:** `mediaUrl` is set by uploading the file first via the Media endpoint (§11), then passing the returned URL here. This keeps project creation pure-JSON.

**Response 201:** created project with embedded skills/tags arrays.

**Errors:** `VALIDATION_FAILED`, `INVALID_REFERENCE`

---

### 7.4 Update Project

```
PUT /api/v1/projects/:projectId
Auth: authenticated
```

Full replacement. Same body shape as create.

Junction tables are diffed and updated atomically — passing a different `skillIds` array replaces the project's skill links entirely.

**Errors:** `VALIDATION_FAILED`, `NOT_FOUND`, `INVALID_REFERENCE`

---

### 7.5 Delete Project

```
DELETE /api/v1/projects/:projectId
Auth: authenticated
```

**Response 204.** Junctions cascade automatically.

**Errors:** `NOT_FOUND`

---

## 8. Experience Module — `/api/v1/experience`

### 8.1 List My Experience

```
GET /api/v1/experience
Auth: authenticated
Query: ?page=1&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "Ex1aBc2dEf3g",
        "title": "Senior Developer",
        "company": "Acme Inc.",
        "location": "Remote",
        "durationFrom": "2024-01-01T00:00:00.000Z",
        "durationTo": null,
        "activeJob": true,
        "description": "Worked on the platform team...",
        "certificates": [
          {
            "name": "AWS Certified",
            "url": "https://res.cloudinary.com/.../cert.pdf",
            "updatedAt": "2024-06-15T00:00:00.000Z",
            "isActive": true
          }
        ],
        "skills": [
          { "id": "Sk1...", "skill": "React" }
        ],
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  },
  "error": null,
  "statusCode": 200
}
```

---

### 8.2 Get Experience by ID

```
GET /api/v1/experience/:experienceId
Auth: authenticated
```

---

### 8.3 Create Experience

```
POST /api/v1/experience
Auth: authenticated
```

**Request body:**
```json
{
  "title": "Senior Developer",
  "company": "Acme Inc.",
  "location": "Remote",
  "durationFrom": "2024-01-01T00:00:00.000Z",
  "durationTo": null,
  "activeJob": true,
  "description": "Worked on the platform team",
  "certificates": [
    {
      "name": "AWS Certified",
      "url": "https://res.cloudinary.com/.../cert.pdf"
    }
  ],
  "skillIds": ["Sk1...", "Sk2..."]
}
```

**Validation:**
- `title`, `company`: required, 1–200 chars
- `location`: optional, max 200 chars
- `durationFrom`: required, ISO date
- `activeJob`: required boolean
- **Conditional rule (Zod `.refine()`):**
  - If `activeJob === true` → `durationTo` must be `null`
  - If `activeJob === false` → `durationTo` must be present and after `durationFrom`
- `description`: optional, max 10000 chars
- `certificates`: optional array of `{ name, url }`. Server fills `updatedAt: now()` and `isActive: true` on insert.
- `skillIds`: optional array, must reference caller-owned skills

**Response 201:** created experience.

**Errors:** `VALIDATION_FAILED`, `INVALID_DURATION`, `INVALID_REFERENCE`

---

### 8.4 Update Experience

```
PUT /api/v1/experience/:experienceId
Auth: authenticated
```

Full replacement.

**Certificate updates:** clients send the full `certificates` array as desired. Server preserves existing `updatedAt` for unchanged entries and refreshes it for modified ones. `isActive` can be toggled by the client.

**Errors:** `VALIDATION_FAILED`, `NOT_FOUND`, `INVALID_DURATION`, `INVALID_REFERENCE`

---

### 8.5 Delete Experience

```
DELETE /api/v1/experience/:experienceId
Auth: authenticated
```

**Response 204.** Junction cascade.

---

## 9. Resume Module — `/api/v1/resume`

Single resume per user. POST replaces any existing resume (old Cloudinary asset deleted).

### 9.1 Get My Resume

```
GET /api/v1/resume
Auth: authenticated
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../resume.pdf",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "error": null,
  "statusCode": 200
}
```

If no resume exists, returns 200 with `data: null`:
```json
{ "success": true, "data": null, "error": null, "statusCode": 200 }
```

---

### 9.2 Upload Resume

```
POST /api/v1/resume
Auth: authenticated
Content-Type: multipart/form-data
```

**Request body:** form field `file` containing the PDF.

**Validation:**
- MIME type must be `application/pdf`
- Max size: 5MB

**Response 201:** new resume object.

**Errors:** `INVALID_FILE`, `UNAUTHENTICATED`

---

### 9.3 Delete Resume

```
DELETE /api/v1/resume
Auth: authenticated
```

Deletes both DB row and Cloudinary asset.

**Response 204** if deleted, or `NOT_FOUND` if no resume exists.

---

## 10. Master Admin Module — `/api/v1/admin`

All endpoints require `role === masterAdmin`.

### 10.1 List Users

```
GET /api/v1/admin/users
Auth: masterAdmin
Query: ?page=1&limit=20&search=vinay
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "Vk3pXq9aZmN1",
        "name": "Vinay",
        "email": "vinay@example.com",
        "role": "user",
        "emailVerified": false,
        "createdAt": "2026-05-01T...",
        "counts": {
          "projects": 5,
          "experiences": 3,
          "skills": 12
        }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
  },
  "error": null,
  "statusCode": 200
}
```

**Errors:** `UNAUTHENTICATED`, `FORBIDDEN`

---

### 10.2 Get User Detail

```
GET /api/v1/admin/users/:userId
Auth: masterAdmin
```

Returns user summary + counts. Does NOT return password or any sensitive auth data.

**Errors:** `NOT_FOUND`, `FORBIDDEN`

---

### 10.3 Delete User

```
DELETE /api/v1/admin/users/:userId
Auth: masterAdmin
```

Hard delete with cascade.

**Response 204.**

**Errors:** `NOT_FOUND`, `FORBIDDEN`

Master admins cannot:
- Edit user content (no PUT/PATCH on user resources)
- Reset user passwords
- Impersonate users

These rules are enforced by the absence of corresponding endpoints, not by runtime checks.

---

## 11. Media Upload Module — `/api/v1/media`

Generic media uploader. Serves three use cases under one endpoint:
- **Project `mediaUrl`** — image or video attached to a project
- **Experience certificate URLs** — PDFs attached to an experience entry
- Resume has its own dedicated upload at `POST /resume` — kept separate for its simpler single-file flow

**Upload flow for projects and experience:**
1. Frontend calls `POST /api/v1/media/upload` with the file
2. Server uploads to Cloudinary, returns the hosted URL
3. Frontend includes the returned URL in the JSON body when calling `POST /api/v1/projects`, `PUT /api/v1/projects/:id`, `POST /api/v1/experience`, or `PUT /api/v1/experience/:id`

This keeps all project/experience endpoints pure JSON — no mixed multipart payloads on content endpoints.

### 11.1 Upload Media

```
POST /api/v1/media/upload
Auth: authenticated
Content-Type: multipart/form-data
```

**Request body:**
- form field `file`: the media file
- form field `type`: one of `image`, `video`, `pdf`

**Type usage guide:**
- `image` — project `mediaUrl` (photos, screenshots)
- `video` — project `mediaUrl` (demo videos)
- `pdf` — experience certificate URLs

**Validation:**
- `image`: jpg, png, webp — max 5MB
- `video`: mp4, webm — max 50MB
- `pdf`: application/pdf — max 5MB

**Response 201:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../asset.jpg",
    "type": "image"
  },
  "error": null,
  "statusCode": 201
}
```

**Errors:** `INVALID_FILE`, `UNAUTHENTICATED`

---

## 12. Public API — `/v1/:userId/:section`

No authentication. No rate limiting in MVP. Read-only.

Standard envelope applies, but two specific responses are unique to the public API:

**User not found:**
```json
{
  "success": false,
  "data": null,
  "error": { "code": "USER_NOT_FOUND", "message": "no user found" },
  "statusCode": 404
}
```

**Empty resource for valid user (lists return `[]`, singulars return `null`):**
```json
{ "success": true, "data": null, "error": null, "statusCode": 200 }
```
> **Note (D-P4-01):** `NO_DATA` error code was dropped in implementation. Lists (`projects`, `experience`, `skills`, `tags`) return `data: []`; absent singular resources (`user-info`, `resume`) return `data: null`. No `error` field is populated for empty responses.

### 12.1 Get Public User Info

```
GET /v1/:userId/user-info
```

**Response 200:** UserInformation shape (without timestamps to keep public payload minimal).

```json
{
  "success": true,
  "data": {
    "name": "Vinay",
    "email": "vinay@portfolio.com",
    "contactNumber": { "countryCode": "+91", "number": "9999999999" },
    "address": "Delhi, India",
    "googleLocationLink": "...",
    "socialMediaLinks": { "linkedin": "...", "github": "..." }
  },
  "error": null,
  "statusCode": 200
}
```

---

### 12.2 Get Public Projects

```
GET /v1/:userId/projects
Query: ?tag=featured (optional filter)
       ?limit=N      (optional, returns all if omitted)
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Portfolio Site",
      "description": "...",
      "mediaUrl": "...",
      "githubLink": "...",
      "liveLink": "...",
      "skills": ["React", "TypeScript"],
      "tags": ["featured", "frontend"]
    }
  ],
  "error": null,
  "statusCode": 200
}
```

Skills and tags are flattened to string arrays since consumers (portfolio sites) don't need IDs.

Optional `?tag=featured` filter returns only projects with that tag — enables the "All / Frontend / Backend" filter buttons described in KB §5.5.

Optional `?limit=N` caps the number of results — useful for homepage sections (e.g., "show top 3 featured projects").

---

### 12.3 Get Public Experience

```
GET /v1/:userId/experience
Query: ?limit=N (optional, returns all if omitted)
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Senior Developer",
      "company": "Acme Inc.",
      "location": "Remote",
      "durationFrom": "2024-01-01T00:00:00.000Z",
      "durationTo": null,
      "activeJob": true,
      "description": "...",
      "certificates": [
        { "name": "AWS Certified", "url": "...", "isActive": true }
      ],
      "skills": ["React", "Node.js"]
    }
  ],
  "error": null,
  "statusCode": 200
}
```

Certificates filtered to `isActive: true` only — inactive certificates are hidden from public.

---

### 12.4 Get Public Skills

```
GET /v1/:userId/skills
Query: ?limit=N (optional, returns all if omitted)
```

**Response 200:**
```json
{
  "success": true,
  "data": ["React", "TypeScript", "Node.js"],
  "error": null,
  "statusCode": 200
}
```

Flat string array — public consumers don't need IDs or timestamps.

---

### 12.5 Get Public Tags

```
GET /v1/:userId/tags
Query: ?limit=N (optional, returns all if omitted)
```

**Response 200:**
```json
{
  "success": true,
  "data": ["featured", "frontend", "backend"],
  "error": null,
  "statusCode": 200
}
```

Includes both system tags (if used) and user tags. Used by portfolio sites to render filter buttons.

---

### 12.6 Get Public Resume

```
GET /v1/:userId/resume
```

**Response 200:**
```json
{
  "success": true,
  "data": { "url": "https://res.cloudinary.com/.../resume.pdf" },
  "error": null,
  "statusCode": 200
}
```

---

## 13. RTK Query Slice Mapping

For frontend planning. Each slice corresponds to one backend module and uses tag-based cache invalidation.

| Slice | Tags it provides | Tags it invalidates on mutation |
|---|---|---|
| `authApi` | `Session` | `Session` (login, logout, signup) |
| `meApi` | `Me` | `Me` (update profile) |
| `skillsApi` | `Skills`, `Skill:id` | `Skills` (create, delete) |
| `tagsApi` | `Tags`, `Tag:id` | `Tags` |
| `projectsApi` | `Projects`, `Project:id` | `Projects` (also invalidates `Skills` and `Tags` on changes that affect references) |
| `experienceApi` | `Experience`, `Experience:id` | `Experience` |
| `resumeApi` | `Resume` | `Resume` |
| `adminApi` | `AdminUsers`, `AdminUser:id` | `AdminUsers` on delete |

---

## 14. Resolved Decisions

All previously open questions are now locked.

| # | Question | Resolution |
|---|---|---|
| 1 | Project `mediaUrl` upload flow | Generic `POST /api/v1/media/upload` — returns URL, frontend embeds in JSON payload |
| 2 | Experience certificate upload flow | Same generic `POST /api/v1/media/upload` — URL embedded in `certificates[]` array on create/update |
| 3 | Cookie expiry in response body | Not included — no "session expires in N days" UI needed |
| 4 | `?limit=N` on public API list endpoints | Supported on projects, experience, skills, tags — returns all if omitted |

---

*End of API Contracts v1.1 — fully locked*
