---
name: zod-validation
description: >
  Guides writing Zod validation schemas and the FE↔BE mirroring strategy for Stratum CMS.
  Use when creating a new validator, modifying an existing schema, or wiring validation
  middleware. Triggers on "add validator", "Zod schema", "validate request",
  "mirror schema", "FE BE validation", or any task involving request body validation.
---

# Zod Validation in Stratum CMS

## Purpose

This skill encodes the decision-making process for writing Zod schemas and keeping them
synchronized between the backend (`/server/src/validators/`) and frontend
(`/client/src/validators/`). It does NOT provide schema templates — it provides the framework
for deciding *what* to validate and *how* to keep both sides in sync.

**Source of truth:**
- Conventions: KB v2.0 §16.1 (coding standards), §10.4 (FE validation)
- Field rules: `api_contracts.md` (per-endpoint validation requirements)
- Architecture: KB v2.0 §14.3 (frontend validators mirror backend exactly)

---

## Core Principle: One Schema Shape, Two Files

There are TWO files per domain — one for backend, one for frontend — but they describe
the SAME shape with the SAME rules. The backend file is the source; the frontend file mirrors it.

```
/server/src/validators/{domain}.schema.ts   ← source of truth
/client/src/validators/{domain}.schema.ts   ← mirrors backend exactly
```

**Why two files instead of a shared package?**
The monorepo doesn't use a shared package (locked decision). This is intentional — keeps each
side independently buildable. The trade-off: manual mirroring discipline.

---

## Step 1 — Find the Validation Rules in API Contracts

Before writing any schema, locate the endpoint in `api_contracts.md`. Every documented endpoint
specifies its validation rules under a "Validation" subsection. For example:

> - `email`: valid email format
> - `password`: min 8 chars, must contain uppercase + lowercase + number
> - `name`: 1–100 chars, trimmed

Translate these rules directly into Zod constraints. Do not invent additional rules. Do not
relax documented rules.

If the endpoint isn't in `api_contracts.md`, stop. Validation rules are a contract decision —
update the contract first.

---

## Step 2 — Decide What Goes in the Schema

A validator schema validates the SHAPE of incoming request data. Not all parts of a request
need a schema:

| Request Part | Validate with Zod? | Notes |
|---|---|---|
| `req.body` (JSON) | ✓ Always for create/update | Skip only for empty-body endpoints (logout) |
| `req.body` (multipart) | ✗ | Multer handles file fields; validate the URL-bearing JSON elsewhere |
| `req.params` | Usually no | Path params are typed by Express; validate manually only if format matters (e.g., nanoid length) |
| `req.query` | ✓ if structured | `?page`, `?limit`, `?tag`, `?filter` — yes. Free-form search strings — usually no |
| `req.user` (from JWT) | ✗ | Trusted; populated by AuthMiddleware |

**Decision rule:** If the field crosses the trust boundary (comes from the client and affects
business logic), it needs a Zod schema.

---

## Step 3 — Apply the 10 Locked Field Constraints

These constraints appear repeatedly across the project. Use these exact bounds (locked in
KB §7 and `api_contracts.md`):

| Field Type | Constraint |
|---|---|
| Project title | max 200 chars |
| Project description | max 5000 chars |
| Experience title/company | max 200 chars |
| Experience description | max 10000 chars |
| Tag name | max 30 chars, regex `^[a-z0-9-]+$` (lowercase, digits, hyphens only) |
| Skill name | max 50 chars |
| User name | 1–100 chars, trimmed |
| Email | standard email format |
| Password | min 8 chars, must contain uppercase + lowercase + number |
| `userId` (where validated) | exactly 12 chars (nanoid length) |

**Do not change these bounds.** They are coordinated across schema, contracts, and UI.

---

## Step 4 — Decide on Strict vs Lenient Parsing

Zod offers `.strict()` (rejects unknown keys) and the default (silently strips them).

**Decision rule for Stratum CMS:**
- **All create/update endpoints:** use `.strict()` — reject unknown keys with `VALIDATION_FAILED`
- **All query schemas:** use default (lenient) — allows future query params without breaking

This prevents accidental data leakage on writes while keeping reads forward-compatible.

---

## Step 5 — Handle Optional vs Nullable Fields

Three distinct Zod patterns mean three different things. Choose deliberately:

| Pattern | Meaning | Use For |
|---|---|---|
| Field present + required | Must be in the request | Required fields like `email`, `password` |
| `.optional()` | Field may be absent from request | Optional create fields, partial updates |
| `.nullable()` | Field must be present but can be `null` | Resetting a value to empty (e.g., clearing a profile picture) |
| `.optional().nullable()` | May be absent OR null | Maximum flexibility — use sparingly |

**Decision rule:** Default to required. Add `.optional()` only when the field is genuinely
not needed. Add `.nullable()` only when the API contract specifies "send null to clear."

---

## Step 6 — Conditional Validation (e.g., activeJob)

Some Stratum CMS fields have conditional rules. The locked example is Experience (KB §7):

- If `activeJob === true` → `durationTo` MUST be null
- If `activeJob === false` → `durationTo` MUST be a valid date

Use Zod's `.refine()` for conditional rules. Always include a clear error message that the
backend will surface via `INVALID_DURATION` error code.

**Decision rule:** Conditional rules go in the Zod schema, not in the service layer. The
schema is the single declarative source of validation truth.

---

## Step 7 — Junction Field Validation (skillIds, tagIds)

Per locked decision D39, project create/update accepts `skillIds[]` and `tagIds[]` arrays.
Validate them at the schema level:

- Each array element must match the expected ID format (12-char string for nanoid)
- Array can be empty (project with no skills/tags is valid)
- Reference existence and ownership checks happen in the SERVICE layer, not the validator —
  the validator only checks shape

If a referenced skill/tag doesn't exist or isn't owned by the user, the service throws
`INVALID_REFERENCE` (per error catalogue).

---

## Step 8 — Mirror the Schema to the Frontend

After writing the backend validator, create or update the frontend mirror:

**What MUST match exactly:**
- Field names
- Field types (string, number, boolean, array, object)
- Constraints (min, max, regex, length)
- Optional/nullable patterns
- `.refine()` rules

**What CAN differ (rare):**
- Frontend may add UI-only fields not sent to the server (e.g., `confirmPassword` for signup)
  These extra fields are stripped before sending to the API.

**What MUST NOT differ:**
- Constraint values (don't allow 6-char passwords on FE if BE requires 8)
- Field types
- Required vs optional status of API-bound fields

---

## Step 9 — Wire the Validator into the Middleware

On the backend, the validator runs as `ValidateMiddleware` BEFORE `AuthMiddleware`
(per KB §11.3). This is deliberate:

- Reject malformed requests early (cheap)
- Don't waste auth verification on requests that will fail validation anyway
- Provides a stable error code (`VALIDATION_FAILED`) regardless of auth status

**Validation failures must always return:**
- HTTP status 400
- Error code `VALIDATION_FAILED`
- `details` field containing the Zod issue list (per `api_contracts.md` §2)

---

## Step 10 — Sync Checklist

Before considering a validator "done," verify:

- [ ] Backend schema file exists in `/server/src/validators/{domain}.schema.ts`
- [ ] Frontend schema file exists in `/client/src/validators/{domain}.schema.ts`
- [ ] Both files declare the same field names
- [ ] Both files use the same constraints (lengths, regex, ranges)
- [ ] Both files use `.strict()` on write schemas
- [ ] All rules match what's documented in `api_contracts.md`
- [ ] If conditional rules exist, both files implement them identically
- [ ] Backend validator is wired into the route via `ValidateMiddleware`
- [ ] Frontend validator is wired into the form (typically via React Hook Form resolver
      or RTK Query mutation hook)

**Run the `doc-syncer` sub-agent after schema changes** to verify FE↔BE drift hasn't crept in.

---

## What This Skill Does NOT Cover

- **Endpoint wiring** → see `api-endpoint` skill
- **Form integration on frontend** → uses React Hook Form patterns (Phase 3+ UI work)
- **Service-layer business logic** → service validates references, ownership, conflicts —
  not shape (that's Zod's job)
