## 8. Risks & Mitigation

### 8.1 Security Risks
**Risk:** Public API enables data scraping  
**Mitigation:**
- Rate limiting (Phase 2)
- Monitor unusual traffic patterns
- No sensitive data in public endpoints

**Risk:** XSS via rich text editor (Blogs)  
**Mitigation:**
- Sanitize HTML on backend (DOMPurify or similar)
- Validate content length limits

**Risk:** Malicious file uploads (resume, images)  
**Mitigation:**
- Cloudinary handles validation
- Restrict file types (MIME type check)
- Max file size: 5MB

---

### 8.2 Performance Risks
**Risk:** API response time degrades with user growth  
**Mitigation:**
- Index DB on `username` field
- Pagination for large datasets (>100 items)
- Cache frequently accessed data (Redis in Phase 2)

**Risk:** Cloudinary bandwidth overage  
**Mitigation:**
- Monitor usage via dashboard
- Compress images client-side before upload
- Migrate to S3 if costs exceed $50/month

---

### 8.3 Operational Risks
**Risk:** Single EC2 instance = single point of failure  
**Mitigation:**
- Auto-restart on crash (PM2 or systemd)
- Database backups (daily automated snapshots)
- Monitoring (health check endpoint)

**Risk:** Clerk service outage blocks auth  
**Mitigation:**
- Graceful degradation (show error message)
- Email login fallback available

---

### 8.4 Product Risks
**Risk:** Users expect schema customization (not in MVP)  
**Mitigation:**
- Clear messaging: "Fixed schema, optimized for speed"
- Survey users for Phase 2 priorities

**Risk:** Integration friction (users struggle with API setup)  
**Mitigation:**
- Copy-paste code snippets in dashboard
- Video tutorial on landing page
- Example portfolio GitHub repo