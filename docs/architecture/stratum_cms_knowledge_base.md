# Stratum CMS — Project Knowledge Base

> **Purpose of this document**
> Authoritative, reusable project memory for Stratum CMS. Designed to be loaded into a future AI session (Claude Project Knowledge, ChatGPT Projects, etc.) so the project can be resumed without context loss.
>
> **Source of truth.** Where this document and any earlier draft (SDLC docx, product-spec-doc.md, features.md, assumptions.md, risk.md) disagree, **this document wins.** Earlier docs are legacy.
>
> **Owner:** Vinay
> **Document version:** 1.0
> **Status:** End of High-Level Design (HLD); Low-Level Design (LLD) not yet started.

---

## 1. Product Vision

### 1.1 What Stratum CMS Is

Stratum CMS is a **developer-focused, API-first portfolio Content Management System**. It lets developers store, manage, and serve their portfolio content (projects, experience, skills, resume, contact info, etc.) through:

1. A **built-in management dashboard** (UI) for creating and editing content.
2. **Public REST APIs** that the developer consumes from their own portfolio website.

The goal: eliminate the need for developers to build and maintain custom backends, admin panels, and databases just to keep their portfolio content fresh.

### 1.2 What Stratum CMS Is NOT

- **Not a portfolio template provider.** Users bring their own portfolio frontend (React, Next.js, static HTML, whatever). Stratum CMS does not generate or host portfolio sites.
- **Not a Clerk-based product.** Auth is custom-built. Clerk is under discussion only as a possible later integration.
- **Not multi-tenant in the "organizations/teams" sense.** Each user is their own tenant. There are no shared workspaces.

### 1.3 Target User

- Developers (junior-to-mid, broadly) who already have or are building a portfolio site.
- Comfortable consuming REST APIs from their frontend code.
- Want to update portfolio content without redeploying their site.

### 1.4 Core Value Proposition

> "Manage your portfolio content in a dashboard. Fetch it via a public API. No backend work required on your end."

---

## 2. High-Level Architecture

### 2.1 System Components

| Component | Role |
|---|---|
| **Frontend application** | Single React app. Contains the user dashboard *and* the Master Admin section (role-gated routes/components). |
| **Backend API** | Node.js + Express server. Handles auth, CRUD, media uploads, and public read endpoints. |
| **PostgreSQL database** | Persistent storage for all user, content, and auth data. Accessed via Prisma ORM. |
| **Cloudinary** | External media storage. Stores PDFs (resume, certificates), images, and videos. The DB stores only the returned URLs. |
| **Frontend hosting** | Vercel. |
| **Backend hosting** | Railway. |
| **CI/CD** | GitHub Actions. |
| **Containerization** | Docker. |

### 2.2 Component Interaction Flow

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
[ api.domain.com/:userId/:section ]  <-- no auth, fully public
       |
       v
[ Express Backend ]
       |
       v
[ PostgreSQL via Prisma ORM ]
```

### 2.3 Tech Stack

#### Frontend
- **React** (with Vite, per earlier docs)
- **Tailwind CSS**
- **Redux Toolkit Query (RTK Query)** — state management & data fetching
- **Zod** — schema validation
- **React Hot Toast** — notifications
- **React Forms** — form handling
- **React Icons** — icon library

#### Backend
- **Node.js + Express**
- **PostgreSQL**
- **Prisma ORM**
- **Zod** — validation (same schema strategy on both sides)
- **Multer** — multipart form handling for file uploads
- **Node Cache** — in-memory caching layer
- **JWT** — authentication tokens
- **Bcrypt** — password hashing

#### DevOps / Utilities
- **Git** — version control
- **Nodemon** — dev server auto-restart
- **Watch** — file watching
- **Health check route** — required from Phase 0

#### External Services
- **Cloudinary** — media storage
- **Vercel** — frontend hosting
- **Railway** — backend hosting
- **GitHub Actions** — CI/CD
- **Docker** — containerization
- **Resend** *(Phase 7)* — transactional email
- **Clerk** *(Phase 7, undecided)* — possible auth supplement
- **Stripe + RevenueCat** *(Phase 10)* — billing

### 2.4 Deployment Architecture

- **Frontend:** Vercel free tier initially.
- **Backend:** Railway free tier initially.
- **Database:** PostgreSQL (Railway-hosted initially).
- **Media:** Cloudinary free tier.
- **CI/CD:** GitHub Actions runs lint + tests on PRs; merges to main deploy to staging; production is manual.
- **Domain split:** `api.domain.com` for backend; the frontend lives elsewhere.

---

## 3. Identity & User Model

### 3.1 Two-Table Identity Design

Stratum CMS uses **two independent tables** with a **1-to-1 relationship**:

| Auth Table | User Information Table |
|---|---|
| `userId` (opaque unique ID — primary key) | `userId` (FK → Auth) |
| `email` (login credential, unique) | `name` (public display name, editable) |
| `password` (Bcrypt-hashed) | `email` (public contact email) |
| `name` (internal use) | `address` |
| `role` (user / master admin) | `socialMediaLinks[]` |
| | `phoneNumber` |
| | `googleMapLocationLink` |

#### Critical Properties

- **`userId` is opaque** — random characters/numbers/integers. **Not** derived from email or name. **Cannot** be reverse-engineered to discover the user.
- **Two `email` fields**, intentionally:
  - Auth `email` = login credential.
  - User Info `email` = public contact (shown on portfolio).
  - They can be different. They can be the same.
- **Two `name` fields**, intentionally:
  - Auth `name` = internal ("Welcome back, Vinay" in dashboard).
  - User Info `name` = public display name on the portfolio. **User can change freely.**
- **One profile per user.** No multi-profile support.

### 3.2 User Roles

| Role | Description |
|---|---|
| `user` | Default. Manages their own content. |
| `master_admin` | Platform owner. Sees Master Admin section in frontend. View + delete users only. |

Role is stored on the Auth row. Master Admin login uses the same JWT flow; the role flag drives frontend routing and backend authorization.

---

## 4. Authentication & Authorization

### 4.1 Auth Stack (Phase 2)

- **Custom-built** — no Clerk, no Auth0 in MVP.
- **JWT tokens** stored in **httpOnly cookies** (cannot be read by JS — XSS mitigation).
- **Bcrypt** for password hashing.
- **PostgreSQL blacklist table** for invalidated tokens (post-logout). On every protected route, middleware checks if the incoming JWT is in the blacklist.

### 4.2 Auth Capabilities by Phase

| Capability | Phase | Notes |
|---|---|---|
| Signup (email + password) | Phase 2 | |
| Login | Phase 2 | |
| Logout | Phase 2 | Token added to blacklist table |
| Protected routes | Phase 2 | Middleware verifies JWT + checks blacklist |
| Delete user | Phase 2 | **Hard delete with cascade** to all user content |
| Forgot password | **Phase 7** | Deferred — requires email infrastructure |
| Email verification | **Phase 7** | |
| Login/logout notifications | **Phase 7** | |

### 4.3 Why Forgot-Password Is Deferred

Email infrastructure (Resend) isn't introduced until Phase 7. There's no way to send a reset link in Phase 2, so the feature is removed from Phase 2 entirely.

### 4.4 Master Admin Authorization

Same JWT system; role check on protected admin routes. Master Admin can:
- ✅ View users
- ✅ Delete users
- ❌ Edit user content
- ❌ Reset user passwords
- ❌ Impersonate users

---

## 5. Content Modules (Phase 3)

All modules are **scoped per user**. Master Admin sees the user list but does not edit content.

### 5.1 User Information

Public profile data. 1-to-1 with the Auth record.

Fields:
- `name` — public display name
- `email` — public contact email
- `socialMediaLinks[]`
- `address`
- `phoneNumber`
- `googleMapLocationLink`

### 5.2 Experience

```json
{
  "title": "",
  "company": "",
  "location": "",
  "duration": { "from": "", "to": "" },
  "description": "",
  "skills": [],
  "certificate": ["cloudinary_url_1", "cloudinary_url_2"]
}
```

- `description` is plain text in Phase 3, Markdown from Phase 7.
- `skills[]` references the **Skills module** via dropdown selection (not free text).
- `certificate` is an **array** of Cloudinary URLs (multiple certificates supported).

### 5.3 Resume

- Single PDF per user.
- Uploaded via Multer → Cloudinary.
- DB stores the Cloudinary URL.
- Preview feature is **future scope**, not in Phase 3.

### 5.4 Projects

```json
{
  "title": "",
  "description": "",
  "techSkills": [],
  "tags": [],
  "mediaUrl": "",
  "githubLink": "",
  "liveLink": ""
}
```

- ⚠️ `redirectLink` was in the original doc by mistake. **Removed.**
- `description` is plain text in Phase 3, Markdown from Phase 7.
- `mediaUrl` can point to an image or a video on Cloudinary.

### 5.5 Tags

**Purpose:** project categorization for filter buttons on the public portfolio.

Use case example:
> A portfolio's project page has buttons like `All` / `Frontend` / `Backend`. Clicking `Frontend` shows only projects tagged with `frontend`.

Rules:
- **Used only on Projects.** No other module uses tags.
- **One system tag:** `featured`. Cannot be deleted by users.
- All other tags are **user-created, private** to that user.
- ⚠️ The original doc mentioned a `pinned` system tag. **Dropped.** Only `featured` remains.

### 5.6 Skills

Standalone per-user registry. Canonical source for skills.

- Users add, edit, delete skills.
- The Experience module references skills via a dropdown.
- **Block-deletion rule:** A skill **cannot** be deleted while any Experience entry references it. The system must indicate which Experience entries are blocking, and the user must remove the reference first.

### 5.7 Future Modules (Post-MVP, Not in Phase 3)

- Blogs
- FAQ
- Services
- Banner
- Testimonials

These are explicitly deferred. Their schemas are not designed yet.

---

## 6. Media Handling

### 6.1 Supported Types

| Type | Used By |
|---|---|
| PDF | Resume, Experience certificates |
| Image (JPG/PNG/WebP) | Project `mediaUrl`, profile assets |
| Video | Project `mediaUrl` only |

**Videos are not a standalone module.** They are media attached to projects.

### 6.2 Upload Flow

```
Client (file input)
   |
   v
Backend (Express endpoint)
   |
   v
Multer (multipart parsing, temporary storage)
   |
   v
Cloudinary upload (HTTPS API call)
   |
   v
Cloudinary returns hosted URL
   |
   v
URL persisted in PostgreSQL via Prisma
```

### 6.3 Constraints (from earlier risk doc, kept as guidance)

- Cloudinary handles validation.
- MIME type check on backend.
- Max file size: 5MB (subject to revisit).

---

## 7. Public API (Phase 4)

### 7.1 URL Pattern

**Chosen pattern (Option B): subdomain split.**

```
api.domain.com/:userId/:section
```

Examples:
- `api.domain.com/abc123xyz/projects`
- `api.domain.com/abc123xyz/experience`
- `api.domain.com/abc123xyz/skills`
- `api.domain.com/abc123xyz/tags`
- `api.domain.com/abc123xyz/resume`
- `api.domain.com/abc123xyz/user-info`

### 7.2 Properties

- **Identifier:** opaque `userId`, not username or email.
- **Authentication:** none. Fully public.
- **Method:** GET only (read-only public surface).
- **Rate limiting:** **none in MVP.** Deferred.

### 7.3 Response Envelope

Standard envelope (carried over from the API design):

```json
{
  "success": true,
  "data": [],
  "error": null,
  "statusCode": 200
}
```

### 7.4 Error Cases

- `userId` does not exist → response says `"no user found"`.
- `userId` exists but the resource is empty → `"no data present for this user"`.

### 7.5 Why Subdomain Split

- Cleanly separates the API surface from the frontend hosting (Vercel).
- Avoids route collisions between frontend SPA routes and API routes.
- Eases CORS configuration (one origin per concern).

---

## 8. Frontend Architecture

### 8.1 Single Frontend App, Role-Gated

There is **one** React frontend application. It contains:

- **User Dashboard** — visible to all logged-in users. Manages their own content.
- **Master Admin Section** — separate routes, separate components, role-gated. Lives inside the same app.

### 8.2 State Management

- **Redux Toolkit Query (RTK Query)** for all server state.
- Cache invalidation strategy: to be designed in LLD.

### 8.3 Validation

- **Zod schemas** on the frontend, mirroring the backend Zod schemas. Single source of truth for shape.

### 8.4 UI Library Stack

- Tailwind CSS for styling
- React Hot Toast for notifications
- React Icons
- React Forms

Component hierarchy and routing structure: to be designed in LLD.

---

## 9. Backend Architecture

### 9.1 Code Organization (planned)

To be finalized in LLD. High-level: controllers, services, middleware, routes, validators (Zod), Prisma client. Class diagram and folder structure are LLD deliverables.

### 9.2 Conventions Defined So Far

- **`asyncHandler` utility** wraps async route handlers to centralize error capture.
  ```js
  asyncHandler((req, res) => { /* ... */ })
  ```
- **Global error handler** middleware.
- **Body parser / JSON parser** at the app level.
- **Dummy controllers with real names** scaffolded in Phase 1 before logic exists.
- **Middleware placeholders** scaffolded in Phase 1.

### 9.3 Caching

- **Node Cache** (in-memory) for caching layer. **Not** Redis.
- Specific cache keys, TTLs, and invalidation: LLD work.

### 9.4 SOLID Principles

Explicitly noted as a low-level design concern. Code structure should adhere to SOLID where reasonable.

---

## 10. Database

### 10.1 ORM

- **Prisma**. Type-safe, schema-as-code, generates migrations and TypeScript types from the schema file.

### 10.2 Schema

⚠️ **Not designed yet.** This is the first major LLD deliverable.

Tables that will exist (confirmed in this discussion):
- `auth` — login credentials + role
- `user_information` — public profile (1-to-1 with auth)
- `projects`
- `experience`
- `skills`
- `tags`
- `resume`
- `token_blacklist` — invalidated JWTs
- Join tables as needed (e.g., experience↔skills, projects↔tags)

### 10.3 Key Schema Decisions Locked In

- **`userId` is opaque** — generated server-side, unique, no semantic content.
- **Hard delete with cascade** for user deletion.
- **Block-deletion** on skills used in Experience.
- **No `tenantId` column.** SaaS Phase 11 takes Path A (see §13.11), so `userId` is sufficient for isolation.

---

## 11. Security

### 11.1 MVP Security Baseline

- Bcrypt password hashing.
- JWT in httpOnly cookies (XSS-resistant token storage).
- JWT blacklist table for logout invalidation.
- Prisma parameterized queries (SQL injection protection).
- Zod input validation on every endpoint.
- CORS restricted to known frontend origin(s).
- Environment variables for secrets, never committed.

### 11.2 Phase 6 — Security Enhancements

- **"Database query optimization"** in this project's vocabulary means **SQL-injection-safe query construction**, *not* performance tuning. (e.g., never concatenate user input into raw SQL.) Prisma handles most of this; the phase verifies it.
- **"Malware / injection prevention"** = combined coverage of:
  - SQL injection (already covered by Prisma + parameterization)
  - XSS protection on stored/rendered content
  - File-upload validation (MIME type, size, Cloudinary's own validation)
- Protected routes audit.
- Middleware protection review.

### 11.3 Known Future Risks (Tracked)

| Risk | Current Mitigation | Owner Phase |
|---|---|---|
| Public API enables data scraping | None in MVP. Rate limiting deferred. | Post-MVP |
| XSS via rich text (when introduced) | DOMPurify-style backend sanitization | Phase 7 |
| Malicious file uploads | Cloudinary validation, MIME check, 5MB cap | Phase 3 |
| Cloudinary bandwidth overage | Client-side compression, monitoring | Phase 3+ |
| Auth token compromise | Short-lived JWTs, blacklist on logout | Phase 2 |
| Single-instance backend = SPOF | Auto-restart, daily DB snapshots, health checks | Phase 6+ |
| Clerk outage (if integrated) | Email login fallback | Phase 7 |

---

## 12. Coding Standards & Quality

### 12.1 Required Standards

- TypeScript strict mode across frontend and backend (carried over from earlier doc; reconfirmed).
- ESLint + Prettier on pre-commit.
- No `any` types.
- Prisma-generated types as the source of truth for data shapes.
- Zod schemas mirrored on both sides where applicable.

### 12.2 Testing (Phase 8)

Deferred to a dedicated phase.
- Unit tests
- Integration tests
- Automated tests in CI

⚠️ Specific framework (Jest vs Vitest) and coverage targets **not yet decided.**

---

## 13. Phased Roadmap

12 phases, executed sequentially. Each phase is independently shippable.

### 13.1 Phase 0 — Project Setup
- Separate frontend and backend repos/folders.
- CORS configured.
- Health check route on backend (`GET /health`).
- Frontend ↔ backend integration verified locally.

### 13.2 Phase 1 — Core Backend Structure
- Body parser / JSON parser.
- Global error handler.
- `asyncHandler` utility.
- Dummy controllers with real function names.
- Routes scaffolded.
- Middleware placeholders.

### 13.3 Phase 2 — Authentication System
- Signup, login, logout (email + password).
- JWT in httpOnly cookies.
- Bcrypt for passwords.
- Token blacklist table.
- Hard delete user with cascade.
- ⚠️ **No forgot-password yet** (no email infra).

### 13.4 Phase 3 — CRUD Functionality
Submodule: Media handling (PDFs, images, videos via Multer → Cloudinary).

Modules in scope:
- User Information
- Experience (with certificates[] array)
- Resume
- Projects
- Tags (with system `featured` tag)
- Skills (block-deletion rule)

Out of scope for Phase 3: Blogs, FAQ, Services, Banner, Testimonials.

### 13.5 Phase 4 — Public API
- Read-only public endpoints under `api.domain.com/:userId/:section`.
- No auth, no rate limiting in MVP.
- Standard envelope response.

### 13.6 Phase 5 — Master Admin Panel
- Same frontend app, separate routes, role-gated.
- Master Admin can view + delete users.
- Cannot edit content, cannot reset passwords.

### 13.7 Phase 6 — Security Enhancements
- Route protection audit.
- Middleware hardening.
- SQL injection-safe query review.
- General injection/XSS/file-upload review.

### 13.8 Deployment (between Phase 6 and Phase 7)
- GitHub Actions pipelines.
- Dockerfile(s).
- Vercel (frontend) and Railway (backend) on free tiers.

### 13.9 Phase 7 — Product Polishing
- Email features (Resend): forgot-password, verification, delete-user confirmation, login/logout notifications.
- Rich text editor on frontend; **content stored as Markdown** in DB.
- Media preview support.
- ⚠️ Clerk integration **still under discussion** — not committed.

### 13.10 Phase 8 — Testing
- Unit, integration, automated.
- Framework choice pending.

### 13.11 Phase 9 — Security Review
- Full audit.
- Vulnerability scan.
- Auth review.
- API protection review.

### 13.12 Phase 10 — Pricing Model
- Stripe + RevenueCat.
- Subscription tiers.

### 13.13 Phase 11 — SaaS Level Introduction (Path A confirmed)
**Path A**: stay on the current single-user-per-tenant model. Phase 11 adds product features *on top of* the existing model:
- Custom domains
- Themes
- Higher tiers

**Consequence:** schema does **not** need a `tenantId` column. `userId` is sufficient.

Path B (organizations/teams sharing a tenant) is **rejected**.

### 13.14 Phase 12 — Premium Features
- To be defined.

---

## 14. Decision Log (Chronological Highlights)

| # | Decision | Rationale |
|---|---|---|
| D1 | Use custom JWT auth, not Clerk | Cost, control, learning value. Clerk reconsidered in Phase 7 only. |
| D2 | JWT in httpOnly cookies | XSS-resistant token storage. |
| D3 | PostgreSQL blacklist table for logout | Survives backend restarts; Node Cache wouldn't. |
| D4 | Hard delete with cascade for user removal | Simpler model; aligns with single-profile-per-user design. |
| D5 | Remove `redirectLink` from Projects | Added in error in original doc. |
| D6 | Drop `pinned` system tag; keep only `featured` | Redundant; one is enough. |
| D7 | Tags used only on Projects | Other modules don't need categorization filters. |
| D8 | Skills module is canonical; Experience links to it via dropdown | Avoids duplicate skill strings; enables consistent filtering. |
| D9 | Block-delete skills referenced in Experience | Prevents broken references. Alternatives (cascade-remove, soft snapshot) rejected. |
| D10 | One profile per user | Simpler product; multi-profile is post-MVP if ever. |
| D11 | Auth and User Information are independent tables (1-to-1) | Lets login email differ from public contact email. Lets display name change without affecting login. |
| D12 | `userId` is opaque, not derived from name/email | Prevents enumeration; allows username/email changes without breaking public API. |
| D13 | Public API uses `userId`, not username | Stable identifier; users can change display info freely. |
| D14 | Public API uses subdomain split (`api.domain.com`) | Clean separation from frontend; easier CORS; no route collisions. |
| D15 | No rate limiting in MVP | Deferred; abuse assumed low; revisit if abused. |
| D16 | Plain text in Phase 3; Markdown from Phase 7 | Rich text editor requires Phase 7 work; Markdown chosen as storage format. |
| D17 | Master Admin lives in the same frontend app | No separate dashboard repo; role-gated routes. |
| D18 | Master Admin powers: view + delete only | Protects user privacy; no impersonation or content edits. |
| D19 | Multer + Cloudinary upload flow (server-mediated) | Server validates and controls uploads; not direct client → Cloudinary. |
| D20 | Videos attach to projects only, not a standalone module | Avoids module bloat in Phase 3. |
| D21 | SaaS Phase 11 takes Path A (no organizations) | Keeps the data model simple; no `tenantId` needed. |
| D22 | Remove forgot-password from Phase 2 | No email infra until Phase 7. |
| D23 | RTK Query for state, not Zustand | Decided by Vinay; aligns with team familiarity. |
| D24 | Node Cache, not Redis, for caching layer | MVP simplicity; Redis revisitable later. |

---

## 15. Open Questions / TODOs

These were **not resolved** in the HLD discussion. They must be answered during LLD or before coding starts.

### 15.1 Database / Schema (LLD)
- [ ] **Full Prisma schema** — design all tables, fields, types, indexes, relations.
- [ ] **`userId` generation** — UUID, nanoid, or custom? Length, collision strategy.
- [ ] **`certificate[]` storage** — array column, JSON column, or separate `experience_certificates` table?
- [ ] **`skills[]` on Experience** — junction table (recommended) vs. JSON array. Junction is needed for the block-delete check.
- [ ] **`tags[]` on Projects** — junction table vs. JSON array. Junction needed if querying "all projects with tag X".
- [ ] **Soft-delete columns** — any tables that need `deletedAt`? Currently designed as hard-delete-only.
- [ ] **Indexes** — at minimum on `userId` everywhere; possibly on `email` in auth.
- [ ] **Timestamps** — `createdAt` / `updatedAt` on every table.

### 15.2 Auth (LLD)
- [ ] JWT lifetime (short-lived access + refresh, or single long-lived?).
- [ ] Cookie attributes: `SameSite`, `Secure`, `Domain`, `Path`, `Max-Age`.
- [ ] Blacklist cleanup strategy — entries pile up forever otherwise. TTL job?
- [ ] Master Admin bootstrap — how does the first master admin get created? Seed script? Manual DB insert? Env-flagged route?

### 15.3 API (LLD)
- [ ] Full endpoint list with request/response shapes for **private** routes (dashboard).
- [ ] Error code catalogue (e.g., `AUTH_INVALID_CREDENTIALS`, `RESOURCE_NOT_FOUND`).
- [ ] Pagination strategy — even if not in MVP, decide the *shape* now (offset vs cursor).
- [ ] Validation error response format from Zod.

### 15.4 Frontend (LLD)
- [ ] React Router structure — protected vs public routes, master admin gating.
- [ ] RTK Query slice organization.
- [ ] Loading / empty / error state conventions per page.
- [ ] Form architecture (React Forms + Zod resolver).
- [ ] Folder structure (`features/`, `components/`, `pages/`, etc.).

### 15.5 Media (LLD)
- [ ] Final max file size per type (PDF, image, video).
- [ ] Cloudinary folder organization per user.
- [ ] Cleanup on deletion — when a project is deleted, is the Cloudinary asset deleted too?

### 15.6 Testing (Phase 8)
- [ ] Jest vs Vitest.
- [ ] Coverage thresholds.
- [ ] Test database strategy (separate DB, transactional rollback, etc.).

### 15.7 Phase 7
- [ ] **Clerk: in or out?** Currently undecided. If in, does it replace custom auth or add OAuth providers alongside it?
- [ ] Resend templates for each email type.
- [ ] Rich text editor library (TipTap, Quill, others).

### 15.8 Phase 11
- [ ] Custom domain provisioning strategy (CNAME, SSL automation).
- [ ] Theme system architecture — themes as code packages, or DB-driven config?

---

## 16. Rejected Approaches (Do Not Revisit Without Reason)

| Approach | Why Rejected |
|---|---|
| Clerk as MVP auth | Vinay chose custom JWT for control and learning. |
| Zustand for state management | RTK Query chosen instead. |
| Direct client → Cloudinary uploads | Server-mediated via Multer chosen for control. |
| Redis caching | Node Cache chosen for MVP simplicity. |
| Username in public URL | Opaque `userId` chosen so users can change display info freely. |
| `redirectLink` field on Projects | Added by mistake; removed. |
| `pinned` system tag | Redundant; only `featured` retained. |
| Tags on Experience or other modules | Tags are project-only. |
| Cascade-remove of skills on deletion | Block-delete chosen instead. |
| Soft-reference snapshot of skills | Block-delete chosen instead. |
| Multi-profile per user | Single profile only. |
| Soft-delete users | Hard delete with cascade chosen. |
| Forgot-password in Phase 2 | No email infra; deferred to Phase 7. |
| Separate frontend app for Master Admin | One frontend, role-gated routes. |
| Master Admin editing user content | Privacy boundary; view + delete only. |
| Organizations / teams (Path B for Phase 11) | Path A chosen; single-user-per-tenant model preserved. |
| `tenantId` column in schema | Not needed under Path A. |
| Rate limiting in MVP | Deferred. |

---

## 17. Glossary

| Term | Meaning in This Project |
|---|---|
| **Stratum CMS** | The product. |
| **User** | A developer with a Stratum CMS account managing their portfolio content. |
| **Master Admin** | Platform owner role. View + delete users only. |
| **`userId`** | Opaque unique identifier per user. Appears in public API URLs. Not derived from name/email. |
| **Auth table** | Stores login credentials and role. |
| **User Information table** | Stores public profile data. 1-to-1 with Auth. |
| **Block-delete** | Deletion is refused if dependent records exist (used for skills referenced in Experience). |
| **Cascade-delete** | Deletion of one record automatically deletes dependents (used for user deletion). |
| **Public API** | Unauthenticated read-only endpoints under `api.domain.com/:userId/:section`. |
| **System tag** | A tag (currently only `featured`) provided by the platform; users can use it but cannot delete it. |
| **Custom tag** | User-created tag, private to that user, used only on their projects. |
| **Path A (Phase 11)** | SaaS path that keeps single-user-per-tenant model and layers domains/themes/billing on top. |
| **Path B (Phase 11)** | Rejected. Organizations/teams as a new tenant layer. |
| **HLD** | High-Level Design — system architecture, components, tech stack. |
| **LLD** | Low-Level Design — schemas, API contracts, class diagrams, flows. |

---

## 18. Final Context Summary

> **For rapid AI re-context. Read this if nothing else.**

**Stratum CMS** is a developer portfolio CMS. It provides:
1. A built-in React dashboard for users to manage portfolio content (projects, experience, skills, resume, contact info, tags).
2. Public REST APIs at `api.domain.com/:userId/:section` so users can fetch their content into their own portfolio sites.

**Tech stack:** React + Tailwind + RTK Query + Zod (frontend); Node + Express + Prisma + PostgreSQL + Multer + Node Cache + Bcrypt + JWT (backend); Cloudinary for media; Vercel + Railway for hosting; GitHub Actions + Docker for CI/CD.

**Identity model:** Two independent 1-to-1 tables — `auth` (email/password/role/name) and `user_information` (public profile). `userId` is an opaque identifier, separate from email/name, used in public URLs.

**Auth:** custom JWT in httpOnly cookies, Bcrypt for passwords, PostgreSQL blacklist table for logged-out tokens. No forgot-password until Phase 7 (email infra).

**Content modules (Phase 3):** User Information, Experience (with certificates[] array), Resume (single PDF), Projects (no `redirectLink`), Tags (only on Projects; one system tag `featured`), Skills (canonical registry, referenced by Experience, block-delete if in use).

**Media flow:** Client → Backend (Multer) → Cloudinary → URL stored in PostgreSQL.

**Master Admin:** role-flagged user, same JWT auth, same frontend app with separate routes, can only view + delete users (no edit, no password reset).

**Public API:** `api.domain.com/:userId/:section`, fully public, no auth, no rate limiting in MVP, standard `{success, data, error, statusCode}` envelope.

**12-phase roadmap:** Phase 0 setup → Phase 1 backend skeleton → Phase 2 auth → Phase 3 CRUD + media → Phase 4 public API → Phase 5 Master Admin → Phase 6 security → Deployment → Phase 7 polishing (email, Markdown rich text) → Phase 8 testing → Phase 9 security audit → Phase 10 Stripe billing → Phase 11 SaaS features (Path A: domains/themes on existing model) → Phase 12 premium features.

**Where we are now:** HLD ~complete. LLD has **not** started. First LLD deliverable: full Prisma schema.

**Key constraints to remember:**
- Custom auth, not Clerk (Clerk is a Phase 7 maybe).
- Single profile per user; one user = one tenant.
- `userId` is opaque; never derive it from name/email.
- Tags are projects-only.
- Skills can't be deleted while referenced by Experience.
- Rich text and email features are Phase 7, not earlier.
- Public API uses `userId`, on `api.domain.com` subdomain.

---

*End of document — Stratum CMS Project Knowledge Base v1.0*
