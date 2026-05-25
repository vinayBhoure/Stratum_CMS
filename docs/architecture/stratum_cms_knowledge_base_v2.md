# Stratum CMS — Project Knowledge Base v2.0

> **Purpose of this document**
> Authoritative, reusable project memory for Stratum CMS. Designed to be loaded into a future AI session (Claude Project Knowledge, ChatGPT Projects, etc.) so the project can be resumed without context loss.
>
> **Source of truth.** Where this document and any earlier draft (KB v1.0, SDLC docx, product-spec-doc.md, features.md, assumptions.md, risk.md) disagree, **this document wins.** Earlier docs are legacy.
>
> **Replaces:** KB v1.0 (which ended at HLD). v2.0 is LLD-complete.
> **Owner:** Vinay
> **Status:** HLD complete. LLD complete (schema, contracts, diagrams, folder structure). Phase 0 coding not yet started.
> **Working artifacts in repo (separate files):** `schema.prisma`, `seed.ts`, `api_contracts.md`

---

## Table of Contents

1. [Final Context Summary](#1-final-context-summary)
2. [Product Vision](#2-product-vision)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Identity & User Model](#5-identity--user-model)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Content Modules](#7-content-modules)
8. [Media Handling](#8-media-handling)
9. [Public API Design](#9-public-api-design)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [Database — Full Prisma Schema](#12-database--full-prisma-schema)
13. [API Contracts v1.1 — Complete](#13-api-contracts-v11--complete)
14. [Folder Structure](#14-folder-structure)
15. [Security](#15-security)
16. [Coding Standards & Quality](#16-coding-standards--quality)
17. [Phased Roadmap](#17-phased-roadmap)
18. [Decision Log](#18-decision-log)
19. [Open Questions / TODOs](#19-open-questions--todos)
20. [Rejected Approaches](#20-rejected-approaches)
21. [Glossary](#21-glossary)

---

## 1. Final Context Summary

> **For rapid AI re-context. Read this if nothing else.**

**Stratum CMS** is a developer-focused, API-first portfolio Content Management System. It provides:
1. A built-in React dashboard for users to manage portfolio content (projects, experience, skills, resume, tags, contact info).
2. Public REST APIs at `api.domain.com/v1/:userId/:section` so users fetch their content into their own portfolio frontends.

**Tech stack:** React + Vite + Tailwind + RTK Query + Zod (frontend); Node + Express + Prisma + PostgreSQL + Multer + Node Cache + Bcrypt + JWT (backend); Cloudinary for media; Vercel + Railway for hosting; GitHub Actions + Docker for CI/CD.

**Identity:** Two 1-to-1 tables — `auth` (email/password/role/name/emailVerified) and `user_information` (public profile). `userId` is an opaque **nanoid(12)** generated in the application layer, separate from email/name, used in public URLs.

**Auth:** Custom JWT in `httpOnly` cookies (`stratum_token`), 7-day lifetime; `secure + sameSite: none` in prod, lax/insecure in dev. Bcrypt for passwords. PostgreSQL blacklist table for logged-out tokens, cleaned daily. No forgot-password until Phase 7 (email infra).

**Content modules (Phase 3):** User Information, Experience (with `activeJob` flag + certificates JSON), Resume (single PDF, 1-per-user), Projects (no `redirectLink`), Tags (only on Projects; one system tag `featured`, seeded), Skills (canonical registry, referenced by Projects + Experience via junction tables, block-delete if in use).

**Media flow:** Client → `POST /api/v1/media/upload` (Multer) → Cloudinary → URL returned → frontend embeds URL in JSON body of project/experience create/update. Keeps content endpoints pure JSON. Resume has its own dedicated `POST /resume` for simplicity.

**Master Admin:** Role-flagged user, same JWT auth, same frontend app with role-gated routes. Can only **view + delete** users (no edit, no password reset, no impersonation).

**Public API:** `api.domain.com/v1/:userId/:section`, fully public, no auth, no rate limiting in MVP, standard `{success, data, error, statusCode}` envelope. Supports `?limit=N` on list endpoints. `?tag=X` filter on projects.

**API conventions:** Standard REST. PUT for updates in MVP, migrate to PATCH later. `/me` for current-user profile. `/admin/users` for master admin. Offset-based pagination `?page=1&limit=20`.

**12-phase roadmap:** Phase 0 setup → Phase 1 backend skeleton → Phase 2 auth → Phase 3 CRUD + media → Phase 4 public API → Phase 5 Master Admin → Phase 6 security → Deployment → Phase 7 polishing (email, Markdown rich text) → Phase 8 testing → Phase 9 security audit → Phase 10 Stripe billing → Phase 11 SaaS features (Path A: domains/themes on existing model) → Phase 12 premium features.

**Where we are now:** LLD complete. Phase 0 (project setup) starts next.

**Key constraints to remember:**
- Custom auth, not Clerk (Clerk is a Phase 7 maybe).
- Single profile per user; one user = one tenant (Path A locked).
- `userId` is opaque nanoid(12); never derive it from name/email.
- Tags are projects-only.
- Skills can't be deleted while referenced by Experience or Projects (DB-level RESTRICT + service-level pre-check).
- Rich text and email features are Phase 7, not earlier.
- Public API uses `userId` on `api.domain.com/v1/` subdomain.
- All `userId` foreign keys use `onDelete: Cascade` (hard delete user wipes everything).
- Junction tables use `Cascade` on parent (project/experience), `Restrict` on reference (skill/tag).

---

## 2. Product Vision

### 2.1 What Stratum CMS Is

Stratum CMS is a **developer-focused, API-first portfolio Content Management System**. It lets developers store, manage, and serve their portfolio content through:

1. A **built-in management dashboard** for creating and editing content.
2. **Public REST APIs** that the developer consumes from their own portfolio website.

The goal: eliminate the need for developers to build and maintain custom backends, admin panels, and databases just to keep their portfolio content fresh.

### 2.2 What Stratum CMS Is NOT

- **Not a portfolio template provider.** Users bring their own portfolio frontend. Stratum CMS does not generate or host portfolio sites.
- **Not a Clerk-based product.** Auth is custom-built. Clerk is under discussion only as a possible later integration.
- **Not multi-tenant in the "organizations/teams" sense.** Each user is their own tenant. No shared workspaces.

### 2.3 Target User

- Developers (junior-to-mid) who already have or are building a portfolio site.
- Comfortable consuming REST APIs from their frontend code.
- Want to update portfolio content without redeploying their site.

### 2.4 Core Value Proposition

> "Manage your portfolio content in a dashboard. Fetch it via a public API. No backend work required on your end."

---

## 3. High-Level Architecture

### 3.1 System Components

| Component | Role |
|---|---|
| **Frontend application** | Single React app. Contains user dashboard AND Master Admin section (role-gated routes). |
| **Backend API** | Node.js + Express. Handles auth, CRUD, media uploads, public read endpoints. |
| **PostgreSQL database** | Persistent storage. Accessed via Prisma ORM. |
| **Cloudinary** | External media storage. DB stores only URLs. |
| **Frontend hosting** | Vercel. |
| **Backend hosting** | Railway. |
| **CI/CD** | GitHub Actions. |
| **Containerization** | Docker. |

### 3.2 Component Interaction Flow

```
[ User's Browser ]
       |
       v
[ React Frontend (Vercel) ]  <-- dashboard + master admin views
       |
       | REST (httpOnly cookie with JWT)
       v
[ Express Backend (Railway) ]
       |       \
       |        \-- [ Multer ] -- HTTPS --> [ Cloudinary ]
       |                                          |
       |                                          v
       |                              URL returned, stored in DB
       v
[ PostgreSQL via Prisma ORM ]

Separate public read path:
[ Anyone's Browser / Portfolio Site ]
       |
       v
[ api.domain.com/v1/:userId/:section ]  <-- no auth, fully public
       |
       v
[ Express Backend ]
       |
       v
[ PostgreSQL via Prisma ORM ]
```

### 3.3 Deployment Architecture

- **Frontend:** Vercel free tier.
- **Backend:** Railway free tier.
- **Database:** PostgreSQL (Railway-hosted initially).
- **Media:** Cloudinary free tier.
- **CI/CD:** GitHub Actions runs lint + tests on PRs; merges to main deploy to staging; production is manual.
- **Domain split:** `api.domain.com` for backend; frontend lives elsewhere. This creates a **cross-domain** setup, which dictates the cookie strategy (see §6.3).

---

## 4. Tech Stack

### 4.1 Frontend
- **React** with **Vite**
- **Tailwind CSS**
- **Redux Toolkit Query (RTK Query)** — state management + data fetching
- **Zod** — schema validation
- **React Hot Toast** — notifications
- **React Forms** — form handling
- **React Icons** — icon library

### 4.2 Backend
- **Node.js + Express**
- **TypeScript** (strict mode)
- **PostgreSQL**
- **Prisma ORM**
- **Zod** — validation (mirrored frontend/backend)
- **Multer** — multipart form handling
- **Node Cache** — in-memory caching (NOT Redis)
- **JWT** — authentication tokens
- **Bcrypt** — password hashing
- **nanoid** — opaque `userId` generation (length 12)

### 4.3 DevOps / Utilities
- Git, Nodemon, Watch
- Health check route (required from Phase 0)

### 4.4 External Services
- **Cloudinary** — media storage
- **Vercel** — frontend hosting
- **Railway** — backend hosting
- **GitHub Actions** — CI/CD
- **Docker** — containerization
- **Resend** (Phase 7) — transactional email
- **Clerk** (Phase 7, undecided) — possible auth supplement
- **Stripe + RevenueCat** (Phase 10) — billing

---

## 5. Identity & User Model

### 5.1 Two-Table Identity Design

Stratum CMS uses **two independent tables** with a **1-to-1 relationship**:

| Auth Table | User Information Table |
|---|---|
| `userId` (nanoid(12) — primary key) | `userId` (FK → Auth, primary key — enforces 1-to-1) |
| `email` (login credential, unique) | `name` (public display name, editable) |
| `password` (Bcrypt-hashed) | `email` (public contact email, optional) |
| `name` (internal use) | `contactNumber` (JSON: countryCode + number) |
| `role` (user / masterAdmin) | `address` |
| `emailVerified` (default false) | `googleLocationLink` |
| `createdAt`, `updatedAt` | `socialMediaLinks` (JSON: linkedin, github, ...) |
| | `createdAt`, `updatedAt` |

### 5.2 Critical Properties

- **`userId` is opaque** — generated server-side via `nanoid(12)`. **Not** derived from email or name. **Cannot** be reverse-engineered.
- **Two `email` fields**, intentionally:
  - Auth `email` = login credential.
  - User Information `email` = public contact (shown on portfolio).
  - They can be different or the same.
- **Two `name` fields**, intentionally:
  - Auth `name` = internal ("Welcome back, Vinay").
  - User Information `name` = public display name. User can change freely.
- **One profile per user.** No multi-profile support.

### 5.3 User Roles

| Role | Description |
|---|---|
| `user` | Default. Manages their own content. |
| `masterAdmin` | Platform owner. View + delete users only. |

Role stored on the Auth row. Same JWT flow for both. Role flag drives frontend routing and backend authorization.

---

## 6. Authentication & Authorization

### 6.1 Auth Stack (Phase 2)

- **Custom-built** — no Clerk, no Auth0 in MVP.
- **JWT tokens** stored in **`httpOnly` cookies** named `stratum_token`.
- **7-day JWT lifetime.** Single token model in MVP. Will migrate to access + refresh in Phase 6/9.
- **Bcrypt** for password hashing.
- **PostgreSQL blacklist table** for invalidated tokens (post-logout). Every protected route checks if incoming JWT is in the blacklist.

### 6.2 Password Validation Rules (Zod, plaintext pre-hash)

- Minimum 8 characters
- Must include at least one uppercase letter
- Must include at least one lowercase letter
- Must include at least one number

### 6.3 Cookie Strategy

Frontend (Vercel) and backend (Railway) live on different domains → **cross-domain auth required**.

**Production:**
```javascript
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
```

**Development:**
```javascript
{
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
```

Frontend uses `credentials: 'include'` on all RTK Query fetches.

### 6.4 CSRF Considerations

`sameSite: 'none'` weakens CSRF protection. Compensating controls:
- **CORS strict** — only allow exact frontend origin, no wildcards.
- CSRF tokens deferred to Phase 6/9 unless state-changing GET endpoints are introduced (they shouldn't be).

### 6.5 Auth Capabilities by Phase

| Capability | Phase | Notes |
|---|---|---|
| Signup (email + password) | Phase 2 | |
| Login | Phase 2 | |
| Logout | Phase 2 | Token added to blacklist table |
| Protected routes | Phase 2 | Middleware verifies JWT + checks blacklist |
| Delete user | Phase 2 | **Hard delete with cascade** |
| Forgot password | **Phase 7** | Requires email infra |
| Email verification | **Phase 7** | Column already exists; default `false` |
| Login/logout notifications | **Phase 7** | |

### 6.6 emailVerified Strategy

Column added now with `default(false)`. In Phase 2, the column is unused. In Phase 7, verification middleware flips on. New signups go through verification; Phase 2 users get a "please verify" prompt on next login post-Phase 7. **No retroactive cleanup needed.**

### 6.7 Master Admin Authorization

Same JWT system; role check on protected admin routes.

Master Admin can:
- ✅ View users
- ✅ Delete users
- ❌ Edit user content
- ❌ Reset user passwords
- ❌ Impersonate users

These restrictions are enforced by **absence of endpoints**, not runtime checks.

### 6.8 Blacklist Cleanup

Daily scheduled job in `/jobs/blacklistCleanup.ts` deletes entries where `createdAt < NOW() - 7 days`. Safe because those tokens are already expired.

---

## 7. Content Modules

All modules are **scoped per user**. Master Admin sees the user list but does not edit content.

### 7.1 User Information

Public profile data. 1-to-1 with Auth.

Fields:
- `name` — public display name (required)
- `email` — public contact email (optional)
- `contactNumber` — JSON: `{ countryCode, number }`
- `address`
- `googleLocationLink`
- `socialMediaLinks` — JSON: `{ linkedin?, github?, twitter?, instagram?, ... }`

### 7.2 Experience

```json
{
  "title": "Senior Developer",
  "company": "Acme Inc.",
  "location": "Remote",
  "durationFrom": "2024-01-01T00:00:00.000Z",
  "durationTo": null,
  "activeJob": true,
  "description": "...",
  "certificates": [
    {
      "name": "AWS Certified",
      "url": "https://res.cloudinary.com/.../cert.pdf",
      "updatedAt": "2024-06-15T00:00:00.000Z",
      "isActive": true
    }
  ],
  "skillIds": ["Sk1...", "Sk2..."]
}
```

**Critical rule — `activeJob` controls `durationTo` nullability:**
- `activeJob = true` → `durationTo` MUST be null ("currently working here")
- `activeJob = false` → `durationTo` MUST be provided and after `durationFrom`

This is enforced via Zod `.refine()` on the frontend AND in `ExperienceService.create/update` on the backend. Prisma cannot enforce conditional constraints at the DB level.

**Certificates:** JSON array column on Experience. `updatedAt` and `isActive` defaults are enforced in `ExperienceService` (Prisma cannot default fields inside JSON). On public reads, only `isActive: true` certificates are returned.

`description` is plain text in Phase 3, Markdown from Phase 7.

`skillIds` references the Skills module via junction table (`ExperienceSkill`).

### 7.3 Resume

- **Single PDF per user.** No multi-resume in MVP (deferred to future).
- Uploaded via dedicated `POST /resume` endpoint (NOT the generic `/media/upload`).
- DB stores Cloudinary URL.
- On replace, old Cloudinary asset is deleted.
- Preview feature is future scope.

### 7.4 Projects

```json
{
  "title": "Portfolio Site",
  "description": "...",
  "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
  "githubLink": "https://github.com/vinay/portfolio",
  "liveLink": "https://vinay.dev",
  "skillIds": ["Sk1...", "Sk2..."],
  "tagIds": ["Tg1...", "Tg2..."]
}
```

- ⚠️ No `redirectLink` (removed per D5).
- `description` plain text in Phase 3, Markdown from Phase 7.
- `mediaUrl` — image or video Cloudinary URL.
- Skills via `ProjectSkill` junction. Tags via `ProjectTag` junction.

### 7.5 Tags

**Purpose:** project categorization for filter buttons on the public portfolio.

**Rules:**
- **Projects-only.** No other module uses tags.
- **System tag `featured`** seeded once. `userId = null`, `isSystem = true`. Cannot be deleted by users. Can be applied by any user to their projects.
- All other tags are **user-created, private** to that user.
- ⚠️ The `pinned` system tag was dropped (D6). Only `featured` remains.

### 7.6 Skills

Standalone per-user registry. Canonical source.

- Users add, edit, delete skills.
- Referenced by Experience AND Projects via separate junction tables.
- **Block-delete rule:** A skill cannot be deleted while referenced by any Experience or Project. The system returns the list of references; the user must clear them first.
- Enforced at two levels:
  - **Service layer:** `SkillsService.delete()` pre-checks junctions and throws `SKILL_IN_USE` with `referencedBy` details.
  - **DB layer:** Junction tables use `onDelete: Restrict` on `skillId` as a defensive backstop.

### 7.7 Future Modules (Post-MVP, Not in Phase 3)

- Blogs
- FAQ
- Services
- Banner
- Testimonials

Explicitly deferred. Schemas not designed.

---

## 8. Media Handling

### 8.1 Supported Types

| Type | Used By | Max Size |
|---|---|---|
| PDF | Resume, Experience certificates | 5 MB |
| Image (jpg/png/webp) | Project `mediaUrl`, profile assets | 5 MB |
| Video (mp4/webm) | Project `mediaUrl` only | 50 MB |

**Videos are not a standalone module.** They are media attached to projects.

### 8.2 Generic Upload Endpoint

`POST /api/v1/media/upload` serves all media use cases except Resume:
- Project `mediaUrl` (image/video)
- Experience certificates (PDF)

**Flow:**
1. Frontend uploads file via multipart to `/media/upload`
2. Server validates MIME + size, uploads to Cloudinary
3. Server returns hosted URL
4. Frontend embeds URL in JSON body of subsequent project/experience create/update call

This keeps content endpoints **pure JSON** — no mixed multipart payloads.

### 8.3 Resume Upload — Dedicated Endpoint

Resume uses its own `POST /api/v1/resume` (not `/media/upload`) because the flow is simpler (one file, no embed-in-other-content step).

### 8.4 Cleanup on Replace

When a resume is replaced, the old Cloudinary asset is deleted before the new URL is stored.

For projects and experience, the cleanup story (deleting Cloudinary assets when content is deleted) is **still open** (see §19).

---

## 9. Public API Design

### 9.1 URL Pattern

```
api.domain.com/v1/:userId/:section
```

Examples:
- `api.domain.com/v1/abc123xyz/projects`
- `api.domain.com/v1/abc123xyz/experience`
- `api.domain.com/v1/abc123xyz/skills`
- `api.domain.com/v1/abc123xyz/tags`
- `api.domain.com/v1/abc123xyz/resume`
- `api.domain.com/v1/abc123xyz/user-info`

### 9.2 Properties

- **Identifier:** opaque `userId` (nanoid 12). Not username or email.
- **Authentication:** none.
- **Method:** GET only.
- **Rate limiting:** none in MVP. Deferred.
- **Versioned:** `/v1/` prefix included for future-proofing.
- **Optional query params:** `?limit=N` on list endpoints, `?tag=X` filter on projects.
- **Payload shape:** flattened — skills/tags are returned as string arrays (no internal IDs leaked).

### 9.3 Response Envelope

Same envelope as private API. Two specific responses:

**User not found:**
```json
{ "success": false, "data": null, "error": { "code": "USER_NOT_FOUND", "message": "no user found" }, "statusCode": 404 }
```

**Empty resource for valid user:**
```json
{ "success": true, "data": null, "error": { "code": "NO_DATA", "message": "no data present for this user" }, "statusCode": 200 }
```

### 9.4 Caching

Public API responses cached via Node Cache (TTL value TBD in implementation — see §19).

---

## 10. Frontend Architecture

### 10.1 Single Frontend App, Role-Gated

One React frontend application contains:
- **User Dashboard** — visible to all logged-in users.
- **Master Admin Section** — separate routes/components, role-gated. Same app.

### 10.2 State Management

- **Redux Toolkit Query (RTK Query)** for all server state.
- Tag-based cache invalidation.

### 10.3 RTK Query Slice Mapping

| Slice | Tags Provided | Tags Invalidated On Mutation |
|---|---|---|
| `authApi` | `Session` | `Session` (login, logout, signup) |
| `meApi` | `Me` | `Me` |
| `skillsApi` | `Skills`, `Skill:id` | `Skills` |
| `tagsApi` | `Tags`, `Tag:id` | `Tags` |
| `projectsApi` | `Projects`, `Project:id` | `Projects` (also `Skills`/`Tags` on reference changes) |
| `experienceApi` | `Experience`, `Experience:id` | `Experience` |
| `resumeApi` | `Resume` | `Resume` |
| `adminApi` | `AdminUsers`, `AdminUser:id` | `AdminUsers` |

### 10.4 Validation

- **Zod schemas** on the frontend, mirroring backend Zod schemas. Single source of shape truth.

### 10.5 UI Library Stack

- Tailwind CSS
- React Hot Toast
- React Icons
- React Forms

### 10.6 Routing Strategy

- Public routes: `/`, `/login`, `/signup`, `/onboarding`
- Authenticated routes: `/dashboard/*` (protected by `ProtectedRoute`)
- Master admin routes: `/admin/*` (protected by `ProtectedRoute` + `RoleGate`)

---

## 11. Backend Architecture

### 11.1 Layered Architecture

Three primary layers:

1. **Controllers** — HTTP layer. Parse `req`, call service, return envelope. Thin.
2. **Services** — Business logic. Talk to Prisma, MediaService, CacheService. Reusable.
3. **Shared services** — Singletons used across domains: `PrismaService`, `MediaService`, `CacheService`.

**Separation rationale:** Single Responsibility Principle. Controllers handle HTTP concerns only; services contain reusable business logic. Easier to test, easier to share logic across controllers.

### 11.2 Module Map (Class Structure)

#### Controllers (each pairs with a service)
- `AuthController` ↔ `AuthService`
- `UserInformationController` ↔ `UserInformationService`
- `ProjectsController` ↔ `ProjectsService`
- `ExperienceController` ↔ `ExperienceService`
- `SkillsController` ↔ `SkillsService`
- `TagsController` ↔ `TagsService`
- `ResumeController` ↔ `ResumeService`
- `MasterAdminController` ↔ `MasterAdminService`
- `PublicAPIController` ↔ `PublicAPIService`

#### Shared services
- `PrismaService` — Prisma client singleton
- `MediaService` — Multer + Cloudinary wrapper (shared by Projects, Experience, Resume)
- `CacheService` — Node Cache wrapper (used by ProjectsService, PublicAPIService)

#### Middleware
- `AuthMiddleware` — JWT verify + blacklist check
- `RoleMiddleware` — Master admin gate
- `ValidateMiddleware` — Runs Zod schemas
- `UploadMiddleware` — Multer config for file routes
- `ErrorMiddleware` — Global error handler

#### Utilities
- `asyncHandler` — wraps async controllers, eliminates try/catch
- `ApiError` — custom error class with `statusCode`, `code`, `message`, `details`
- `ResponseEnvelope` — standard `{success, data, error, statusCode}` shape
- `JwtUtil` — sign + verify helpers
- `BcryptUtil` — hash + compare helpers
- `NanoIdUtil` — `userId` generator (length 12)

#### Jobs
- `BlacklistCleanupJob` — daily cleanup

### 11.3 Request Lifecycle (Middleware Chain)

```
Incoming request
       ↓
Body parser (JSON + multipart)
       ↓
Zod validator (ValidateMiddleware)
       ↓
AuthMiddleware (JWT verify + blacklist check) — if protected
       ↓
RoleMiddleware (master admin gate) — if admin route
       ↓
asyncHandler-wrapped Controller
       ↓
Service (business logic)
       ↓
Shared services (Prisma / Cache / Media)
       ↓
Response envelope returned

Errors at any layer → Global Error Handler → formatted envelope response
```

### 11.4 Conventions

- **`asyncHandler` utility** wraps async route handlers to centralize error capture (eliminates try/catch in controllers).
- **Global error handler** middleware formats all errors as the standard envelope.
- **Body parser / JSON parser** at the app level.
- **Dummy controllers with real names** scaffolded in Phase 1 before logic exists.
- **SOLID principles** applied where reasonable.

### 11.5 Caching Strategy

- **Node Cache** (in-memory). NOT Redis.
- `ProjectsService` caches per-user project lists.
- `PublicAPIService` caches public reads.
- Cache invalidation on relevant mutations.
- Specific cache keys, TTLs: implementation-time decision.

---

## 12. Database — Full Prisma Schema

**File:** `/server/prisma/schema.prisma`

```prisma
// ============================================================================
// Stratum CMS — Prisma Schema
// ----------------------------------------------------------------------------
// All userIds are nanoid(12) — opaque, non-enumerable. Generated in application
// layer (not by Prisma) to keep length consistent.
// ============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum Role {
  user
  masterAdmin
}

// ============================================================================
// AUTH — login credentials, role, verification status
// userId is the canonical user identifier across the entire system.
// Generated in app code via nanoid(12), not by Prisma.
// `email` here is the LOGIN credential. Public contact email lives in
// UserInformation.email — they may differ.
// ============================================================================

model Auth {
  userId        String   @id @db.VarChar(12)
  email         String   @unique
  password      String   // bcrypt hash
  name          String   // internal display ("Welcome back, X")
  role          Role     @default(user)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userInformation UserInformation?
  resume          Resume?
  skills          Skill[]
  tags            Tag[]
  projects        Project[]
  experiences     Experience[]

  @@index([email])
  @@map("auth")
}

// ============================================================================
// TOKEN BLACKLIST — invalidated JWTs (post-logout)
// Every protected route checks here. Entries older than 7 days cleaned by job.
// ============================================================================

model TokenBlacklist {
  id        String   @id @default(cuid())
  token     String   @unique
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@map("token_blacklist")
}

// ============================================================================
// USER INFORMATION — public profile (1-to-1 with Auth)
// The email here is the PUBLIC contact email. Distinct from Auth.email (login).
// JSON for contactNumber/socialMediaLinks because they're open-ended.
// ============================================================================

model UserInformation {
  userId             String   @id @db.VarChar(12)
  name               String
  email              String?
  contactNumber      Json?    // { countryCode: string, number: string }
  address            String?
  googleLocationLink String?
  socialMediaLinks   Json?    // { linkedin?, github?, twitter?, instagram?, ... }
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  auth Auth @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@map("user_information")
}

// ============================================================================
// SKILLS — canonical per-user registry
// Block-delete enforced in SkillsService by checking junction tables before
// allowing deletion. DB-level Restrict on junctions provides backstop.
// ============================================================================

model Skill {
  id        String   @id @db.VarChar(12)
  userId    String   @db.VarChar(12)
  skill     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auth              Auth               @relation(fields: [userId], references: [userId], onDelete: Cascade)
  projectSkills     ProjectSkill[]
  experienceSkills  ExperienceSkill[]

  @@unique([userId, skill])
  @@index([userId])
  @@map("skills")
}

// ============================================================================
// TAGS — system + user tags
// userId IS NULL means system tag (e.g., "featured", seeded once).
// Users can apply system tags to their projects but cannot delete them.
// ============================================================================

model Tag {
  id        String   @id @db.VarChar(12)
  userId    String?  @db.VarChar(12) // null = system tag
  name      String
  isSystem  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auth        Auth?         @relation(fields: [userId], references: [userId], onDelete: Cascade)
  projectTags ProjectTag[]

  @@unique([userId, name])
  @@index([userId])
  @@map("tags")
}

// ============================================================================
// PROJECTS
// `description` is plain text in Phase 3, Markdown from Phase 7.
// `mediaUrl` is a single Cloudinary URL (image or video).
// NO `redirectLink` field (removed per D5).
// ============================================================================

model Project {
  id          String   @id @db.VarChar(12)
  userId      String   @db.VarChar(12)
  title       String
  description String?  @db.Text
  mediaUrl    String?
  githubLink  String?
  liveLink    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  auth          Auth           @relation(fields: [userId], references: [userId], onDelete: Cascade)
  projectSkills ProjectSkill[]
  projectTags   ProjectTag[]

  @@index([userId])
  @@map("projects")
}

// ============================================================================
// PROJECT_SKILLS — junction
// Cascade on projectId, Restrict on skillId (enforces block-delete).
// ============================================================================

model ProjectSkill {
  projectId String @db.VarChar(12)
  skillId   String @db.VarChar(12)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  skill   Skill   @relation(fields: [skillId], references: [id], onDelete: Restrict)

  @@id([projectId, skillId])
  @@index([skillId])
  @@map("project_skills")
}

// ============================================================================
// PROJECT_TAGS — junction
// Same cascade pattern. System tags protected from deletion at service layer.
// ============================================================================

model ProjectTag {
  projectId String @db.VarChar(12)
  tagId     String @db.VarChar(12)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Restrict)

  @@id([projectId, tagId])
  @@index([tagId])
  @@map("project_tags")
}

// ============================================================================
// EXPERIENCE
// activeJob drives durationTo nullability logic — enforced in ExperienceService.
// Certificates stored as JSON array: { name, url, updatedAt, isActive }.
// ============================================================================

model Experience {
  id           String    @id @db.VarChar(12)
  userId       String    @db.VarChar(12)
  title        String
  company      String
  location     String?
  durationFrom DateTime
  durationTo   DateTime? // null only when activeJob = true
  activeJob    Boolean   @default(false)
  description  String?   @db.Text
  certificates Json      @default("[]")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  auth             Auth              @relation(fields: [userId], references: [userId], onDelete: Cascade)
  experienceSkills ExperienceSkill[]

  @@index([userId])
  @@map("experience")
}

// ============================================================================
// EXPERIENCE_SKILLS — junction
// Cascade on experienceId, Restrict on skillId.
// ============================================================================

model ExperienceSkill {
  experienceId String @db.VarChar(12)
  skillId      String @db.VarChar(12)

  experience Experience @relation(fields: [experienceId], references: [id], onDelete: Cascade)
  skill      Skill      @relation(fields: [skillId], references: [id], onDelete: Restrict)

  @@id([experienceId, skillId])
  @@index([skillId])
  @@map("experience_skills")
}

// ============================================================================
// RESUME — 1-to-1 with Auth (optional)
// userId is BOTH primary key AND foreign key — guarantees one resume per user.
// ============================================================================

model Resume {
  userId    String   @id @db.VarChar(12)
  url       String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auth Auth @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@map("resume")
}
```

### 12.1 Schema Summary

**11 models:**
- Identity & auth: `Auth`, `TokenBlacklist`, `UserInformation`
- Content: `Skill`, `Tag`, `Project`, `Experience`, `Resume`
- Junctions: `ProjectSkill`, `ProjectTag`, `ExperienceSkill`

**Blanket rules:**
- `createdAt` + `updatedAt` on every model.
- Every FK to `userId` uses `onDelete: Cascade` (hard delete user wipes everything).
- All `userId` columns are `VarChar(12)` (nanoid length).
- Indexes on every `userId` FK + unique on `Auth.email`.

**Cascade strategy:**
- Auth → owned tables: Cascade.
- Junctions → parent (project/experience): Cascade.
- Junctions → reference (skill/tag): **Restrict** — DB-level block-delete enforcement.

### 12.2 Seed File

**File:** `/server/prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  12
);

async function main() {
  const existing = await prisma.tag.findFirst({
    where: { userId: null, name: "featured" },
  });

  if (!existing) {
    await prisma.tag.create({
      data: {
        id: nanoid(),
        userId: null,
        name: "featured",
        isSystem: true,
      },
    });
    console.log("✓ Seeded system tag: featured");
  } else {
    console.log("→ System tag 'featured' already exists, skipping");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

Run via `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### 12.3 Migration Commands

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 13. API Contracts v1.1 — Complete

**File:** `/server/docs/api_contracts.md`

### 13.1 Base URLs

| Surface | Base URL |
|---|---|
| Authenticated / private API | `https://api.domain.com/api/v1` |
| Public API (no auth) | `https://api.domain.com/v1` |

### 13.2 Response Envelope

```json
{ "success": true, "data": { }, "error": null, "statusCode": 200 }
```

```json
{
  "success": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "...", "details": { } },
  "statusCode": 400
}
```

### 13.3 Auth Levels

| Level | Description |
|---|---|
| `public` | No auth required |
| `authenticated` | Any logged-in user |
| `masterAdmin` | Role check enforced |

### 13.4 Pagination (Offset-Based)

Applied to all list endpoints. Query params: `page` (default 1), `limit` (default 20, max 100).

Response shape adds:
```json
"pagination": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
```

### 13.5 Error Code Catalogue

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Zod rejected request |
| `INVALID_DURATION` | 400 | Experience activeJob/durationTo mismatch |
| `INVALID_REFERENCE` | 400 | skillIds or tagIds reference non-existent/non-owned records |
| `INVALID_FILE` | 400 | Wrong MIME or oversized upload |
| `UNAUTHENTICATED` | 401 | Missing/invalid JWT |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `INVALID_TOKEN` | 401 | JWT malformed/expired |
| `TOKEN_REVOKED` | 401 | JWT in blacklist |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource missing |
| `USER_NOT_FOUND` | 404 | Public API: userId missing |
| `EMAIL_EXISTS` | 409 | Signup duplicate email |
| `SKILL_IN_USE` | 409 | Skill referenced — block delete |
| `TAG_IN_USE` | 409 | Tag referenced — block delete |
| `SYSTEM_TAG_PROTECTED` | 409 | Cannot delete system tag |
| `EMAIL_NOT_VERIFIED` | 403 | (Phase 7) Verification required |
| `INTERNAL_ERROR` | 500 | Unexpected |

### 13.6 Endpoint Catalogue

#### Auth — `/api/v1/auth`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Create account |
| POST | `/auth/login` | public | Login, set cookie |
| POST | `/auth/logout` | authenticated | Blacklist token, clear cookie |
| DELETE | `/auth/account` | authenticated | Hard delete account (re-prompts password) |
| GET | `/auth/session` | authenticated | Get current session details (for FE rehydrate) |

Phase 7 deferred:
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`

#### User Information — `/api/v1/me`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/me` | authenticated | Get my profile |
| PUT | `/me` | authenticated | Replace my profile (full PUT semantics) |

#### Skills — `/api/v1/skills`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/skills` | authenticated | List my skills |
| POST | `/skills` | authenticated | Create skill |
| PUT | `/skills/:skillId` | authenticated | Update skill |
| DELETE | `/skills/:skillId` | authenticated | Delete (block-delete if referenced) |

#### Tags — `/api/v1/tags`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/tags` | authenticated | List user tags + system tags |
| POST | `/tags` | authenticated | Create user tag |
| PUT | `/tags/:tagId` | authenticated | Update (system tags protected) |
| DELETE | `/tags/:tagId` | authenticated | Delete (block-delete + system protect) |

#### Projects — `/api/v1/projects`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/projects` | authenticated | List my projects (paginated) |
| GET | `/projects/:projectId` | authenticated | Get one |
| POST | `/projects` | authenticated | Create (skillIds[]/tagIds[] embedded) |
| PUT | `/projects/:projectId` | authenticated | Replace |
| DELETE | `/projects/:projectId` | authenticated | Delete (cascades junctions) |

#### Experience — `/api/v1/experience`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/experience` | authenticated | List |
| GET | `/experience/:experienceId` | authenticated | Get one |
| POST | `/experience` | authenticated | Create (validates activeJob ↔ durationTo) |
| PUT | `/experience/:experienceId` | authenticated | Replace |
| DELETE | `/experience/:experienceId` | authenticated | Delete |

#### Resume — `/api/v1/resume`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/resume` | authenticated | Get my resume (data: null if none) |
| POST | `/resume` | authenticated | Upload PDF (multipart, deletes old asset) |
| DELETE | `/resume` | authenticated | Delete |

#### Media Upload — `/api/v1/media`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/media/upload` | authenticated | Generic upload for project media + experience certificates |

Form fields: `file`, `type` (`image` / `video` / `pdf`). Returns Cloudinary URL.

#### Master Admin — `/api/v1/admin`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/users` | masterAdmin | List all users (paginated, searchable) |
| GET | `/admin/users/:userId` | masterAdmin | Get user detail + content counts |
| DELETE | `/admin/users/:userId` | masterAdmin | Hard delete user (cascade) |

#### Public API — `/v1/:userId/`
| Method | Path | Auth | Query Params |
|---|---|---|---|
| GET | `/v1/:userId/user-info` | public | — |
| GET | `/v1/:userId/projects` | public | `?tag=X`, `?limit=N` |
| GET | `/v1/:userId/experience` | public | `?limit=N` |
| GET | `/v1/:userId/skills` | public | `?limit=N` |
| GET | `/v1/:userId/tags` | public | `?limit=N` |
| GET | `/v1/:userId/resume` | public | — |

### 13.7 Key Contract Behaviors

**Project create/update payload embeds `skillIds[]` and `tagIds[]`** — atomic transaction. Service validates all references belong to caller (or system tags), inserts junction rows, all in one DB transaction.

**Block-delete error includes `referencedBy` details:**
```json
{
  "error": {
    "code": "SKILL_IN_USE",
    "details": {
      "referencedBy": {
        "experiences": [{ "id": "...", "title": "..." }],
        "projects": [{ "id": "...", "title": "..." }]
      }
    }
  }
}
```

**Public API payloads are flattened** — skills/tags returned as string arrays, no IDs leaked. Inactive certificates filtered out.

**Master Admin restrictions enforced by absence** — no PUT/PATCH endpoints exist on `/admin/users/:id`.

**REST conventions** — PUT for updates in MVP, will migrate to PATCH post-deployment.

### 13.8 Locked Conventions Summary

1. ✅ PUT for updates (PATCH later)
2. ✅ `/me` for user information (not `/user-information`)
3. ✅ Single resume per user (multi-resume deferred)
4. ✅ `skillIds[]` / `tagIds[]` embedded in project payloads
5. ✅ `/admin/users` for master admin
6. ✅ Offset-based pagination `?page=1&limit=20`
7. ✅ Cookies: `httpOnly + secure + sameSite: 'none'` (prod), `lax + insecure` (dev)
8. ✅ Public API versioned: `api.domain.com/v1/:userId/...`
9. ✅ Generic `/media/upload` for project media + experience certificates
10. ✅ No cookie expiry in response body
11. ✅ `?limit=N` on public list endpoints

---

## 14. Folder Structure

### 14.1 Backend (`/server`)

```
/server
├── /prisma
│   ├── schema.prisma
│   ├── seed.ts
│   └── /migrations
├── /src
│   ├── /config
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   ├── cloudinary.ts
│   │   └── cache.ts
│   ├── /controllers
│   │   ├── auth.controller.ts
│   │   ├── userInformation.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── experience.controller.ts
│   │   ├── skills.controller.ts
│   │   ├── tags.controller.ts
│   │   ├── resume.controller.ts
│   │   ├── media.controller.ts
│   │   ├── masterAdmin.controller.ts
│   │   └── publicApi.controller.ts
│   ├── /services
│   │   ├── auth.service.ts
│   │   ├── userInformation.service.ts
│   │   ├── projects.service.ts
│   │   ├── experience.service.ts
│   │   ├── skills.service.ts
│   │   ├── tags.service.ts
│   │   ├── resume.service.ts
│   │   ├── masterAdmin.service.ts
│   │   ├── publicApi.service.ts
│   │   ├── media.service.ts
│   │   └── cache.service.ts
│   ├── /routes
│   │   ├── auth.routes.ts
│   │   ├── userInformation.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── experience.routes.ts
│   │   ├── skills.routes.ts
│   │   ├── tags.routes.ts
│   │   ├── resume.routes.ts
│   │   ├── media.routes.ts
│   │   ├── masterAdmin.routes.ts
│   │   ├── publicApi.routes.ts
│   │   └── index.ts
│   ├── /middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── /validators
│   │   ├── auth.schema.ts
│   │   ├── userInformation.schema.ts
│   │   ├── projects.schema.ts
│   │   ├── experience.schema.ts
│   │   ├── skills.schema.ts
│   │   ├── tags.schema.ts
│   │   └── resume.schema.ts
│   ├── /utils
│   │   ├── asyncHandler.ts
│   │   ├── responseEnvelope.ts
│   │   ├── apiError.ts
│   │   ├── nanoId.ts
│   │   ├── jwt.ts
│   │   └── bcrypt.ts
│   ├── /types
│   │   ├── express.d.ts
│   │   └── shared.types.ts
│   ├── /jobs
│   │   └── blacklistCleanup.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### 14.2 Frontend (`/client`)

```
/client
├── /public
│   └── favicon.ico
├── /src
│   ├── /assets
│   ├── /config
│   │   └── env.ts
│   ├── /redux
│   │   ├── store.ts
│   │   └── /api
│   │       ├── baseApi.ts
│   │       ├── auth.api.ts
│   │       ├── me.api.ts
│   │       ├── projects.api.ts
│   │       ├── experience.api.ts
│   │       ├── skills.api.ts
│   │       ├── tags.api.ts
│   │       ├── resume.api.ts
│   │       └── masterAdmin.api.ts
│   ├── /pages
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Onboarding.tsx
│   │   └── NotFound.tsx
│   ├── /dashboard
│   │   ├── /pages
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── ProjectsManager.tsx
│   │   │   ├── ExperienceManager.tsx
│   │   │   ├── SkillsManager.tsx
│   │   │   ├── TagsManager.tsx
│   │   │   └── ResumeManager.tsx
│   │   ├── /components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── SkillPicker.tsx
│   │   │   └── MediaUploader.tsx
│   │   └── /utils
│   ├── /admin
│   │   ├── /pages
│   │   │   ├── AdminHome.tsx
│   │   │   └── UsersList.tsx
│   │   └── /components
│   │       └── UserRow.tsx
│   ├── /components
│   │   ├── /ui
│   │   ├── /layout
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGate.tsx
│   ├── /validators
│   │   ├── auth.schema.ts
│   │   ├── userInformation.schema.ts
│   │   ├── projects.schema.ts
│   │   ├── experience.schema.ts
│   │   ├── skills.schema.ts
│   │   ├── tags.schema.ts
│   │   └── resume.schema.ts
│   ├── /hooks
│   ├── /utils
│   ├── /types
│   ├── /routes
│   │   └── AppRoutes.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 14.3 Key Conventions

- **One file per domain** across controllers, services, routes, validators.
- **All shared infrastructure** under `/config` and `/services` — never inlined.
- **`/jobs`** reserved for scheduled work.
- **Frontend `/validators`** mirrors backend Zod schemas exactly.
- **`/dashboard` and `/admin`** are sibling top-level sections — role-gated via `ProtectedRoute` + `RoleGate`.

---

## 15. Security

### 15.1 MVP Security Baseline

- Bcrypt password hashing.
- JWT in `httpOnly` cookies (XSS-resistant token storage).
- JWT blacklist table for logout invalidation.
- Prisma parameterized queries (SQL injection protection).
- Zod input validation on every endpoint.
- CORS restricted to known frontend origin (strict, no wildcards).
- Environment variables for secrets, never committed.
- DB-level `Restrict` on junction skill/tag references as defensive backstop.

### 15.2 Phase 6 — Security Enhancements

- **"Database query optimization"** in this project's vocabulary means **SQL-injection-safe query construction**, not performance tuning. Prisma handles most; phase verifies it.
- **"Malware / injection prevention"** = combined coverage of SQL injection, XSS, file-upload validation.
- Protected routes audit.
- Middleware protection review.

### 15.3 Known Future Risks

| Risk | Mitigation | Phase |
|---|---|---|
| Public API enables data scraping | None in MVP. Rate limiting deferred. | Post-MVP |
| XSS via rich text (when introduced) | Backend sanitization (DOMPurify-style) | Phase 7 |
| Malicious file uploads | Cloudinary validation + MIME check + size cap | Phase 3 |
| Cloudinary bandwidth overage | Client-side compression, monitoring | Phase 3+ |
| Auth token compromise | Short-lived JWTs (Phase 6/9), blacklist on logout | Phase 2 |
| Single-instance backend = SPOF | Auto-restart, daily DB snapshots, health checks | Phase 6+ |
| Clerk outage (if integrated) | Email login fallback | Phase 7 |
| CSRF (sameSite none) | Strict CORS; CSRF tokens if payments enter scope | Phase 10 |

---

## 16. Coding Standards & Quality

### 16.1 Required Standards

- **TypeScript strict mode** across frontend and backend.
- ESLint + Prettier on pre-commit.
- **No `any` types.**
- **Prisma-generated types** as the source of truth for data shapes.
- **Zod schemas** mirrored on both sides where applicable.
- **CamelCase** naming convention (KB confirmed).
- Explanation of code logic provided before writing code (project workflow).

### 16.2 Architectural Patterns

- **Controller-Service separation** strictly enforced.
- **`asyncHandler` utility** — eliminates try/catch blocks in controllers.
- **Global error handler** formats all errors as the standard envelope.
- **SOLID principles** applied where reasonable.

### 16.3 Testing (Phase 8)

Deferred to a dedicated phase.
- Unit tests
- Integration tests
- Automated tests in CI

⚠️ Specific framework (Jest vs Vitest) and coverage targets **not yet decided.**

---

## 17. Phased Roadmap

12 phases, executed sequentially. Each phase is independently shippable.

| Phase | Name | Scope |
|---|---|---|
| 0 | Project Setup | Separate FE/BE repos, CORS, health check route, FE↔BE integration verified locally |
| 1 | Core Backend Structure | Body parser, global error handler, `asyncHandler`, dummy controllers, routes scaffolded, middleware placeholders |
| 2 | Authentication System | Signup, login, logout, JWT in httpOnly cookies, Bcrypt, blacklist table, hard delete user with cascade. **No forgot-password yet.** |
| 3 | CRUD Functionality | All content modules (UserInfo, Experience, Resume, Projects, Tags, Skills) + Media (Multer → Cloudinary) |
| 4 | Public API | Read-only public endpoints under `api.domain.com/v1/:userId/:section` |
| 5 | Master Admin Panel | Same FE app, separate routes, role-gated. View + delete users |
| 6 | Security Enhancements | Route protection audit, middleware hardening, SQL injection-safe query review, injection/XSS/file-upload review |
| — | Deployment | GitHub Actions pipelines, Dockerfiles, Vercel + Railway free tiers |
| 7 | Product Polishing | Email features (Resend), Markdown rich text storage, media preview, Clerk decision |
| 8 | Testing | Unit, integration, automated. Framework choice pending |
| 9 | Security Review | Full audit, vulnerability scan, auth review, API protection review |
| 10 | Pricing Model | Stripe + RevenueCat. Subscription tiers |
| 11 | SaaS Level Introduction | **Path A confirmed.** Custom domains, themes, higher tiers on top of existing single-user-per-tenant model. **No `tenantId` column needed.** |
| 12 | Premium Features | TBD |

---

## 18. Decision Log

### 18.1 HLD Decisions (from v1.0, preserved)

| # | Decision | Rationale |
|---|---|---|
| D1 | Custom JWT auth, not Clerk | Cost, control, learning value. Clerk reconsidered in Phase 7. |
| D2 | JWT in httpOnly cookies | XSS-resistant. |
| D3 | PostgreSQL blacklist table for logout | Survives restarts; Node Cache wouldn't. |
| D4 | Hard delete with cascade for user removal | Simpler model. |
| D5 | Remove `redirectLink` from Projects | Added in error. |
| D6 | Drop `pinned` system tag; keep only `featured` | Redundant. |
| D7 | Tags used only on Projects | Other modules don't need categorization. |
| D8 | Skills module is canonical; Experience links via dropdown | Avoids duplicate skill strings. |
| D9 | Block-delete skills referenced in Experience | Prevents broken refs. |
| D10 | One profile per user | Simpler product. |
| D11 | Auth and User Information are independent 1-to-1 tables | Login email vs public contact email. |
| D12 | `userId` is opaque, not derived from name/email | Prevents enumeration. |
| D13 | Public API uses `userId`, not username | Stable identifier. |
| D14 | Public API uses subdomain split (`api.domain.com`) | Clean separation. |
| D15 | No rate limiting in MVP | Deferred. |
| D16 | Plain text in Phase 3; Markdown from Phase 7 | Rich text editor needs Phase 7. |
| D17 | Master Admin lives in same frontend app | Role-gated routes. |
| D18 | Master Admin powers: view + delete only | Privacy. |
| D19 | Multer + Cloudinary upload flow (server-mediated) | Server validates uploads. |
| D20 | Videos attach to projects only, not standalone | Avoids module bloat. |
| D21 | SaaS Phase 11 takes Path A | Keeps data model simple; no `tenantId`. |
| D22 | Remove forgot-password from Phase 2 | No email infra until Phase 7. |
| D23 | RTK Query for state, not Zustand | Team familiarity. |
| D24 | Node Cache, not Redis | MVP simplicity. |

### 18.2 LLD Decisions (added in v2.0)

| # | Decision | Rationale |
|---|---|---|
| D25 | `userId` is `nanoid(12)` | Opaque + non-enumerable; shorter URLs than UUID; 71 quintillion combinations. |
| D26 | 7-day single JWT in MVP; migrate to access + refresh in Phase 6/9 | Balance simplicity and security. |
| D27 | Blacklist entries auto-cleanup after 7 days via scheduled job | Matches JWT lifetime; prevents pileup. |
| D28 | Password validation: min 8 chars, upper + lower + number | Zod-enforced on plaintext pre-hash. |
| D29 | `emailVerified` column added now, defaults to `false` | Avoids Phase 7 migration; column meaning is honest from day one. |
| D30 | Skills referenced by Projects AND Experience via two separate junction tables | Cleaner than polymorphic single junction. |
| D31 | Tags use `userId` nullable + `isSystem` boolean for system tag representation | Cleaner than reserved-user pattern. |
| D32 | `featured` system tag seeded via `prisma/seed.ts` (idempotent) | Bootstrap on initial DB init. |
| D33 | Experience certificates stored as JSON column on Experience table | Per Vinay's spec: `{name, url, updatedAt, isActive}`. Simpler than separate table. |
| D34 | `activeJob` boolean added to Experience | Drives `durationTo` nullability with explicit conditional rule. |
| D35 | Junctions use `Cascade` on parent, `Restrict` on reference (skill/tag) | DB-level backstop for block-delete. |
| D36 | REST conventions (PUT now, PATCH later) instead of verb-in-path routes | Standard, tooling-friendly, frontend-friendly. |
| D37 | `/me` endpoint for current-user profile (not `/user-information`) | Idiomatic, industry-standard. |
| D38 | Single resume per user (no multi-resume scalability in MVP) | KB §5.3 lock; multi-resume is future scope. |
| D39 | `skillIds[]` and `tagIds[]` embedded in project create/update payloads | Atomic transaction; frontend simplicity; matches mental model. |
| D40 | `/admin/users` for master admin (short prefix) | Standard. |
| D41 | Offset-based pagination (`?page=1&limit=20`) | Adequate for portfolio-scale data; supports page numbers; migrate to cursor later if needed. |
| D42 | Cookies: `httpOnly + secure + sameSite: 'none'` in prod; `lax + insecure` in dev | Cross-domain Vercel + Railway setup requires `sameSite: 'none'`. |
| D43 | Public API versioned with `/v1/` prefix | Future-proof. |
| D44 | Generic `POST /api/v1/media/upload` for project media + experience certificates | Keeps content endpoints pure JSON; reusable. |
| D45 | Resume upload uses dedicated `POST /resume` (not `/media/upload`) | Simpler one-file flow. |
| D46 | No cookie expiry returned in response body | No "session expires in N days" UI needed. |
| D47 | Public API list endpoints support `?limit=N` | Supports homepage "top N" use cases. |
| D48 | Standard envelope `{success, data, error, statusCode}` on every response | Consistency. |
| D49 | Error code catalogue locked (17 codes) | Predictable frontend error handling. |
| D50 | Block-delete errors include `referencedBy` details in response | Frontend can show user exactly what's blocking. |
| D51 | Public API payloads flattened (skills/tags as strings, no IDs) | Reduces payload size, prevents ID leakage. |
| D52 | Master Admin restrictions enforced by absence of endpoints | Cleaner than runtime checks. |
| D53 | `/auth/session` endpoint added for FE rehydration | Frontend verifies cookie + reloads Redux on app boot. |
| D54 | Account deletion re-prompts password as confirmation | Friction step before destructive action. |
| D55 | Cleanup old Cloudinary asset on resume replace | Hygiene. |
| D56 | Inactive certificates filtered out of public API responses | Public should only see active certificates. |
| D57 | Tag name regex: `^[a-z0-9-]+$`, max 30 chars | URL-friendly slugs. |
| D58 | Skill name max 50 chars | Reasonable cap. |
| D59 | Project title max 200 chars; description max 5000 | Reasonable caps. |
| D60 | Experience title/company max 200; description max 10000 | Reasonable caps. |
| D61 | Image max 5MB, video max 50MB, PDF max 5MB | Cost control. |
| D62 | Document v1.1 of API contracts is the locked version | All open questions from v1.0 resolved. |

---

## 19. Open Questions / TODOs

These remain unresolved and should be answered during implementation:

### 19.1 Database / Schema
- [ ] Cloudinary asset cleanup on project/experience deletion — should service layer delete from Cloudinary or leave orphaned?
- [ ] Specific Cloudinary folder organization per user.

### 19.2 Auth
- [ ] Cookie domain attribute — set explicitly for cross-subdomain support?
- [ ] Master Admin bootstrap — seed script, manual DB insert, or env-flagged route?

### 19.3 Caching
- [ ] Public API cache TTL value (5 min? 1 hour?)
- [ ] Cache key naming conventions
- [ ] Cache invalidation triggers per mutation type

### 19.4 API
- [ ] Validation error response format from Zod (final shape of `details`)

### 19.5 Frontend
- [ ] React Router structure — exact protected vs public route map
- [ ] Loading / empty / error state conventions per page
- [ ] Form architecture detailed (React Forms + Zod resolver)

### 19.6 Testing (Phase 8)
- [ ] Jest vs Vitest
- [ ] Coverage thresholds
- [ ] Test database strategy (separate DB, transactional rollback, etc.)

### 19.7 Phase 7
- [ ] Clerk: in or out? Currently undecided.
- [ ] Resend templates for each email type
- [ ] Rich text editor library (TipTap, Quill, others)

### 19.8 Phase 11
- [ ] Custom domain provisioning strategy (CNAME, SSL automation)
- [ ] Theme system architecture — code packages or DB-driven config?

---

## 20. Rejected Approaches

Do not revisit without strong new reason.

| Approach | Why Rejected |
|---|---|
| Clerk as MVP auth | Custom JWT chosen for control + learning. |
| Zustand for state management | RTK Query chosen. |
| Direct client → Cloudinary uploads | Server-mediated via Multer chosen. |
| Redis caching | Node Cache chosen for MVP. |
| Username in public URL | Opaque `userId` chosen. |
| `redirectLink` field on Projects | Added by mistake. |
| `pinned` system tag | Redundant; only `featured` retained. |
| Tags on Experience or other modules | Tags are project-only. |
| Cascade-remove of skills on deletion | Block-delete chosen. |
| Soft-reference snapshot of skills | Block-delete chosen. |
| Multi-profile per user | Single profile only. |
| Soft-delete users | Hard delete with cascade. |
| Forgot-password in Phase 2 | No email infra. |
| Separate frontend app for Master Admin | One frontend, role-gated. |
| Master Admin editing user content | Privacy boundary. |
| Organizations / teams (Path B for Phase 11) | Path A chosen. |
| `tenantId` column in schema | Not needed under Path A. |
| Rate limiting in MVP | Deferred. |
| **6-digit integer userId** | Enumerable, capped at ~900K users. Replaced by nanoid(12). |
| **UUID for userId** | Longer URLs; nanoid is shorter, equally opaque. |
| **Verb-in-path routes (`/projects/get`)** | Not REST; bad tooling support. |
| **Multi-resume with active flag in MVP** | Future scope; current scope is single PDF per user. |
| **Separate junction-add endpoints for skills/tags on projects** | Atomic embedded payload chosen for transaction safety + FE simplicity. |
| **PATCH for updates in MVP** | PUT first, PATCH migration post-deployment. |
| **Cursor-based pagination in MVP** | Offset is fine for portfolio-scale data. |
| **`sameSite: strict` cookies** | Breaks cross-domain Vercel+Railway. |
| **Separate ExperienceCertificates table** | JSON column on Experience chosen (Vinay's spec). |
| **`emailVerified` defaulting to true in Phase 2** | Would make the column meaningless until Phase 7 mass-reset. Default `false`. |
| **Returning cookie expiry in response body** | No FE need; cookie itself is the truth. |
| **Embedding object metadata (e.g. skill objects with IDs) in public API** | Flat string arrays — no ID leakage. |

---

## 21. Glossary

| Term | Meaning in This Project |
|---|---|
| **Stratum CMS** | The product. |
| **User** | A developer with a Stratum CMS account managing their portfolio content. |
| **Master Admin** | Platform owner role. View + delete users only. |
| **`userId`** | Opaque nanoid(12) per user. Used in public API URLs. Generated server-side. |
| **Auth table** | Login credentials + role. |
| **User Information table** | Public profile data. 1-to-1 with Auth. |
| **Block-delete** | Deletion refused if dependent records exist (used for skills referenced in Experience or Projects). |
| **Cascade-delete** | Deletion of one record auto-deletes dependents (used for user hard delete). |
| **Public API** | Unauthenticated read-only endpoints under `api.domain.com/v1/:userId/:section`. |
| **System tag** | Tag (currently only `featured`) provided by the platform. Users can apply but not delete. |
| **Custom tag** | User-created tag, private to that user, only on their projects. |
| **Path A (Phase 11)** | SaaS path keeping single-user-per-tenant model; layers domains/themes/billing on top. |
| **Path B (Phase 11)** | **Rejected.** Organizations/teams as new tenant layer. |
| **HLD** | High-Level Design — architecture, components, stack. |
| **LLD** | Low-Level Design — schemas, contracts, class diagrams, flows. |
| **Active job** | An Experience entry where `activeJob = true` and `durationTo = null` — represents "currently working here". |
| **Standard envelope** | `{success, data, error, statusCode}` JSON shape used in every API response. |
| **Junction table** | A table linking two entities (e.g., `ProjectSkill` links Project ↔ Skill). |
| **`stratum_token`** | The name of the JWT cookie. |
| **Service** | Backend business-logic class. One per domain. |
| **Controller** | Backend HTTP handler class. Thin layer that calls a service. |
| **Shared service** | A service singleton used across multiple domain services (PrismaService, MediaService, CacheService). |
| **`/me`** | The endpoint prefix for current-user profile (derived from JWT, no `:userId` in path). |
| **`asyncHandler`** | Utility wrapper that eliminates try/catch blocks in controllers by routing thrown errors to the global error handler. |

---

*End of document — Stratum CMS Project Knowledge Base v2.0 — LLD complete.*
