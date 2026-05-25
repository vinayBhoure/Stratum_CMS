# Stratum CMS — Master Admin UI/UX Design Knowledge Base

> **Document type:** Design memory and decision record — addendum to the main UI/UX KB
>
> **Scope:** Master Admin screens only (Screens 16 & 17). All other screens, design system tokens, and product context live in `stratum_cms_ui_ux_knowledge_base.md` and `design.md`.
>
> **Owner:** Vinay
> **Version:** 1.0
> **Status:** Screens 16 and 17 designed. Prompts exist as separate downloadable files.
>
> **Companion documents (must be loaded together):**
> - `stratum_cms_ui_ux_knowledge_base.md` — full design system, screen status matrix, all other screens
> - `design.md` — complete design token specification (colors, typography, spacing, components)
> - `api_contracts.md` — locked API contracts including admin endpoints
> - `prompt-16-admin-users-list.md` — Claude Design prompt for Screen 16 *(downloaded)*
> - `prompt-16-patch-sidebar.md` — Patch prompt to update sidebar on generated Screen 16 *(downloaded)*
> - `prompt-17-admin-user-detail.md` — Claude Design prompt for Screen 17 *(downloaded)*

---

## Table of Contents

- [1. Context Reminder — Master Admin Role](#1-context-reminder--master-admin-role)
- [2. Admin Screens Overview](#2-admin-screens-overview)
- [3. Admin Dashboard Shell](#3-admin-dashboard-shell)
- [4. Screen 16 — Users List (`/admin/users`)](#4-screen-16--users-list-adminusers)
- [5. Screen 17 — User Detail (`/admin/users/:userId`)](#5-screen-17--user-detail-adminusersuserid)
- [6. Delete Confirmation Modal — Shared Pattern](#6-delete-confirmation-modal--shared-pattern)
- [7. API Contract Reference — Admin Module](#7-api-contract-reference--admin-module)
- [8. Locked Design Decisions — Admin Context](#8-locked-design-decisions--admin-context)
- [9. Prompt Files — Status and Usage](#9-prompt-files--status-and-usage)
- [10. Updated Screen Status Matrix](#10-updated-screen-status-matrix)
- [11. Open Questions — Admin Scope](#11-open-questions--admin-scope)
- [12. Rapid Context Summary](#12-rapid-context-summary)

---

## 1. Context Reminder — Master Admin Role

> **Read this before designing any admin screen.**

Stratum CMS has exactly two roles: `user` and `masterAdmin`. The Master Admin is the platform operator — not a portfolio user. Their job is platform governance, not content creation.

**Master Admin capabilities (enforced by absence of endpoints, not runtime checks):**
- ✅ View all registered users (paginated, searchable)
- ✅ View individual user detail (auth data + content counts)
- ✅ Delete any user (hard delete, cascade to all content)
- ❌ Edit user content
- ❌ Reset user passwords
- ❌ Impersonate users
- ❌ Create users

**Critical UX implication:** The Master Admin interface is **read-mostly with one destructive action**. Every design decision flows from this constraint. There are no forms, no creation flows, no edit states — only viewing and one carefully guarded delete.

---

## 2. Admin Screens Overview

### 2.1 Screen Status

| # | Screen Name | Route | Status | Prompt File |
|---|---|---|---|---|
| 16 | Master Admin — Users List | `/admin/users` | ✅ Designed | `prompt-16-admin-users-list.md` + `prompt-16-patch-sidebar.md` |
| 17 | Master Admin — User Detail | `/admin/users/:userId` | ✅ Designed | `prompt-17-admin-user-detail.md` |

### 2.2 Navigation Flow

```
/admin/users  (Screen 16 — Users List)
      │
      │  Click any row
      ▼
/admin/users/:userId  (Screen 17 — User Detail)
      │
      │  Click "← All users"
      ▼
/admin/users  (back to list)
```

No other admin routes exist in MVP. The admin sidebar "Settings" item is a placeholder with no route.

---

## 3. Admin Dashboard Shell

> **Critical distinction:** The Master Admin uses a **different shell** from the regular user dashboard. The regular user shell (DASHBOARD / CONTENT / ACCOUNT sections) must never appear in admin context.

### 3.1 Top Bar

Identical to the regular user dashboard top bar:
- Height: `56px`
- Background: `#FFFFFF`, bottom border `1px solid #E7E5E4`
- Logo "Stratum" typographic wordmark left
- User avatar circle (32px) right — shows logged-in admin's initial

### 3.2 Admin Sidebar — Full Specification

**Container:**
- Width: `240px`
- Background: `#FAFAF9`
- Right border: `1px solid #E7E5E4`
- Top padding: `16px`

**Structure:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN                          ← section label
  Users                        ← nav item (active on both screens)
  Settings  [Soon]             ← muted placeholder, no route

(large empty space intentional)

[Avatar] Vinay Kumar
         Master Admin          ← role badge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Section label "ADMIN":**
- `11px`, weight 600, `#A8A29E`, uppercase, letter-spacing `0.05em`
- Padding: `16px 12px 8px`

**Nav item — "Users":**
- Icon: Lucide `Users`, 16px
- Label: "Users", `14px`, weight 500
- Active state: `#ECFDF5` bg, `#047857` text, `3px #10B981` left edge indicator, `6px` radius
- Padding: `8px 12px`
- Icon-label gap: `12px`
- Active on both `/admin/users` and `/admin/users/:userId`

**Nav item — "Settings" (placeholder):**
- Icon: Lucide `Settings`, 16px, `#A8A29E`
- Label: "Settings", `14px`, weight 400, `#A8A29E`
- "Soon" pill: `#F5F5F4` bg, `#A8A29E` text, `10px`, weight 500, `1px 5px` padding, `4px` radius
- No hover effect — `cursor: default`
- No route assigned

**User card at sidebar bottom:**
- Separator: `1px solid #E7E5E4` above, `16px` gap
- Padding: `16px` from left/right/bottom sidebar edges
- Avatar: `32px` circle, `#F5F5F4` bg, `1px solid #E7E5E4` border, admin's first initial, `13px` weight 600, `#57534E`
- Right of avatar, `12px` gap:
  - Name: `13px`, weight 500, `#1C1917`
  - Role badge below name (`4px` gap): "Master Admin", `#ECFDF5` bg, `#047857` text, `10px`, weight 500, `4px` radius, `1px 6px` padding

**What is explicitly ABSENT from the admin sidebar** (must never appear):
- DASHBOARD section
- Overview nav item
- CONTENT section (Projects, Experience, Skills, Tags, Resume)
- ACCOUNT section (Profile, Settings in user context)

---

## 4. Screen 16 — Users List (`/admin/users`)

### 4.1 Layout Summary

```
[Page Header: "Users" + subtitle]
[Controls Row: Search input | Role filter dropdown]
[Users Table]
[Pagination]
```

### 4.2 Page Header

- Title: "Users" — `24px`, weight 600, `#1C1917`, letter-spacing tight
- Subtitle: "Manage platform users" — `14px`, weight 400, `#57534E`
- **No primary action button** — admin cannot create users

### 4.3 Controls Row

**Search input (left):**
- Width: `320px`, height: `40px`
- Lucide `Search` icon (16px) inset left, `pl-9` padding on input
- Placeholder: "Search by name or email..."
- Standard input styling: `1px solid #D6D3D1` border, `6px` radius
- Focus: `#10B981` border, `0 0 0 3px #D1FAE5` focus ring

**Role filter dropdown (right-aligned):**
- Width: `160px`
- Default: "All roles"
- Options: "All roles", "User", "Master Admin"
- Lucide `ChevronDown` icon (16px) right side
- Height and border matches search input

### 4.4 Users Table

**Table container:**
- `#FFFFFF` bg, `1px solid #E7E5E4` border, `8px` radius, overflow hidden, no shadow

**Column definitions:**

| Column | Width | Header Label | Content |
|---|---|---|---|
| USER | ~35% | "USER" | Stacked: name (line 1) + email + Verified badge (line 2) |
| ROLE | ~15% | "ROLE" | Role badge |
| CONTENT | ~25% | "CONTENT" | "5 projects · 3 exp · 12 skills" combined |
| JOINED | ~15% | "JOINED" | "May 1, 2026" |
| ACTIONS | ~10% | *(empty)* | Three-dot menu icon |

**Table header row:**
- Background: `#FAFAF9`
- Text: `12px`, weight 500, `#A8A29E`, uppercase, letter-spacing `0.05em`
- Cell padding: `12px 16px`
- Bottom border: `1px solid #E7E5E4`

**Table body rows:**
- Height: `56px` (taller than standard 48px to accommodate stacked name + email)
- Row hover: `#F5F5F4` bg — entire row is clickable, navigates to detail page
- Cursor: `pointer`
- Bottom border: `1px solid #E7E5E4` between rows (not on last row)
- Cell padding: `12px 16px`

**Column 1 — USER:**
- Name: `14px`, weight 500, `#1C1917`
- Email: `13px`, weight 400, `#57534E`
- Verified badge (if `emailVerified === true`, inline right of email): "Verified", `11px`, weight 500, `#047857` text, `#ECFDF5` bg, `4px` radius, `1px 6px` padding
- No badge shown if `emailVerified === false` (no "Unverified" clutter)

**Column 2 — ROLE:**
- `user` role: `#F5F5F4` bg, `#57534E` text, "User"
- `masterAdmin` role: `#ECFDF5` bg, `#047857` text, "Admin"
- Badge: `12px`, weight 500, `4px` radius, `2px 8px` padding

**Column 3 — CONTENT:**
- Format: `5 projects · 3 exp · 12 skills`
- Text: `13px`, weight 400, `#57534E`
- Dot separators `·`: `#A8A29E`
- All counts zero: "No content" in `#A8A29E`, italic

**Column 4 — JOINED:**
- Format: `May 1, 2026` (human-readable, no time)
- Text: `13px`, weight 400, `#A8A29E`

**Column 5 — ACTIONS:**
- Lucide `MoreHorizontal` icon, 16px, `#A8A29E`
- Icon container: `32×32px`, `6px` radius
- Hover: `#F5F5F4` bg, icon becomes `#57534E`
- Click must NOT propagate to row navigation (stop propagation)

**Three-dot dropdown menu:**
- Width: `180px`, right-aligned below icon
- `#FFFFFF` bg, `1px solid #E7E5E4` border, `8px` radius, `0 4px 12px rgba(0,0,0,0.06)` shadow
- Single item: Lucide `Trash2` (16px) + "Delete user"
- Text: `14px`, weight 400, `#DC2626`
- Item padding: `8px 12px`, hover: `#FEF2F2` bg, `6px` radius
- Clicking opens delete confirmation modal

### 4.5 Pagination

- Position: right-aligned below table, `16px` gap
- Text: "Page 1 of 8" — `13px`, weight 400, `#57534E`
- "Previous" + "Next" secondary buttons, `8px` gap
- Button: white bg, `1px solid #D6D3D1`, `6px` radius, `6px 12px` padding, `13px` text
- Disabled state: `#D6D3D1` text, `#F5F5F4` bg, `cursor: not-allowed`

### 4.6 Empty State (no results)

- Centered within table container
- Icon: Lucide `Users`, 48px, `#A8A29E`
- Title: "No users found" — `17px`, weight 500, `#1C1917`
- Description: "Try adjusting your search or filter." — `14px`, weight 400, `#57534E`
- No CTA button (admin cannot create users)
- Spacing: `12px` icon→title, `8px` title→description

---

## 5. Screen 17 — User Detail (`/admin/users/:userId`)

### 5.1 Layout Summary

```
[← All users]
[Header Card: avatar + name/email + role/joined]
[Tab Bar: Info | Content]
  [Tab: Info — labeled field pairs]
  [Tab: Content — three stat cards]
[Danger Zone Card]
```

### 5.2 Back Navigation

- "← All users" — Lucide `ArrowLeft` (16px) inline left
- `14px`, weight 500, `#57534E`, hover `#1C1917`
- Navigates to `/admin/users`
- `24px` gap below

### 5.3 Header Card

- `#FFFFFF` bg, `1px solid #E7E5E4` border, `8px` radius, `24px` padding, no shadow
- Horizontal layout: user info left, metadata right

**Left side:**
- Avatar: `48px` circle, `#F5F5F4` bg, `1px solid #E7E5E4` border, first initial, `20px` weight 600, `#57534E`
- Right of avatar (`16px` gap):
  - Name: `20px`, weight 600, `#1C1917`
  - Email: `14px`, weight 400, `#57534E`
  - Verified badge (if true): "Verified", `11px`, `#047857`, `#ECFDF5` bg
  - Unverified badge (if false): "Unverified", `11px`, `#A8A29E`, `#F5F5F4` bg

**Right side (right-aligned, vertically centered):**
- Role badge (same spec as table — "User" or "Admin")
- "Joined Jan 15, 2026" below badge (`8px` gap) — `13px`, weight 400, `#A8A29E`

### 5.4 Tab Bar

- Two tabs: "Info" (default active) and "Content"
- Active tab: `#1C1917` text, `2px solid #10B981` underline
- Inactive tab: `#A8A29E` text
- Tab padding: `8px 16px`, `14px`, weight 500
- Full-width bottom border: `1px solid #E7E5E4`
- `24px` gap below tab bar

### 5.5 Info Tab

White card, `1px solid #E7E5E4` border, `8px` radius, `24px` padding.

Label-value pairs, `16px` gap between each:
- Label: `11px`, weight 600, `#A8A29E`, uppercase, letter-spacing `0.05em`
- Value: `15px`, weight 400, `#1C1917`, `4px` below label
- Empty value: `—` em dash in `#A8A29E`

**Fields (in order):**

| Label | Value source | Notes |
|---|---|---|
| USER ID | `Auth.userId` | Monospace font ("Geist Mono"), e.g. `Vk3pXq9aZmN1` |
| NAME | `Auth.name` | Auth internal name (not UserInformation public name) |
| EMAIL (LOGIN) | `Auth.email` | Login credential, not public contact email |
| ROLE | `Auth.role` | "Master Admin" or "User" (formatted) |
| EMAIL VERIFIED | `Auth.emailVerified` | "Yes" in `#047857` or "No" in `#A8A29E` |
| CREATED | `Auth.createdAt` | Full datetime: "January 15, 2026 at 10:30 AM" |
| LAST UPDATED | `Auth.updatedAt` | Full datetime format |

> **Why only Auth fields?** The `GET /admin/users/:userId` endpoint returns Auth-level data + content counts only. UserInformation (public profile) is not returned to the admin. This is intentional per the API contract.

### 5.6 Content Tab

Three equal-width stat cards in a horizontal row, `16px` gap:

Each card:
- `#FFFFFF` bg, `1px solid #E7E5E4` border, `8px` radius, `24px` padding
- Layout: vertically centered
- Icon: `24px`, `#A8A29E` — Projects: `FolderOpen`, Experience: `Briefcase`, Skills: `Sparkles`
- Count: `32px`, weight 700, `#1C1917` (use `#A8A29E` if count is 0)
- Label: `14px`, weight 400, `#57534E` — "Projects", "Experiences", "Skills"
- Spacing: `8px` icon→count, `4px` count→label

### 5.7 Danger Zone Card

- Position: below tabbed section, `48px` gap (intentionally large — visual separation)
- `#FFFFFF` bg, **`1px solid #DC2626` border** (red, not subtle), `8px` radius, `24px` padding

**Horizontal layout:**

Left side:
- Heading: "Delete this user" — `17px`, weight 600, `#1C1917`
- Description (`4px` below): "Permanently delete this user's account and all associated data. This includes all projects, experience entries, skills, tags, and resume. This action is irreversible." — `14px`, weight 400, `#57534E`, max-width `480px`

Right side (vertically centered):
- "Delete user" — `#DC2626` bg, white text, `6px` radius, `10px 16px` padding, `14px`, weight 500
- Hover: `#B91C1C`
- Clicking opens delete confirmation modal

---

## 6. Delete Confirmation Modal — Shared Pattern

> Used by both Screen 16 (from three-dot menu) and Screen 17 (from Danger Zone). Identical specification in both contexts.

**Overlay:** `rgba(28, 25, 23, 0.4)` with `backdrop-filter: blur(4px)`

**Modal card:**
- Width: `480px`, centered vertically and horizontally
- `#FFFFFF` bg, `8px` radius, `0 4px 12px rgba(0,0,0,0.06)` shadow, `32px` padding
- Close button: Lucide `X`, 16px, top-right, `#A8A29E`, hover `#1C1917`

**Modal content (top to bottom):**

1. **Warning icon:** Lucide `AlertTriangle`, 24px, `#DC2626`
2. **Heading:** "Delete user permanently?" — `20px`, weight 600, `#1C1917`, `8px` below icon
3. **Body text** (`8px` below heading): "This will permanently delete **{userName}**'s account and all their content including projects, experience, skills, tags, and resume. This action cannot be undone." — `14px`, weight 400, `#57534E`. The `{userName}` is bold (`weight 600, #1C1917`).
4. **Type-to-confirm input** (`16px` below body):
   - Label: `Type "{userName}" to confirm` — `14px`, weight 500, `#57534E`
   - Full-width text input
   - Placeholder: the user's name, lighter text
5. **Action buttons** (`24px` below input, right-aligned, `8px` gap):
   - "Cancel" — ghost button (`transparent` bg, `#57534E` text, hover `#F5F5F4` bg)
   - "Delete user" — destructive (`#DC2626` bg, white text, hover `#B91C1C`)
   - Delete button disabled (`#D6D3D1` text, `#F5F5F4` bg, `cursor: not-allowed`) until typed input **exactly matches** `{userName}`

**Delete outcome:** `DELETE /api/v1/admin/users/:userId` — hard delete, cascade to all content. Response 204. Frontend navigates back to `/admin/users` after success.

---

## 7. API Contract Reference — Admin Module

Full contracts live in `api_contracts.md`. Key details for UI context:

### 7.1 List Users

```
GET /api/v1/admin/users
Auth: masterAdmin
Query: ?page=1&limit=20&search=vinay&role=user
```

Response shape per user item:
```json
{
  "userId": "Vk3pXq9aZmN1",
  "name": "Vinay Kumar",
  "email": "vinay@example.com",
  "role": "user",
  "emailVerified": false,
  "createdAt": "2026-05-01T...",
  "counts": {
    "projects": 5,
    "experiences": 3,
    "skills": 12
  }
}
```

Pagination envelope: `{ page, limit, total, totalPages }`.

### 7.2 Get User Detail

```
GET /api/v1/admin/users/:userId
Auth: masterAdmin
```

Same shape as list item (no additional UserInformation fields exposed).

### 7.3 Delete User

```
DELETE /api/v1/admin/users/:userId
Auth: masterAdmin
```

Response: 204. Hard delete with cascade to all content.

---

## 8. Locked Design Decisions — Admin Context

These decisions are final and must not be revisited without explicit product discussion.

| Decision | Choice | Rationale |
|---|---|---|
| Admin shell | Separate from user dashboard shell | Admin manages platform, not personal content — different mental model |
| Admin sidebar sections | ADMIN only (Users + Settings placeholder) | No CONTENT or ACCOUNT sections needed — admin has no portfolio |
| Settings nav treatment | Muted + "Soon" pill, no route | Honest about current state; reserves space for future platform settings |
| Admin identity signal | "Master Admin" role badge at bottom of sidebar | Confirms admin is in admin mode without visual noise |
| Delete confirmation pattern | Type-to-confirm (type user's name) | Appropriate friction for irreversible cascade delete |
| User detail layout | Header card + tabs (Info / Content) | Separates identity data from content counts cleanly |
| Danger zone placement | Bottom of detail page, red border | GitHub settings pattern — physically distant from informational content |
| Row click behavior | Entire row navigates to detail | Standard table UX for detail navigation |
| Three-dot click | Stop propagation from row click | Prevents accidental navigation when opening menu |
| emailVerified display | Show "Verified" badge only when true | Unverified is default in MVP — no need to call it out per user |
| Admin cannot create users | No "Add user" / "Invite" button anywhere | Enforced by absence of endpoint — UI reflects this |
| Bulk actions | None in MVP | Not required for Phase 5 admin scope |
| Column sorting | None in MVP | Server does not support sort params on admin endpoint |

---

## 9. Prompt Files — Status and Usage

> The following prompt files have been generated and downloaded. Do NOT regenerate them unless a design revision is needed.

| File | Screen | Status | Notes |
|---|---|---|---|
| `prompt-16-admin-users-list.md` | Screen 16 | ✅ Used in Claude Design | Full screen specification |
| `prompt-16-patch-sidebar.md` | Screen 16 | ✅ Generated | Patch only — updates sidebar on generated output |
| `prompt-17-admin-user-detail.md` | Screen 17 | ✅ Generated | Full screen spec with admin sidebar baked in |

**Why a patch prompt exists for Screen 16:** Screen 16 was initially generated using the regular user sidebar (DASHBOARD / CONTENT / ACCOUNT structure). After reviewing the output, it was decided the admin context required a distinct sidebar. Rather than regenerating the entire screen, a focused patch prompt was written to update only the sidebar while preserving all other generated content.

**Prompting workflow for future admin screens (if any are added):**
1. Always include the Admin Sidebar specification from §3.2 of this document
2. Always specify "Admin Dashboard Shell" — not "Dashboard Shell"
3. Reference `design.md` for all tokens
4. Explicitly state what the admin cannot do (no edit, no create, no impersonate)

---

## 10. Updated Screen Status Matrix

> This supersedes the status matrix in `stratum_cms_ui_ux_knowledge_base.md` for screens 16 and 17.

| # | Screen Name | Route | Status | Prompt File | Notes |
|---|---|---|---|---|---|
| 1 | Landing Page | `/` | ✅ Designed | `prompt-1-landing.md` | — |
| 2 | Signup | `/signup` | ✅ Designed | `prompt-2-signup.md` | — |
| 3 | Login | `/login` | ✅ Designed | `prompt-3-login.md` | — |
| 4 | Onboarding | `/onboarding` | ✅ Designed | `prompt-4-onboarding.md` | — |
| 5 | Dashboard Overview | `/dashboard` | ✅ Designed | `prompt-5-dashboard.md` | — |
| 6 | Post-Logout | `/logout` | ✅ Designed | `prompt-6-post-logout.md` | — |
| 7 | Projects — List | `/dashboard/projects` | 🔲 Not started | — | Next to design |
| 8 | Projects — Add/Edit | `/dashboard/projects/new` | 🔲 Not started | — | — |
| 9 | Experience — List | `/dashboard/experience` | 🔲 Not started | — | — |
| 10 | Experience — Add/Edit | `/dashboard/experience/new` | 🔲 Not started | — | — |
| 11 | Skills Manager | `/dashboard/skills` | 🔲 Not started | — | — |
| 12 | Tags Manager | `/dashboard/tags` | 🔲 Not started | — | — |
| 13 | Resume Manager | `/dashboard/resume` | 🔲 Not started | — | — |
| 14 | Profile Editor | `/me` | 🔲 Not started | — | — |
| 15 | Settings | `/dashboard/settings` | 🔲 Not started | — | — |
| 16 | Master Admin — Users List | `/admin/users` | ✅ Designed | `prompt-16-admin-users-list.md` + patch | Sidebar patched post-generation |
| 17 | Master Admin — User Detail | `/admin/users/:userId` | ✅ Designed | `prompt-17-admin-user-detail.md` | Admin sidebar baked in |
| 18 | 404 / Error States | — | 🔲 Not started | — | — |

---

## 11. Open Questions — Admin Scope

> These were not resolved during this design session. Do not assume resolutions.

| Question | Context | Options Considered |
|---|---|---|
| Admin Settings page | "Settings" nav item exists as placeholder | What platform-level settings would live here? Could include: user limits, system tag management, platform announcements. Not scoped. |
| Admin pagination behavior | Table uses page 1 of N pattern | Should URL update on page change (`?page=2`) for bookmarkability? Not decided. |
| Search implementation | Search bar on users list | Client-side filter or server-side query? API supports `?search=` param — server-side is assumed but not confirmed in UI behavior. |
| Role filter behavior | Role dropdown on users list | Does selecting a role immediately filter, or require a "Search" button press? Not specified. |
| Empty admin state | No users in the system | Edge case — what does the table show if there are truly zero users? Empty state was defined for "no search results" but not for zero total users. |
| Post-delete navigation | After deleting from detail page | Navigate to `/admin/users` automatically, or show a toast on the list page? Assumed auto-navigate but not explicitly decided. |
| Admin top bar user menu | Avatar in top bar | When admin clicks their avatar, what appears? (Logout option, profile link?) Not designed. |

---

## 12. Rapid Context Summary

> For fast re-loading in new AI sessions. Read this if nothing else.

**What was designed in this session:** Master Admin screens 16 (Users List) and 17 (User Detail) for Stratum CMS. Three prompt files were generated and downloaded.

**The key insight:** The Master Admin runs in a **separate shell** from the regular user dashboard. The admin sidebar is stripped to only two items — Users (active) and Settings (placeholder, muted with "Soon" pill) — plus a "Master Admin" role badge at the bottom. No content modules, no account modules.

**The one destructive action:** Delete user. It is hard delete with cascade. The confirmation requires typing the user's name exactly. This pattern appears in both the list page (via three-dot menu) and the detail page (via a GitHub-style danger zone card at the bottom).

**The detail page pattern:** Header card (avatar + name/email/role/joined) → Tabs (Info: auth fields read-only | Content: three stat cards for counts) → Danger zone. Read-only throughout except for the delete action.

**What's not resolved:** Admin Settings page content, search filter UX behavior (debounce vs. submit), post-delete navigation, and admin top bar user menu.

**Next design sessions should focus on:** Screens 7–15 (content module pages for regular users) — these are all unstarted and will benefit from consistent patterns established before returning to admin or error screens.

---

*End of Master Admin UI/UX Knowledge Base v1.0*
*Load alongside `stratum_cms_ui_ux_knowledge_base.md` and `design.md` for complete design context.*
