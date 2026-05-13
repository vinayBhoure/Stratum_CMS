# Stratum CMS - Product Requirements Document

**Version:** 1.0  
**Date:** April 18, 2026  
**Status:** MVP Phase  
**Owner:** Engineering + Product

---

## 1. Overview

### 1.1 Problem
Developers with portfolios spend unnecessary time on infrastructure instead of showcasing work:
- Content hardcoded in frontend components
- Every update requires code changes + redeployment
- Must build and maintain custom backend (DB, admin panel, APIs, auth)
- High friction for simple content updates (project descriptions, resume links, blog posts)

### 1.2 Solution
**Stratum CMS** is a developer-focused headless CMS that eliminates portfolio backend work:
- Pre-built admin dashboard for structured content entry
- Public REST API with zero-config integration (copy-paste URL)
- Instant content updates without code changes or deployments
- File hosting via Cloudinary (images, PDFs)

### 1.3 Target Users
**Primary:** Junior developers (0–3 years experience)
- Already have a portfolio (React/Next.js/static HTML)
- Comfortable consuming APIs, not building CMS infrastructure
- Want to focus on projects, not plumbing

**User Job-to-be-Done:**  
> "I want to update my portfolio content quickly without touching code or redeploying."

### 1.4 Success Metrics (Phase 1)
- **Activation:** User adds first project within 10 minutes of signup
- **Integration:** User fetches API data in their portfolio within first session
- **Retention:** 60%+ users return to update content within 30 days
- **Performance:** API response time <300ms (p95)

---

## 2. Goals & Metrics

### Business Goals
1. Reduce time-to-portfolio-update from hours → minutes
2. Eliminate backend development as barrier to portfolio maintenance
3. Enable 1K–10K users on single EC2 instance (cost-efficient MVP)

### Technical Goals
- API response time: <300ms (p95)
- Dashboard perceived latency: <100ms
- 99%+ uptime
- Zero-config API integration (no SDK, no API keys in Phase 1)

### User Goals
- Add/edit content via UI in <2 minutes per item
- Integrate API into portfolio in <10 minutes total
- See changes reflected on portfolio refresh (no cache delays)

---

## 3. Scope

### ✅ MVP (Phase 1)
**Core Features:**
- User authentication (Clerk: Google OAuth + email)
- Dashboard with structured forms for:
  - Projects (title, description, tech stack, GitHub/live URLs, tags, image)
  - Experience (company, role, duration, description)
  - Skills (name, proficiency level, category)
  - Contact (email, LinkedIn, GitHub, Twitter)
  - Resume (PDF upload via Cloudinary)
- Public REST API endpoints (`/api/v1/:username/projects`, etc.)
- Image/PDF upload to Cloudinary (store URLs only)
- API documentation page (copy-paste integration guide)

**Technical:**
- Monolith backend (Express + Prisma + PostgreSQL)
- React frontend (Vite + Tailwind + shadcn/ui)
- Zustand state management
- Fixed schema (no user customization)
- Public API (no authentication on GET endpoints)

**Constraints:**
- No GitHub auto-sync
- No analytics dashboard
- No draft/publish system
- No multi-portfolio support
- No rate limiting (basic input validation only)

### ❌ Out of Scope (Phase 1)
- API authentication/keys
- Resume parsing (auto-extract structured data from PDF)
- Schema customization by users
- GitHub repository auto-import
- Analytics (page views, API usage)
- Multi-portfolio management
- Draft/publish toggle
- Advanced security (rate limiting, DDoS protection)

### 🔮 Future Scope (Phase 2+)
- Blogs (title, content with rich text, publish date, tags)
- GitHub integration (auto-import repos → projects)
- API key generation + rate limiting
- Resume parser (PDF → structured experience/skills)
- Usage analytics dashboard
- Draft/publish workflow
- Multi-portfolio support (separate public URLs)
- Webhook notifications
- Custom domain support

---

## 4. User Flow

### 4.1 Onboarding Flow (Critical Path)
1. **Landing:** User visits `stratumcms.com`
2. **CTA:** Clicks "Get Started"
3. **Auth:** Chooses Google OAuth or email login (Clerk)
4. **Redirect:** On success → dashboard home
5. **First Action:** Sees sidebar navigation + empty state prompt

### 4.2 Content Management Flow (Example: Projects)
1. **Navigate:** User clicks "Projects" in sidebar
2. **Add:** Clicks "Add New Project" button
3. **Form:** Fills fields:
   - Title (required, max 100 chars)
   - Description (textarea, max 500 chars)
   - Tech Stack (multi-input tags, max 10)
   - GitHub URL (optional, URL validation)
   - Live URL (optional, URL validation)
   - Tags (multi-input)
   - Image Upload:
     - Click upload → select file
     - File sent to Cloudinary
     - URL returned → stored in DB
4. **Save:** Clicks "Save" button
5. **Feedback:**
   - Success toast appears
   - Project card appears in list view
   - Can edit/delete from list

### 4.3 API Integration Flow
1. **Navigate:** User clicks "API" in sidebar
2. **View Docs:** Sees:
   - Base URL: `https://api.stratumcms.com/api/v1/`
   - Endpoint list with descriptions
   - Example fetch code
3. **Copy:** Clicks "Copy" button on `/projects` endpoint
4. **Integrate:** Pastes into portfolio code:
   ```js
   useEffect(() => {
     fetch("https://api.stratumcms.com/api/v1/vinay/projects")
       .then(res => res.json())
       .then(setProjects);
   }, []);
   ```
5. **Verify:** Refreshes portfolio → sees projects rendered

---

## 5. Features

---

## 6. Technical Architecture

---

## 7. Assumptions

---

## 8. Risks & Mitigation

---

## 9. Future Improvements (Phase 2+)

### Priority 1 (Next Release)
- **API Authentication:** JWT tokens, rate limiting (100 req/hour)
- **Draft/Publish:** Toggle projects between draft and live
- **GitHub Sync:** Auto-import repos → projects (metadata from README)

### Priority 2 (6-12 Months)
- **Resume Parser:** PDF → structured experience/skills (AI-powered)
- **Analytics Dashboard:** API usage, popular endpoints, traffic sources
- **Multi-Portfolio:** Separate URLs per portfolio (e.g., `/work`, `/personal`)

### Priority 3 (12+ Months)
- **Custom Domains:** `api.yourportfolio.com` instead of `stratumcms.com`
- **Webhooks:** Notify portfolio on content updates (real-time refresh)
- **Schema Extensions:** Allow limited custom fields (Phase 3 research)
- **Collaboration:** Share dashboard access (team portfolios)

### Nice-to-Have (Backlog)
- Mobile app (React Native)
- Markdown export (download all content)
- Import from LinkedIn (scrape work history)
- A/B testing for portfolios
- SEO recommendations based on content

---

## 10. Validation & Success Criteria

### MVP Launch Checklist
**Must-Have Before Launch:**
- [ ] User can sign up via Google OAuth
- [ ] User can add/edit/delete projects
- [ ] Public API returns projects via `GET /api/v1/:username/projects`
- [ ] Image upload to Cloudinary works
- [ ] Dashboard loads in <2 seconds
- [ ] API responds in <300ms (p95)
- [ ] No critical security vulnerabilities (basic input validation)

**Success Metrics (30 Days Post-Launch):**
- 100+ signups
- 60%+ activation (add at least 1 project)
- 40%+ integration (fetch API in portfolio)
- <5% error rate on API calls
- 99%+ uptime

---

## Appendix: Quick Reference

### Key URLs
- Landing: `stratumcms.com`
- Dashboard: `app.stratumcms.com`
- API Base: `api.stratumcms.com/api/v1/`

### Development Commands
```bash
# Frontend
cd client && npm run dev

# Backend
cd server && npm run dev

# Database
npx prisma migrate dev
npx prisma studio
```

### Core Dependencies
- Frontend: `react`, `react-router-dom`, `zustand`, `tailwindcss`, `shadcn/ui`, 'zod',
- Backend: `express`, `@prisma/client`, `@clerk/clerk-sdk-node`, `cloudinary`

---

**Document End**  
*For technical implementation details, see `/docs/architecture.md` and Prisma schema.*