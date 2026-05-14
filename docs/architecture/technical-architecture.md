## 6. Technical Architecture

### 6.1 Tech Stack
**Frontend:**
- Framework: React.js (Vite)
- Language: JavaScript
- Styling: Tailwind CSS + shadcn/ui components
- State: Zustand (global state for user data, forms)
- Routing: React Router
- Validation: Zod (input validation)

**Backend:**
- Runtime: Node.js
- Framework: Express.js
- ORM: Prisma
- Database: PostgreSQL (AWS RDS or self-hosted on EC2)
- Auth: Clerk (session-based)
- Storage: Cloudinary (images, PDFs)
- Email: SendGrid (future-ready, not in MVP)
- Validation: Zod (schema validation)

**Deployment:**
- Frontend: Vercel
- Backend: AWS EC2 (single instance, cost-optimized)
- Database: PostgreSQL on EC2 or RDS (evaluate cost)

---

### 6.2 Architecture Pattern
**Monolith** (single backend service)
- Simple deployment
- Fast iteration
- Cost-efficient for MVP scale
- Stateless API design (easy horizontal scaling later)

**Data Flow:**
```
User (Browser)
  ↓
Dashboard (React on Vercel)
  ↓ (fetch)
Backend API (Express on EC2)
  ↓ (Prisma ORM)
PostgreSQL Database
  
Portfolio Site
  ↓ (public fetch)
Backend API → PostgreSQL
```

---

### 6.3 Folder Structure → Purpose

```
/stratum-cms
├── /client                     # Frontend React app
│   ├── /src
│   │   ├── /components         # Reusable UI (buttons, modals, forms)
│   │   ├── /pages              # Route-level components (Dashboard, Projects, API)
│   │   ├── /features           # Feature-specific logic (ProjectForm, SkillList)
│   │   ├── /services           # API client (fetch wrappers, endpoints)
│   │   ├── /store              # Zustand stores (userStore, projectStore)
│   │   ├── /utils              # Helpers (validation, formatters)
│   │   └── /assets             # Static files (icons, images)
│   ├── vite.config.js          # Vite bundler config
│   └── package.json
│
├── /server                     # Backend Express app
│   ├── /controllers            # Request handlers (projectController.js)
│   ├── /routes                 # API route definitions (projectRoutes.js)
│   ├── /middlewares            # Auth, validation, error handling
│   ├── /services               # Business logic (projectService.js)
│   ├── /prisma                 # ORM schema + migrations
│   │   └── schema.prisma       # Single source of truth for DB models
│   ├── /utils                  # Helpers (logger, response formatters)
│   ├── /config                 # Environment variables, constants
│   └── server.js               # Entry point
│
├── /docs                       # Documentation (architecture, progress, reference)
│   ├── architecture.md         # System design decisions
│   ├── current_architecture.md # As-implemented state
│   ├── progress.md             # Development checklist
│   └── reference.md            # API contracts, data models
│
├── /.claude                    # AI agent context/configuration
├── /rules                      # Linting, code style rules
├── /skills                     # Custom skills/scripts
├── /commands             # Developer workflow automation
│   ├── /analyse-error          # Error debugging helper
│   ├── /create-issue           # GitHub issue creation
│   ├── /git-push-changes       # Automated git workflow
│   ├── /log-change             # Changelog generator
│   ├── /review-code            # Code review automation
│   └── /update-progress        # Progress tracker update
│
└── /sub-agents                 # AI sub-agent definitions (CLAUDE.md)
```

**Key Patterns:**
- **Controllers:** Thin layer, delegates to services
- **Services:** Business logic, Prisma queries
- **Middlewares:** Auth (Clerk), validation (Joi/Zod), error handling
- **API versioning:** `/api/v1/` prefix for future compatibility

---

### 6.4 Database Models (High-Level)

**Core Entities:**
- `User` (id, clerkUserId, username, email, createdAt)
- `Project` (id, userId, title, description, techStack[], githubUrl, liveUrl, tags[], imageUrl)
- `Experience` (id, userId, company, role, startDate, endDate, description, location)
- `Skill` (id, userId, name, proficiency, category)
<!-- - `Blog` (id, userId, title, content, publishDate, tags[], featuredImageUrl) -->
- `Contact` (id, userId, email, linkedin, github, twitter, portfolioUrl)
- `Resume` (id, userId, pdfUrl, uploadedAt)

**Relationships:**
- User has many Projects, Experience, Skills
- User has one Contact
- User has one Resume

**Schema Constraints:**
- Fixed structure (no dynamic fields)
- User cannot customize models
- All fields predefined in Prisma schema

---

### 6.5 API Design

**Base URL:**
```
https://api.stratumcms.com/api/v1/
```

**Endpoints (Public GET):**
```
GET /:username/projects      → Returns all user projects
GET /:username/experience    → Returns work history
GET /:username/skills        → Returns skills list
<!-- GET /:username/blogs         → Returns blog posts -->
GET /:username/contact       → Returns contact info
GET /:username/resume        → Returns resume PDF URL
```

**Endpoints (Authenticated POST/PUT/DELETE):**
```
POST   /projects       → Create new project
PUT    /projects/:id   → Update project
DELETE /projects/:id   → Delete project
(Repeat for experience, skills, contact, resume)
```

**Upload:**
```
POST /upload           → Upload file to Cloudinary, return URL
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error Format:**
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