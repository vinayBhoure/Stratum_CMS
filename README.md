<div align="center">

# ◆ Stratum CMS

### Your portfolio content, API-first.

A developer-focused content management system that lets you manage portfolio content in a dashboard and serve it via public REST APIs — so you never hardcode project data again.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## 🎯 What is Stratum CMS?

Stratum CMS is an **API-first portfolio CMS** built for developers who want to manage their portfolio content without maintaining a custom backend. You get a clean dashboard to manage your projects, experience, skills, resume, and tags — and a public REST API that your portfolio frontend consumes.

**Not** a portfolio template. **Not** a site builder. You bring your own frontend (React, Next.js, static HTML, whatever). Stratum handles the content layer.

**Built for:**
- 👨‍💻 **Developers** — update portfolio content without redeploying
- 🎨 **Portfolio owners** — manage projects, experience, skills, and resume from a dashboard
- 🔌 **API consumers** — fetch structured portfolio data into any frontend via REST
- 🛠️ **Learners** — a real full-stack project with custom auth, file uploads, and role-based access

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Content Dashboard
Manage projects, experience entries, skills, tags, and resume from a single clean interface. Vercel-inspired design with emerald accent and minimal UI.

### 🔐 Custom Authentication
JWT in httpOnly cookies, Bcrypt password hashing, PostgreSQL token blacklist for secure logout. No third-party auth dependency.

### 🌐 Public REST API
Serve your portfolio data at `api.domain.com/v1/:userId/:section`. Fully public, read-only, zero auth required for consumers.

### 📁 Media Uploads
Upload images, PDFs, and videos through Multer → Cloudinary pipeline. URLs stored in PostgreSQL — content endpoints stay pure JSON.

</td>
<td width="50%">

### 🏷️ Smart Content Model
Projects with tags, experience with certificates and skill references, canonical skill registry with block-delete protection, and a single `featured` system tag.

### 👑 Master Admin
Role-gated admin panel within the same app. View all users, delete accounts with full cascade — no edit, no impersonation.

### ✅ Mirrored Validation
Zod schemas on both frontend and backend — single source of truth for data shapes. What the form validates is what the API enforces.

### 📄 Resume Management
Single-PDF-per-user model with dedicated upload endpoint. Old Cloudinary assets auto-cleaned on replace.

</td>
</tr>
</table>

**And also:** RTK Query cache invalidation · Offset-based pagination · Standard response envelope · CORS-locked origins · Environment-based cookie attributes · Global error handler · asyncHandler utility · Prisma-generated types

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="33%"><b>Frontend</b></td>
<td align="center" width="33%"><b>Backend</b></td>
<td align="center" width="33%"><b>Infrastructure</b></td>
</tr>
<tr>
<td>

- React 18 (Vite)
- TypeScript (strict)
- Tailwind CSS
- Redux Toolkit Query
- Zod (validation)
- React Router
- React Hot Toast

</td>
<td>

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Multer (file uploads)
- Cloudinary (media storage)
- Node Cache
- Bcrypt + JWT

</td>
<td>

- Docker + Compose
- GitHub Actions (CI/CD)
- Vercel (frontend)
- Railway (backend)
- Cloudinary (media CDN)

</td>
</tr>
</table>

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React + Vite)                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Pages   │  │  Dashboard   │  │   Admin (role-gated)│    │
│  │  (public)│  │  (auth-gated)│  │                     │    │
│  └──────────┘  └──────────────┘  └────────────────────┘    │
│       │              │                     │                │
│       └──────────────┴─────────────────────┘                │
│                      │                                      │
│              RTK Query + Zod Validators                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (credentials: include)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   Server (Express + TypeScript)               │
│                                                               │
│  Request → Body Parser → Zod Validator → Auth Middleware      │
│         → Role Middleware → Controller → Service              │
│         → Prisma / Cache / Media → Response Envelope          │
│                                                               │
│  Errors at any layer → Global Error Handler → envelope        │
└──────┬────────────────────┬──────────────────┬───────────────┘
       │                    │                  │
       ▼                    ▼                  ▼
  ┌──────────┐      ┌────────────┐     ┌────────────┐
  │PostgreSQL│      │ Cloudinary │     │ Node Cache │
  │ (Prisma) │      │  (media)   │     │ (public API│
  └──────────┘      └────────────┘     │  caching)  │
                                       └────────────┘
```

### Public API Flow

```
Portfolio Frontend                    Stratum CMS
      │                                    │
      │  GET api.domain.com/v1/:userId/    │
      │       projects?tag=frontend        │
      ├───────────────────────────────────►│
      │                                    │──► Node Cache (hit?)
      │                                    │──► PostgreSQL (miss)
      │    { success, data, statusCode }   │
      │◄───────────────────────────────────┤
      │                                    │
      │  No auth. No API key. Just GET.    │
```

### Media Upload Flow

```
Dashboard (file input)
       │
       ▼
POST /api/v1/media/upload (multipart/form-data)
       │
       ▼
Multer (parse + MIME check + size cap)
       │
       ▼
Cloudinary (upload via HTTPS)
       │
       ▼
Returns hosted URL
       │
       ▼
Frontend embeds URL in JSON body of create/update request
       │
       ▼
URL persisted in PostgreSQL via Prisma
```

---

## 🚀 Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/vinay/stratum-cms.git
cd stratum-cms
cp .env.example server/.env
cp .env.example client/.env
docker compose up --build
```

Open **http://localhost:5173** (frontend) and **http://localhost:4000/health** (backend) 🎉

### Manual Setup

```bash
# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# Setup database
cd server
cp ../.env.example .env                   # edit DATABASE_URL
npx prisma migrate dev --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma
npx prisma db seed

# Run (two terminals)
npm run dev                               # Terminal 1: server on :4000
cd ../client && npm run dev               # Terminal 2: client on :5173
```

---

## 🔑 Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/stratum"
JWT_SECRET="your-64-char-secret"          # openssl rand -hex 32

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Server
SERVER_PORT=4000
CLIENT_URL="http://localhost:5173"

# Client
VITE_API_URL="http://localhost:4000/api/v1"
```

---

## 📡 API Reference

### Private API (authenticated)

Base URL: `https://api.domain.com/api/v1`

<details>
<summary><b>Auth</b> — signup, login, logout, session</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | public | Register new user |
| `POST` | `/auth/login` | public | Login (sets httpOnly cookie) |
| `POST` | `/auth/logout` | authenticated | Logout (blacklists token) |
| `GET` | `/auth/session` | authenticated | Verify session + rehydrate |
| `DELETE` | `/auth/delete-account` | authenticated | Hard delete (password re-prompt) |
</details>

<details>
<summary><b>Profile</b> — user information</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/me` | authenticated | Get current user profile |
| `PUT` | `/me` | authenticated | Update profile info |
</details>

<details>
<summary><b>Projects</b> — portfolio projects</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/projects` | authenticated | List user's projects |
| `GET` | `/projects/:id` | authenticated | Get single project |
| `POST` | `/projects` | authenticated | Create project |
| `PUT` | `/projects/:id` | authenticated | Update project |
| `DELETE` | `/projects/:id` | authenticated | Delete project |
</details>

<details>
<summary><b>Experience</b> — work history</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/experience` | authenticated | List experience entries |
| `GET` | `/experience/:id` | authenticated | Get single entry |
| `POST` | `/experience` | authenticated | Create entry |
| `PUT` | `/experience/:id` | authenticated | Update entry |
| `DELETE` | `/experience/:id` | authenticated | Delete entry |
</details>

<details>
<summary><b>Skills, Tags, Resume, Media</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/skills` | authenticated | List skills |
| `POST` | `/skills` | authenticated | Create skill |
| `DELETE` | `/skills/:id` | authenticated | Delete (blocked if in use) |
| `GET` | `/tags` | authenticated | List tags |
| `POST` | `/tags` | authenticated | Create tag |
| `DELETE` | `/tags/:id` | authenticated | Delete tag (system tags protected) |
| `GET` | `/resume` | authenticated | Get resume URL |
| `POST` | `/resume` | authenticated | Upload/replace resume PDF |
| `DELETE` | `/resume` | authenticated | Delete resume |
| `POST` | `/media/upload` | authenticated | Upload image/video/PDF to Cloudinary |
</details>

<details>
<summary><b>Master Admin</b> — user management</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/users` | masterAdmin | List all users |
| `GET` | `/admin/users/:userId` | masterAdmin | Get user detail |
| `DELETE` | `/admin/users/:userId` | masterAdmin | Delete user (cascade) |
</details>

### Public API (no auth required)

Base URL: `https://api.domain.com/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/:userId/projects` | Public projects (supports `?tag=X`, `?limit=N`) |
| `GET` | `/v1/:userId/experience` | Public experience entries |
| `GET` | `/v1/:userId/skills` | Skills as flat string array |
| `GET` | `/v1/:userId/tags` | Tags as flat string array |
| `GET` | `/v1/:userId/resume` | Resume PDF URL |
| `GET` | `/v1/:userId/user-info` | Public profile |

**Response envelope** (all endpoints):
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "statusCode": 200
}
```

---

## 📁 Project Structure

```
stratum-cms/
├── client/                        # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── pages/                # Landing, Login, Signup, Onboarding, NotFound
│   │   ├── dashboard/            # Authenticated screens (Projects, Experience, Skills, etc.)
│   │   ├── admin/                # Master Admin screens (role-gated)
│   │   ├── components/           # Shared UI, ProtectedRoute, RoleGate
│   │   ├── redux/api/            # RTK Query slices (one per module)
│   │   ├── validators/           # Zod schemas (mirrored from backend)
│   │   └── routes/               # React Router config
│   └── vite.config.ts
│
├── server/                        # Express + TypeScript backend
│   ├── prisma/                   # Schema, migrations, seed
│   └── src/
│       ├── controllers/          # HTTP layer (thin, uses asyncHandler)
│       ├── services/             # Business logic (Prisma, Cache, Media)
│       ├── routes/               # Route definitions
│       ├── middleware/           # Auth, Role, Validate, Upload, Error
│       ├── validators/           # Zod schemas (source of truth)
│       ├── utils/                # asyncHandler, ApiError, ResponseEnvelope, JWT, Bcrypt
│       ├── jobs/                 # Scheduled work (blacklist cleanup)
│       └── types/                # TypeScript declarations
│
├── docs/                          # Project knowledge base
│   ├── architecture/             # KB v2.0, API contracts, schema reference, design system
│   ├── ui-ux/                    # UI/UX knowledge base, admin UX specs
│   └── tracking/                 # CHANGELOG, TASKS, ERRORS, DECISIONS
│
├── .claude/                       # Claude Code agent configuration
│   ├── CLAUDE.md                 # Agent memory (loaded every session)
│   ├── rules/                    # Path-scoped coding rules
│   ├── commands/                 # Slash commands (/new-module, /migrate, /sync-validators)
│   ├── skills/                   # Reusable task recipes (CRUD scaffold, auth flow, etc.)
│   └── agents/                   # Subagent definitions (code-reviewer, doc-syncer)
│
├── docker-compose.yml
└── .env.example
```

---

## 🗺️ Roadmap

Stratum CMS follows a 12-phase sequential roadmap. Each phase is independently shippable.

| Phase | Name | Status | Scope |
|-------|------|--------|-------|
| **0** | Project Setup | 🔜 Next | Monorepo scaffold, CORS, health check, FE↔BE verified |
| **1** | Core Backend | ⬚ | Body parser, error handler, asyncHandler, routes scaffolded |
| **2** | Authentication | ⬚ | Signup, login, logout, JWT cookies, blacklist, cascade delete |
| **3** | CRUD + Media | ⬚ | All content modules + Multer → Cloudinary pipeline |
| **4** | Public API | ⬚ | Read-only endpoints at `api.domain.com/v1/:userId/:section` |
| **5** | Master Admin | ⬚ | Role-gated user management (view + delete only) |
| **6** | Security | ⬚ | Route audit, middleware hardening, injection review |
| **-** | Deployment | ⬚ | GitHub Actions, Docker, Vercel + Railway |
| **7** | Polishing | ⬚ | Email (Resend), Markdown rich text, media preview |
| **8** | Testing | ⬚ | Unit + integration tests, CI pipeline |
| **0** | Security Audit | ⬚ | Full vulnerability scan, auth review |
| **10** | Pricing | ⬚ | Stripe + RevenueCat, subscription tiers |
| **11** | SaaS Features | ⬚ | Custom domains, themes, premium tiers (Path A) |
| **12** | Premium | ⬚ | TBD |

---

## 🏛️ Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Auth provider | Custom JWT (not Clerk) | Control, cost, learning value |
| Token storage | httpOnly cookies | XSS-resistant |
| Logout mechanism | PostgreSQL blacklist table | Survives server restarts |
| State management | RTK Query (not Zustand) | Team familiarity, cache invalidation |
| Caching | Node Cache (not Redis) | MVP simplicity |
| Media uploads | Server-mediated (Multer) | Control over validation + Cloudinary interaction |
| User ID format | Opaque nanoid(12) | No PII leakage in public URLs |
| Public API path | Subdomain split | Clean separation from frontend routes |
| SaaS model | Path A (no organizations) | Simpler data model, no tenantId column |
| User deletion | Hard delete with cascade | Cleaner than soft-delete for MVP |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b phase-N/feature-name`)
3. Commit using format: `[Phase N] type: description`
4. Push and open a Pull Request
5. Ensure `CHANGELOG.md` and `TASKS.md` are updated

---

<div align="center">

## 📝 License

MIT

Built by [Vinay](https://github.com/vinay)

</div>