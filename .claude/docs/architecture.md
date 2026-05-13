# Architecture – Stratum CMS

---

## 1. Overview

### System Purpose
Stratum CMS is a **developer-focused headless CMS** that allows users to manage portfolio data via a dashboard and expose it through public APIs for frontend consumption.

### Core Components
- Frontend Dashboard (React)
- Backend API (Node.js + Express)
- Database (PostgreSQL via Prisma)
- Media Storage (Cloudinary)
- Auth System (Clerk)

---

## 2. High-Level Architecture

### Component Breakdown
- **Client (Dashboard)**
  - UI for CRUD operations
  - Consumes backend APIs

- **Backend (API Server)**
  - Handles business logic
  - Exposes REST endpoints
  - Integrates with DB and Cloudinary

- **Database**
  - Stores structured portfolio data

- **Media Storage**
  - Stores images and PDFs externally

- **Portfolio (External Consumer)**
  - Fetches public API data
  - Renders content

---

### Interaction Flow

```text
User → Dashboard (React)
     → Backend API (Express)
     → PostgreSQL (via Prisma)

Portfolio → Public API → Backend → DB → Response → Render

---

## 3. Folder Structure

    /client        → Frontend application (UI, state, API calls)
    /server        → Backend API (routes, controllers, services)
    /.claude       → Agent system (rules, workflows, commands)
    /docs          → Project + engineering documentation
    /scripts       → Utility scripts (setup, deploy, seed)

---

## 4. DataFlow 

### Content Creation Flow

1. User uploads image → Frontend → Cloudinary → Returns URL
2. User saves project → Frontend → POST /api/projects → Backend
3. Backend validates → Saves to PostgreSQL → Returns response
4. Public API (Portfolio) fetches → Reads from PostgreSQL → Renders

### Media Upload Flow

User Upload
→ Backend Endpoint (/upload)
→ Cloudinary Storage
→ URL Returned
→ URL Stored in DB

### Content Consumption Flow

Portfolio (Frontend)
→ GET API Request
→ Backend Fetch
→ DB Query
→ JSON Response
→ UI Render