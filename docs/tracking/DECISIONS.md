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

**D-API-02 — Delete-account route is `DELETE /api/v1/auth/account`:** The locked contract `api_contracts.md §3.4` specifies `/auth/account`. The README API table previously listed `/auth/delete-account`; the implementation and contract use `/account`. **Rationale:** `api_contracts.md` is the locked source of truth between backend and frontend. **Status:** Locked (Phase 2). **Action:** README table corrected to `/auth/account` (2026-05-27 doc-sync pass).

---

## Security Decisions

**D-SEC-01 — Password hashing uses `bcryptjs` (pure JS), 12 rounds:** Chose `bcryptjs` over the native `bcrypt` addon. **Rationale:** avoids the node-gyp / native build toolchain on Windows; same API; performance is adequate for this scale. 12 rounds exceeds the auth-flow skill's 10+ floor. **Status:** Locked (Phase 2).

**D-SEC-02 — JWT payload is minimal `{ userId, role }`, 7-day TTL, httpOnly cookie:** Token carries only `userId` and `role` (plus iat/exp); mutable fields (name, email) are always read from the DB. Stored in the `stratum_token` httpOnly cookie, never the response body. Cookie attributes are per-environment (`secure`/`sameSite` differ prod vs dev) from a single config helper. **Rationale:** smaller payload verified on every request; minimizes PII exposure; matches `api_contracts.md §1.3`. **Status:** Locked (Phase 2).

**D-SEC-03 — Logout/delete revoke via PostgreSQL `token_blacklist`; login does not reveal user existence:** Logout and account deletion insert the current token into `token_blacklist` (checked by AuthMiddleware → `TOKEN_REVOKED`); a 7-day cleanup job purges expired entries. Login returns the same `INVALID_CREDENTIALS` for both unknown email and wrong password. **Rationale:** revocation survives server restarts; uniform login error prevents email enumeration. **Status:** Locked (Phase 2).
