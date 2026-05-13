# Current Architecture — As Implemented

This document reflects the **as-built** state of the project, not the planned/target architecture.

---

## Implemented Components

### Frontend (Client)
- **Framework**: React (Vite)
- **Status**: Initialized (scaffolded, not feature-complete)
- **Path alias**: `@/` → `./src` (configured in `vite.config.js` + `jsconfig.json`)
- **Location**: `/client`

### Backend (Server)
- **Framework**: Express.js + Node.js
- **Status**: Initialized (scaffolded, no routes implemented yet)
- **Path alias**: `@/` → `./src` (configured in `package.json` subpath imports)
- **Location**: `/server`
- **Entry point**: `server.js`

### Database
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Schema location**: `server/prisma/schema.prisma`
- **Status**: Schema not yet defined; no migrations applied; database not connected locally

### Authentication
- **Provider**: Clerk (Google OAuth + email)
- **Status**: Not implemented — planned for Phase 3

### Storage
- **Provider**: Cloudinary (images, PDFs)
- **Status**: Not implemented — planned for Phase 1 (resume upload)

---

## Folder Structure (Current)

```
/stratum-cms
├── /client              # Frontend React app (Vite) — scaffolded
│   ├── /src
│   ├── vite.config.js   # @/ alias configured
│   ├── jsconfig.json    # @/ alias for IDE support
│   └── package.json
│
├── /server              # Backend Express app — scaffolded
│   ├── /prisma          # Schema + migrations (not yet created)
│   ├── server.js        # Entry point
│   └── package.json     # @/ alias via subpath imports
│
├── /docs                # Project documentation — populated
├── /.claude             # Agent configuration — populated
└── .gitignore
```

---

## What Is NOT Yet Implemented
- Prisma schema definition
- Database connection / migrations
- API routes and controllers
- Health check endpoint (`GET /health`)
- Clerk authentication middleware
- Cloudinary integration
- Frontend pages and components
- ESLint + Prettier configuration

---

## Reference
For the target architecture, see:
- `/docs/architecture/technical-architecture.md`
- `/.claude/docs/architecture.md`
