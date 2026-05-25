---
globs: "client/src/**/*.{ts,tsx}"
---

# Frontend Rules — Stratum CMS (React + Vite + Tailwind)

## State Management
- RTK Query for all server state. No local state (useState, Zustand, context) for data that comes from the API.
- Each backend module has exactly one RTK Query API slice in `/redux/api/`. Do not create multiple slices for the same module.
- All API calls must include `credentials: 'include'` on the base query. This is configured once in `baseApi.ts` — do not override it per endpoint.
- Use RTK Query's tag-based cache invalidation. Follow the tag mapping in `api_contracts.md` §13. Do not manually refetch.

## Validation
- Zod schemas in `/client/src/validators/` must mirror `/server/src/validators/` exactly — same field names, same types, same constraints (min, max, regex).
- Frontend may add UI-only fields not sent to the server (e.g., `confirmPassword`). These must be stripped before the API call.
- Never relax a constraint on the frontend that the backend enforces. If the backend requires min 8 chars, the frontend must also require min 8 chars.

## Routing & Auth
- Public routes (`/`, `/login`, `/signup`, `/onboarding`) must not use `ProtectedRoute`.
- Authenticated routes (`/dashboard/*`) must be wrapped in `ProtectedRoute`.
- Admin routes (`/admin/*`) must be wrapped in both `ProtectedRoute` and `RoleGate`.
- `/dashboard` and `/admin` are sibling top-level sections, never nested inside each other.

## Design System
- Use Tailwind utility classes from `design.md` tokens. Do not invent custom colors, shadows, or spacing values outside the design system.
- Primary accent is `emerald-500`. No other accent colors unless `design.md` is updated first.
- Cards use borders, not shadows. Do not add `shadow-*` classes to card components.
- Maximum one primary (emerald) button per page. Additional actions use secondary or ghost buttons.
- Icons use Lucide from React Icons, inherit `currentColor`, sized at 16/20/24px per context.
- No gradients, glow effects, scroll-triggered animations, parallax, or emoji in UI elements.

## Component Patterns
- Forms use single-column layout, labels above inputs, max-width 480px.
- Inline validation on blur or submit, never while typing.
- Toast notifications via React Hot Toast for mutation feedback (success/error).
- Empty states tell the user what to do next, not why nothing is there.
- Button labels use active verbs: "Create project", "Save changes" — never "OK" or "Submit".
