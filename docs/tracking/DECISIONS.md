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

## Phase 3 Decisions

**D-P3-01 — Duration rule enforced in service layer, throws `INVALID_DURATION`:** The `activeJob`/`durationTo` conditional (`activeJob=true → durationTo must be null`; `activeJob=false → durationTo required and after durationFrom`) is enforced in `ExperienceService.assertDuration()` which throws `ApiError(400, "INVALID_DURATION", ...)`. **Rationale:** the dedicated `INVALID_DURATION` code exists in the locked error catalogue (§2) precisely for this case; service-level enforcement keeps the validator schema simple and matches the `schema.prisma` comment. **Status:** Locked (Phase 3).

**D-P3-02 — Certificate change detection by `url` field:** On `PUT /experience/:id`, existing certificates are matched to incoming entries by `url`. If the `url` is found, `updatedAt` is preserved unless `name` or `isActive` changed; new `url` entries get `updatedAt: now()`. **Rationale:** `url` is the stable identity for a certificate (Cloudinary asset URL); `name` can be edited without creating a new asset. **Status:** Locked (Phase 3).

**D-P3-03 — Old Cloudinary assets deleted on resume replace/delete; project `mediaUrl` orphans deferred:** `ResumeService` parses `public_id` from the stored Cloudinary URL and calls `cloudinary.uploader.destroy` before replacing or deleting. Project `mediaUrl` and experience certificate assets are NOT cleaned up on update/delete — orphaned assets are a Phase 6 cleanup job concern. **Rationale:** resume is a single-asset replace; project/experience URLs can be shared or referenced externally, making eager deletion risky without a dedicated orphan tracking column. **Status:** Locked (Phase 3).

**D-P3-04 — Prisma `$transaction` write-only; reads moved outside transaction:** Junction create/update sequences use `prisma.$transaction()` for write atomicity but the final `findUniqueOrThrow` (with `include`) runs outside the transaction block. **Rationale:** interactive transaction default timeout is 5 s; an additional read inside a multi-step write transaction consistently triggered `Transaction already closed` on Neon Postgres. Write atomicity is preserved; the post-transaction read is safe because the writes committed. **Status:** Locked (Phase 3).

---

## Phase 4 Decisions

**D-P4-01 — Drop `NO_DATA`; lists return `[]`, singulars return `null`:** Empty list sections (`projects`, `experience`, `skills`, `tags`) return `success:true, data:[], error:null, 200`. Absent singular sections (`user-info`, `resume`) return `success:true, data:null, error:null, 200`. The `NO_DATA` error code from `api_contracts §9.3` is **not implemented**. **Rationale:** consistent with existing Phase 3 patterns (e.g. `resume.service.ts` returns `null`); avoids a `success:true` + populated `error` envelope, which contradicts the envelope contract. **Status:** Locked (Phase 4). **Supersedes:** `api_contracts.md §12` `NO_DATA` references.

**D-P4-02 — Phase 4 is backend-only; `publicApi` RTK slice drafted as FE handoff:** No frontend UI is built in Phase 4. The RTK Query slice file `client/src/redux/api/publicApi.ts` is committed as a draft for the FE team — not wired into the store. **Rationale:** mirror the backend-first workflow of Phases 1–3. **Status:** Locked (Phase 4).

**D-P4-03 — Node Cache with 600s TTL + `Cache-Control: public, max-age=600`:** Public API responses cached in-process via `node-cache` (600s TTL, keyed `userId:section:queryHash`). `Cache-Control: public, max-age=600` set on all `/v1` responses. TTL-only — no explicit bust on private-API mutations (≤600s staleness acceptable for MVP portfolio data). **Rationale:** zero extra infrastructure; clean migration path to Redis on scale-out. **Status:** Locked (Phase 4). **Supersedes:** `KB v2 §9.4` (TTL was TBD).

**D-P4-04 — Public router mounted at root `/v1`, host-agnostic; open CORS scoped to `/v1`:** `publicRouter` mounted at `app.use("/v1", ...)` with `cors({ origin: "*" })` applied only to that path prefix. The `/api/v1` authenticated surface retains its `origin: env.clientUrl` lock. Subdomain (`api.domain.com`) handled at deploy/proxy layer. **Rationale:** simplest local dev, no host-config in app code, trivially testable. **Status:** Locked (Phase 4). **Supersedes:** `KB v2 §9.1` subdomain assumption.

**D-P4-05 — Public tags endpoint returns tags in use on user's projects:** `GET /v1/:userId/tags` returns distinct tags applied to at least one of the user's projects (not all tags in the user's registry). **Rationale:** portfolio site filter buttons should reflect content that actually exists; showing tags with no associated projects would create empty filter states. **Status:** Locked (Phase 4).

---

## Security Decisions

**D-SEC-01 — Password hashing uses `bcryptjs` (pure JS), 12 rounds:** Chose `bcryptjs` over the native `bcrypt` addon. **Rationale:** avoids the node-gyp / native build toolchain on Windows; same API; performance is adequate for this scale. 12 rounds exceeds the auth-flow skill's 10+ floor. **Status:** Locked (Phase 2).

**D-SEC-02 — JWT payload is minimal `{ userId, role }`, 7-day TTL, httpOnly cookie:** Token carries only `userId` and `role` (plus iat/exp); mutable fields (name, email) are always read from the DB. Stored in the `stratum_token` httpOnly cookie, never the response body. Cookie attributes are per-environment (`secure`/`sameSite` differ prod vs dev) from a single config helper. **Rationale:** smaller payload verified on every request; minimizes PII exposure; matches `api_contracts.md §1.3`. **Status:** Locked (Phase 2).

**D-SEC-03 — Logout/delete revoke via PostgreSQL `token_blacklist`; login does not reveal user existence:** Logout and account deletion insert the current token into `token_blacklist` (checked by AuthMiddleware → `TOKEN_REVOKED`); a 7-day cleanup job purges expired entries. Login returns the same `INVALID_CREDENTIALS` for both unknown email and wrong password. **Rationale:** revocation survives server restarts; uniform login error prevents email enumeration. **Status:** Locked (Phase 2).
