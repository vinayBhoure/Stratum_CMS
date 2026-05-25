# Stratum CMS — Decision Log

## Table of Contents

- [Architecture Decisions](#architecture-decisions)
- [Database Decisions](#database-decisions)
- [Frontend Decisions](#frontend-decisions)
- [API Decisions](#api-decisions)
- [Security Decisions](#security-decisions)

---

## Architecture Decisions

<!-- Format: **DXX — Title:** decision. **Rationale:** ... **Status:** Locked / Open -->

---

## Database Decisions

---

## Frontend Decisions

---

## API Decisions

**D-API-01 — NOT_IMPLEMENTED error code added to catalogue:** Phase 1 scaffolded dummy controllers that return a real `ResponseEnvelope` with a `501` status. This required adding `NOT_IMPLEMENTED | 501` to the error code catalogue in `api_contracts.md §2`. **Rationale:** Using a real envelope (rather than an empty stub) exercises the error pipeline end-to-end and makes stub routes immediately testable. The code is temporary — each domain's stubs are replaced with real logic in Phase 2–5 and removed from the catalogue at that point. **Status:** Locked (Phase 1).

---

## Security Decisions
