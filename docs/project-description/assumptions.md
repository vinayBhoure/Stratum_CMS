## 7. Assumptions

**Product Assumptions:**
- Users have existing portfolios (not building from scratch)
- Users know how to fetch APIs (basic JS knowledge)
- 90%+ users use React/Next.js (API design optimized for this)
- Primary content update: Projects (higher priority than Blogs)

**Technical Assumptions:**
- Single EC2 instance can handle 10K users (verified with load testing)
- Cloudinary free tier sufficient for MVP (5GB storage, 25GB bandwidth)
- PostgreSQL on EC2 acceptable for Phase 1 (migrate to RDS if needed)
- Public API abuse is low (add rate limiting in Phase 2 if abused)

**User Behavior Assumptions:**
- Users update content monthly (not daily)
- Average user has <20 projects, <50 total items
- API responses <50KB per endpoint (no pagination needed initially)

**Infrastructure Assumptions:**
- Vercel free tier sufficient for frontend (static build)
- EC2 t3.small sufficient for backend (2 vCPU, 2GB RAM)
- No CDN needed initially (API responses cacheable by client)

---