## 5. Features

### 5.1 Authentication (P0 - MVP Critical)
**What:** Clerk-powered auth with Google OAuth + email login  
**Why:** Zero custom auth implementation, battle-tested security  
**Details:**
- Session-based authentication
- Automatic username generation from email/Google profile
- Redirect to dashboard on success
- Logout functionality

---

### 5.2 Projects Dashboard (P0 - MVP Critical)
**What:** CRUD interface for portfolio projects  
**Why:** Primary use case, highest update frequency  
**Fields:**
- Title (string, required, max 100 chars)
- Description (textarea, max 500 chars)
- Tech Stack (array of strings, max 10 items)
- GitHub URL (string, optional, URL validation)
- Live URL (string, optional, URL validation)
- Tags (array of strings)
- Image (Cloudinary URL)

**UI:**
- Card-based list view
- Modal/drawer for add/edit
- Inline delete with confirmation
- Drag-to-reorder (future)

---

### 5.3 Experience Dashboard (P0 - MVP Critical)
**What:** Work history management  
**Why:** Essential portfolio component  
**Fields:**
- Company (string, required)
- Role (string, required)
- Duration (start/end dates or "Present")
- Description (textarea, rich text optional)
- Location (string, optional)

---

### 5.4 Skills Dashboard (P1 - MVP Important)
**What:** Tech stack + skill proficiency  
**Why:** Common portfolio section  
**Fields:**
- Skill Name (string, required)
- Proficiency (enum: Beginner/Intermediate/Advanced/Expert)
- Category (string, e.g., "Frontend", "Backend")

---

<!-- ### 5.5 Blogs Dashboard (P1 - MVP Important)
**What:** Blog post management with rich text  
**Why:** Differentiator for content-focused portfolios  
**Fields:**
- Title (string, required)
- Content (rich text editor)
- Publish Date (date)
- Tags (array)
- Featured Image (Cloudinary URL, optional)

**Editor:** TipTap or similar (Markdown fallback acceptable) -->

---

### 5.6 Contact Dashboard (P1 - MVP Important)
**What:** Social links + email  
**Why:** Common portfolio footer section  
**Fields:**
- Email (string, validated)
- LinkedIn (URL)
- GitHub (URL)
- Twitter (URL)
- Portfolio URL (URL)

---

### 5.7 Resume Upload (P1 - MVP Important)
**What:** PDF resume hosting  
**Why:** Common portfolio need  
**Details:**
- Upload PDF to Cloudinary
- Store URL in DB
- Return URL via API
- Single resume per user (replace on re-upload)

---

### 5.8 Public REST API (P0 - MVP Critical)
**What:** Read-only endpoints for portfolio consumption  
**Why:** Core product value  
**Endpoints:**
- `GET /api/v1/:username/projects`
- `GET /api/v1/:username/experience`
- `GET /api/v1/:username/skills`
<!-- - `GET /api/v1/:username/blogs` -->
- `GET /api/v1/:username/contact`
- `GET /api/v1/:username/resume`

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "error": null
}
```

**Constraints:**
- No authentication (public read)
- Username must exist (404 if not)
- Return empty array if no data

---

### 5.9 API Documentation Page (P0 - MVP Critical)
**What:** In-dashboard API integration guide  
**Why:** Bridges CMS → portfolio integration  
**Content:**
- Base URL with user's actual username
- Endpoint list with example responses
- Copy-paste fetch code snippets
- Language tabs (JavaScript/Python/cURL)

---

### 5.10 File Upload (P0 - MVP Critical)
**What:** Cloudinary integration for images/PDFs  
**Why:** Avoid local storage, reduce backend complexity  
**Details:**
- Direct upload to Cloudinary from client
- Return URL to backend
- Store URL in DB (not file itself)
- Supported formats: JPG, PNG, WebP, PDF

---
