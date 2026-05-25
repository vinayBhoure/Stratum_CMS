---
name: auth-flow
description: >
  Guides implementing authentication in Stratum CMS — JWT signing, httpOnly cookies,
  blacklist verification, and the AuthMiddleware chain. Use when building any auth endpoint
  (signup, login, logout, session check, account deletion), wiring AuthMiddleware,
  or troubleshooting auth issues. Triggers on "auth", "JWT", "login", "logout",
  "cookie", "session", "blacklist", or any Phase 2 work.
---

# Authentication Flow in Stratum CMS

## Purpose

This skill encodes the decision-making process for implementing Stratum CMS's custom
JWT-cookie authentication. It does NOT provide code templates — it provides the framework
for deciding *how* each auth concern fits together and *why* the locked choices were made.

**Source of truth:**
- Architecture: KB v2.0 §6 (Authentication & Authorization)
- Endpoints: `api_contracts.md` §3 (Auth Module)
- Decisions: KB v2.0 §18 (D1, D2, D3, D42, D53, D54)

---

## Core Principles (Locked, Non-Negotiable)

1. **Custom JWT, not Clerk.** Auth is implemented in-house (decision D1).
2. **JWT lives in an httpOnly cookie**, never in localStorage or response body (D2).
3. **Logout uses a PostgreSQL blacklist table**, not in-memory cache (D3).
4. **Hard delete with cascade** on account removal — no soft delete (D4).
5. **No forgot-password until Phase 7.** Email infra isn't in scope yet.

If any future request conflicts with these, surface to the developer — do not silently override.

---

## Step 1 — Understand the Cookie Configuration

Per locked decision D42, cookie attributes differ between environments:

| Attribute | Production | Development |
|---|---|---|
| `name` | `stratum_token` | `stratum_token` |
| `httpOnly` | `true` | `true` |
| `secure` | `true` | `false` |
| `sameSite` | `'none'` | `'lax'` |
| `maxAge` | 7 days | 7 days |
| `path` | `/` | `/` |

**Why `sameSite: 'none'` in production?**
Because the production setup is cross-domain — frontend on Vercel, backend on Railway,
public API on `api.domain.com`. Cookies need to travel cross-site, which requires
`sameSite: 'none'` + `secure: true`.

**Why `sameSite: 'lax'` in development?**
Localhost is same-origin enough for `lax` to work. `secure: true` would fail on `http://localhost`.

**Decision rule:** Read environment from a single source (env config). Do not hardcode
attribute values. The cookie helper should accept an env flag and apply the right preset.

---

## Step 2 — Decide What Goes Inside the JWT

The JWT payload must be MINIMAL. It is verified on every authenticated request.

**Include only:**
- `userId` — the opaque nanoid(12)
- `role` — `'user'` or `'masterAdmin'`
- Standard JWT claims (`iat`, `exp`)

**Do NOT include:**
- Email (PII, not needed for auth checks)
- Name (mutable, not needed for auth checks)
- Any content data
- The user's own auth record ID (`userId` already identifies them)

**Why minimize?**
Smaller payload = smaller cookie = faster verification on every request. Anything else can
be fetched server-side via `userId` if needed.

---

## Step 3 — Wire the Signup Flow

The signup flow has a strict sequence (per `api_contracts.md` §3.1):

1. Run Zod validation on `req.body` (email, password, name)
2. Check if email already exists → if yes, throw `EMAIL_EXISTS` (409)
3. Hash the password with Bcrypt (10+ rounds)
4. Generate `userId` using `NanoIdUtil` (length 12)
5. Create the `Auth` row AND `UserInformation` row in a transaction
   (they are 1-to-1 and must always coexist)
6. Sign a JWT containing `{ userId, role: 'user' }`
7. Set the cookie via `res.cookie('stratum_token', token, cookieOptions)`
8. Return the envelope with `{ userId, name, role }` (no token in body — it's in the cookie)
9. Status 201

**Decision rule:** Steps 2 and 5 are transactional concerns. Use Prisma's `$transaction`
to ensure either both rows are created or neither is.

---

## Step 4 — Wire the Login Flow

The login flow (per `api_contracts.md` §3.2):

1. Run Zod validation on `req.body` (email, password)
2. Look up the `Auth` row by email
3. If not found OR password doesn't match (Bcrypt compare) → throw `INVALID_CREDENTIALS` (401)
4. Sign a JWT containing `{ userId, role }`
5. Set the cookie
6. Return the envelope with `{ userId, name, role }`
7. Status 200

**Critical security rule:** Steps 2 and 3 must NOT differentiate between "user doesn't exist"
and "password is wrong" in the error message. Both return `INVALID_CREDENTIALS`. This prevents
email enumeration attacks.

---

## Step 5 — Wire the Logout Flow

Logout is more involved than it looks because of the blacklist.

The flow (per `api_contracts.md` §3.3):

1. Verify the JWT (handled by AuthMiddleware)
2. Insert the current token into the `TokenBlacklist` table
3. Clear the cookie via `res.clearCookie('stratum_token', cookieOptions)`
   - Cookie options MUST match the original Set-Cookie options or the browser may
     not actually clear it
4. Return envelope with `{ message: 'Logged out' }`
5. Status 200

**Why blacklist instead of just clearing the cookie?**
A user who logs out and walks away from a public computer could have their old cookie
copied. The blacklist ensures that even a recovered cookie can't authenticate.

---

## Step 6 — Implement AuthMiddleware

`AuthMiddleware` runs on every authenticated route. Its job:

1. Read `stratum_token` from `req.cookies`
2. If absent → throw `UNAUTHENTICATED` (401)
3. Verify the JWT signature and expiry (via `JwtUtil`)
4. If invalid or expired → throw `INVALID_TOKEN` (401)
5. Check if the token exists in `TokenBlacklist`
6. If blacklisted → throw `TOKEN_REVOKED` (401)
7. Attach `req.user = { userId, role }` for downstream consumers
8. Call `next()`

**Decision rule:** Step 5 is the expensive one — it's a DB query on every request. Two
optimizations to consider:
- Index `token_blacklist.token` (already in schema)
- For very high traffic, consider an in-memory mirror with TTL — but not for MVP

---

## Step 7 — Implement RoleMiddleware

`RoleMiddleware` runs AFTER `AuthMiddleware` on admin-only routes (KB §11.3).

The flow:
1. Assume `req.user` is populated (AuthMiddleware ran first)
2. Check `req.user.role === 'masterAdmin'`
3. If not → throw `FORBIDDEN` (403)
4. Call `next()`

**Decision rule:** Never combine AuthMiddleware and RoleMiddleware into a single middleware.
Keeping them separate makes the middleware chain readable and allows AuthMiddleware to be
reused on non-admin routes.

---

## Step 8 — Wire the Session Endpoint

`GET /api/v1/auth/session` exists for frontend rehydration on app boot (decision D53).

The flow:
1. AuthMiddleware verifies the cookie (this endpoint requires auth)
2. Service fetches the latest user data from DB (name may have changed since JWT was signed)
3. Return envelope with `{ userId, name, role }`

**Decision rule:** The frontend should call this on app boot to verify the cookie is still
valid and refresh user data in Redux. Don't trust the JWT payload as the current source of
truth for mutable fields like `name`.

---

## Step 9 — Wire Account Deletion

Account deletion requires extra friction (decision D54): the user must re-confirm their password.

The flow (per `api_contracts.md` §3.4):

1. AuthMiddleware verifies the cookie
2. Zod validation requires `{ password: string }` in the request body
3. Service fetches the user's Auth row
4. Bcrypt-compare the submitted password against the stored hash
5. If mismatch → throw `INVALID_CREDENTIALS` (401)
6. Begin transaction:
   - Add current token to blacklist (prevents the still-set cookie from working)
   - Delete the Auth row (cascades to all content per schema `onDelete: Cascade`)
7. Clear the cookie
8. Return envelope with `{ message: 'Account deleted' }`

**Critical:** Step 6's cascade is what wipes every project, experience, skill, tag, resume,
and the UserInformation row. The cascade is declared in `schema.prisma` (KB §12) — your
service doesn't need to manually delete dependents.

---

## Step 10 — The Blacklist Cleanup Job

The blacklist would grow indefinitely without cleanup. The `BlacklistCleanupJob` runs daily
and removes entries older than the JWT lifetime (7 days).

**Decision rule:** The job is in `/server/src/jobs/blacklistCleanup.ts`. For Phase 2, it's
acceptable to register it as a stub. Wire actual scheduling (e.g., node-cron) in Phase 6
during the security pass.

---

## Common Auth Pitfalls (Pre-Flight Checklist)

Before considering auth code done, verify:

- [ ] Cookie attributes match per-environment presets (don't hardcode)
- [ ] JWT payload contains ONLY `userId` and `role` (plus standard claims)
- [ ] Login does not distinguish "user not found" from "wrong password"
- [ ] Logout adds to blacklist AND clears cookie
- [ ] `res.clearCookie()` is called with the SAME options as `res.cookie()`
  (otherwise it won't clear in some browsers)
- [ ] AuthMiddleware checks blacklist on every protected request
- [ ] AuthMiddleware order: cookie → verify → blacklist → attach `req.user`
- [ ] RoleMiddleware is separate from AuthMiddleware and runs AFTER it
- [ ] Account deletion requires password re-confirmation
- [ ] Account deletion blacklists the current token before deleting the user
- [ ] No `userId` is ever accepted from the request body on authenticated content endpoints —
      always derived from `req.user.userId`
- [ ] `JWT_SECRET` is in env vars, never committed
- [ ] Frontend uses `credentials: 'include'` on all fetch/RTK Query calls
- [ ] CORS middleware allows credentials AND specifies the exact origin (no wildcards)

---

## What This Skill Does NOT Cover

- **General endpoint wiring** → see `api-endpoint` skill
- **Validator details** → see `zod-validation` skill
- **Frontend session management** → use the session endpoint + RTK Query on app boot
- **Forgot password / email verification** → Phase 7, not yet
- **OAuth (GitHub, Google)** → designed in UI but non-functional until Phase 7
- **Master Admin endpoints** → Phase 5, but RoleMiddleware described here covers the gate
