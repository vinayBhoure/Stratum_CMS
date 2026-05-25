# Stratum CMS — UI/UX Design Knowledge Base

> **Purpose of this document**
> Authoritative design memory and UI/UX planning documentation for Stratum CMS. Designed to be loaded into future AI sessions (Claude Project Knowledge, ChatGPT Projects, etc.) to continue frontend design work without context loss.
>
> **Source of truth for:** UI/UX decisions, design system foundation, screen flow planning, component patterns, and frontend architecture choices.
>
> **Owner:** Vinay
> **Document version:** 1.0
> **Status:** Landing page, Signup, Login, Onboarding, Dashboard Overview, and Post-Logout screens designed. Prompts and design.md artifacts exist separately.
> **Companion documents:** 
> - `design.md` — complete design system specification (colors, typography, components, spacing)
> - Prompt files for screens 1-6 (Landing, Signup, Login, Onboarding, Dashboard Overview, Post-Logout)

---

## Table of Contents

- [1. Design Philosophy & Principles](#1-design-philosophy--principles)
- [2. Design System Assets](#2-design-system-assets)
- [3. User Flow & Screen Planning](#3-user-flow--screen-planning)
- [4. Authentication Screens — Key Decisions](#4-authentication-screens--key-decisions)
- [5. Onboarding Flow — Key Decisions](#5-onboarding-flow--key-decisions)
- [6. Dashboard Overview — Key Decisions](#6-dashboard-overview--key-decisions)
- [7. Post-Logout Screen — Key Decisions](#7-post-logout-screen--key-decisions)
- [8. Landing Page — Key Decisions](#8-landing-page--key-decisions)
- [9. Form Field Conventions](#9-form-field-conventions)
- [10. Interactive Component Patterns](#10-interactive-component-patterns)
- [11. Data Mapping Reference](#11-data-mapping-reference)
- [12. Open Questions / Future Decisions](#12-open-questions--future-decisions)
- [13. Working with Claude Design](#13-working-with-claude-design)
- [14. Consistency Rules](#14-consistency-rules)
- [15. Design Collaboration Context](#15-design-collaboration-context)
- [16. Developer Handoff Notes](#16-developer-handoff-notes)
- [17. Next Steps](#17-next-steps)

---

## 1. Design Philosophy & Principles

### 1.1 Core Design Direction

**Brand Identity:**
- **Product name:** Stratum (never "Stratum CMS" in UI)
- **Tone:** Developer-tool confidence — purposeful, technical, calm
- **NOT:** Corporate SaaS, creative agency, startup-flashy, marketing-heavy
- **Reference feel:** Linear, Raycast, Vercel dashboard, Notion settings

**Visual Language:**
- Clean, minimal, uncluttered — generous whitespace
- Emerald/Green accent color (Tailwind `emerald-500` as primary)
- Light mode default (dark mode deferred to future)
- System theme switching planned as post-launch update

**Anti-Patterns (Explicitly Avoided):**
- Gradients as decoration
- Glow effects
- Scroll-triggered animations
- Parallax
- Emoji-heavy UI
- Marketing-style hero animations
- Illustrative noise

### 1.2 Layout Philosophy

**Primary Layout Pattern:** Left sidebar + content area
- Sidebar: 240px fixed width, persistent navigation
- Content area: padded 32px, max-width 1200px centered
- Top bar: 64px height, logo left, user menu right
- Mobile: sidebar collapses to hamburger drawer at <768px

**Form Philosophy:**
- Single-column forms by default
- Labels above inputs
- Generous vertical spacing
- Inline validation (on blur or submit, never while typing)
- Submit button bottom-right
- Cancel/Back as ghost button left of submit

**Component Philosophy:**
- Borders over shadows (cards use subtle borders, not elevation)
- Icons inherit text color (`currentColor`)
- Motion is minimal and functional only
- No decorative animation

---

## 2. Design System Assets

### 2.1 Existing Artifacts

**`design.md` file exists** — complete design system specification covering:
- Color tokens (emerald accent + neutral grayscale + semantic colors)
- Typography scale (Inter font family, 7 type scales from display to small)
- Spacing system (4px base unit)
- Component specifications (buttons, inputs, cards, modals, tags, toasts)
- Layout containers and dashboard shell structure
- Iconography guidelines (Lucide icons from React Icons)
- Motion timing and easing
- Accessibility floor (WCAG AA compliance)
- Page-level patterns
- Microcopy guidelines

**Key design system decisions:**
- Primary accent: `emerald-500` (#10B981)
- Font stack: Inter for UI, JetBrains Mono for code/API URLs
- No shadows on cards — borders only
- httpOnly cookie named `stratum_token`
- Standard response envelope across all API calls

### 2.2 Logo Placeholder Strategy

**Current state:** No logo designed yet
- Typographic wordmark "Stratum" in primary text color, weight 600
- Paired with small geometric mark (square or triangle) in emerald to the left
- Reserved space: 32px height in headers, 40px on landing page
- Will be replaced when actual logo is created

---

## 3. User Flow & Screen Planning

### 3.1 Complete User Journey Map

**New User Flow:**
```
Landing Page (/)
      ↓
Signup (/signup)
      ↓
Onboarding (/onboarding) — 3-step profile setup
      ↓
Dashboard Overview (/dashboard)
      ↓
Module Pages (Projects / Experience / Skills / Tags / Resume / Profile)
```

**Returning User Flow:**
```
Landing Page (/)
      ↓
Login (/login)
      ↓
Dashboard Overview (/dashboard)
      ↓
Module Pages
```

**Logout Flow:**
```
Dashboard (any page)
      ↓
User clicks Logout
      ↓
POST /api/v1/auth/logout
      ↓
Post-Logout Confirmation Screen
      ↓
User chooses: Log back in OR Go to homepage
```

### 3.2 Screen Status Matrix

| # | Screen Name | Route | Status | Prompt File | Notes |
|---|---|---|---|---|---|
| 1 | Landing Page | `/` | ✅ Designed | Prompt 1 | Includes FAQ section, Features anchor |
| 2 | Signup | `/signup` | ✅ Designed | Prompt 2 | OAuth buttons (non-functional), two-column layout |
| 3 | Login | `/login` | ✅ Designed | Prompt 3 | Mirror of Signup, "Forgot password?" muted |
| 4 | Onboarding | `/onboarding` | ✅ Designed | Prompt 4 | 3 steps, progress indicator, skippable steps 2-3 |
| 5 | Dashboard Overview | `/dashboard` | ✅ Designed | Prompt 5 | Empty + Populated states, profile completion indicator |
| 6 | Post-Logout | `/logout` | ✅ Designed | Prompt 6 | Simple centered card, reassurance messaging |
| 7 | Projects — List | `/dashboard/projects` | 🔲 Not started | — | Next to design |
| 8 | Projects — Add/Edit | `/dashboard/projects/new` | 🔲 Not started | — | — |
| 9 | Experience — List | `/dashboard/experience` | 🔲 Not started | — | — |
| 10 | Experience — Add/Edit | `/dashboard/experience/new` | 🔲 Not started | — | — |
| 11 | Skills Manager | `/dashboard/skills` | 🔲 Not started | — | — |
| 12 | Tags Manager | `/dashboard/tags` | 🔲 Not started | — | — |
| 13 | Resume Manager | `/dashboard/resume` | 🔲 Not started | — | — |
| 14 | Profile Editor | `/me` | 🔲 Not started | — | Maps to UserInformation table |
| 15 | Settings | `/dashboard/settings` | 🔲 Not started | — | Auth settings, danger zone |
| 16 | Master Admin — Users | `/admin/users` | 🔲 Not started | — | Role-gated, masterAdmin only |
| 17 | Master Admin — User Detail | `/admin/users/:userId` | 🔲 Not started | — | — |
| 18 | 404 / Error States | — | 🔲 Not started | — | — |

---

## 4. Authentication Screens — Key Decisions

### 4.1 OAuth Strategy (Signup + Login)

**Display-only OAuth buttons:**
- GitHub, Google, Apple — always three in a row, equal width
- Buttons are styled as interactive but non-functional in Phase 2
- Tooltip on hover: "OAuth coming soon"
- No brand colors on buttons — neutral `border-default`, bg-white, hover bg-muted
- Icon 16px left of label, rounded-md, py-2.5, text-sm, font-medium

**Why display-only:** OAuth is Phase 7 consideration (undecided). Buttons reserve the visual space and set user expectations without misleading them.

### 4.2 Two-Column Auth Layout Pattern

**Used on:** Signup, Login (not used on Onboarding or Post-Logout)

**Structure:**
- Left column (55% width): brand panel, `bg-subtle` background
  - Logo top-left inside panel
  - Vertically centered content block:
    - Small emerald badge pill
    - h1 heading
    - body text-muted description
    - Code snippet card (JetBrains Mono)
    - Three checkmark lines in small text-muted
- Right column (45% width): white background, form card
  - No outer border — white column IS the card
  - Padding: 48px horizontal, vertically centered

**Mobile behavior:** Collapses to single column, left panel hidden, only logo at top.

### 4.3 Field Mappings

**Signup collects:**
- Full name → `Auth.name` (internal display name)
- Email → `Auth.email` (login credential)
- Password → `Auth.password` (bcrypt hashed)

**Password validation indicators:**
- Four pill indicators: `8+ chars`, `Uppercase`, `Lowercase`, `Number`
- Pills turn emerald when satisfied (real-time visual feedback)
- No error text while typing — pills provide positive reinforcement

**Login collects:**
- Email → `Auth.email`
- Password → `Auth.password`
- "Forgot password?" link present but muted (`text-neutral-400`) with tooltip: "Available soon — password reset requires email setup."

### 4.4 Error Handling Patterns

**Signup error (duplicate email):**
- Inline error below email field
- Message: "This email is already registered. Log in instead?"
- "Log in instead" as emerald inline link

**Login error (invalid credentials):**
- Full-width error banner above submit button
- Subtle red background (`red-50`), red-600 left border 4px
- Message: "Incorrect email or password. Please try again."
- Both email and password fields show `border-red-500`
- No per-field errors — banner covers both (security best practice)

---

## 5. Onboarding Flow — Key Decisions

### 5.1 Three-Step Structure

**Purpose:** Collect `UserInformation` profile data after signup without overwhelming the user.

**Step 1 — Public Identity (required):**
- Public display name (required) → `UserInformation.name`
- Public contact email (optional) → `UserInformation.email`
- Helper text explains distinction from login credentials
- Cannot skip — name is required by API

**Step 2 — Contact & Location (optional, skippable):**
- Phone number (country code dropdown + number)
- Address
- Google Maps location link
- "Skip this step →" ghost button top-right

**Step 3 — Social Links (optional, skippable):**
- LinkedIn, GitHub, Twitter/X, Instagram
- Icons inside left of each input field
- "Skip this step →" ghost button top-right

### 5.2 Progress Indicator

Horizontal step tracker at top:
```
● ————— ○ ————— ○
1       2       3
```
- Active step: filled emerald circle, bold label
- Upcoming: empty circle, muted label
- Completed: filled emerald with checkmark, muted label
- Progress line animates fill on step advance

### 5.3 Completion Transition

After "Finish setup →":
- Full-page success state replaces the form
- Large checkmark icon (48px, emerald-500)
- h2: "You're all set, {name}!" (uses public display name from Step 1)
- body text-muted: "Your Stratum profile is ready. Let's go to your dashboard."
- Primary button: "Go to dashboard →"
- Auto-redirects after 2 seconds if not clicked

---

## 6. Dashboard Overview — Key Decisions

### 6.1 Layout Structure

**Shell pattern (applies to all dashboard screens):**
```
┌──────────────────────────────────────────┐
│ Top bar (64px, logo left, user right)   │
├──────────┬───────────────────────────────┤
│ Sidebar  │ Content area                  │
│ 240px    │ padding 32px, max-width 1200px│
└──────────┴───────────────────────────────┘
```

### 6.2 Sidebar Navigation Structure

```
Stratum (logo, top)
━━━━━━━━━━━━━━━━
DASHBOARD
  Overview         (active on this screen)
━━━━━━━━━━━━━━━━
CONTENT
  Projects
  Experience
  Skills
  Tags
  Resume
━━━━━━━━━━━━━━━━
ACCOUNT
  Profile
  Settings
━━━━━━━━━━━━━━━━
ADMIN  (only if role === masterAdmin)
  Users
━━━━━━━━━━━━━━━━
[User avatar + name, bottom]
```

**Navigation styling:**
- Section labels: `text-xs font-medium text-muted uppercase tracking-wider`
- Nav items: `text-sm text-default`
- Hover: `bg-muted rounded-md`
- Active: `bg-emerald-50 text-emerald-700 font-medium` + `border-l-2 border-emerald-500`

**Icons per module:**
- Overview: LayoutDashboard
- Projects: FolderOpen
- Experience: Briefcase
- Skills: Sparkles
- Tags: Hash
- Resume: FileText
- Profile: User
- Settings: Settings
- Admin Users: Users

### 6.3 Profile Completion Indicator

**Visibility logic:**
- **Show** if any of these are incomplete:
  - Public profile (UserInformation.name set)
  - At least 1 project added
  - At least 1 skill added
  - At least 1 experience added
  - Resume uploaded
- **Hide** only when all five are complete
- **Reappear** if user drops any back to zero (e.g., deletes all projects)

**Design:**
- Full-width card, `bg-emerald-50`, `border border-emerald-200`
- Left: badge "Getting started" + h3 "Complete your profile" + checklist (5 items)
- Right: circular progress ring (80px, emerald-500 fill, "1/5 complete" center)
- Bottom: thin border-top, small text explaining auto-dismiss behavior

**Checklist items:**
- Incomplete: circle icon (neutral-300) + text-muted small
- Complete: checkmark circle (emerald-500) + text-default small with strikethrough

### 6.4 Public API Card

**Compact design (not full-width hero):**
- Card: bg-white, border-subtle, rounded-lg, p-5
- Left: label "YOUR PUBLIC API" + URL in JetBrains Mono + helper text
- Right: "Copy base URL" secondary button
- On click: button label changes to "Copied ✓" (emerald-600, 1.5s)

**URL shown:** `https://api.stratum.com/v1/{userId}`
**Helper text:** "Append /{section} to fetch your content. Example: .../projects, .../skills, .../resume"

### 6.5 Content Module Cards (3×2 Grid)

**Empty state (new user):**
- Icon (20px, emerald-500) + module name
- Status: "No [X] yet" in small text-muted
- CTA: "Add your first [X] →" in emerald-600 font-medium

**Populated state (mature user):**
- Icon + module name
- Large count (text-2xl font-semibold) + small label ("projects", "skills")
- CTA: "Manage (n) →"

**Special cases:**
- Resume: shows "Uploaded ✓" badge instead of count, CTA is "View / replace →"
- Tags: shows count + "incl. 1 system tag" helper text
- Profile: shows "Complete ✓" badge + "Public profile · 4 social links" helper

**Context-aware CTA logic:**
```
Projects    → count === 0 : "Add your first project →"
               count  > 0 : "Manage (n) →"
Experience  → count === 0 : "Add your first role →"
               count  > 0 : "Manage (n) →"
Skills      → count === 0 : "Add your first skill →"
               count  > 0 : "Manage (n) →"
Tags        → count === 0 : "Create a tag →"
               count  > 0 : "Manage (n) →"
Resume      → none        : "Upload resume →"
               exists     : "View / replace →"
Profile     → incomplete  : "Complete profile →"
               complete   : "Edit profile →"
```

### 6.6 Populated State — Endpoints Strip

**Appears only when user has content:**
- Full-width card, `bg-subtle`, border-subtle, rounded-lg, p-4
- Label: "QUICK ACCESS — PUBLIC ENDPOINTS" (uppercase, muted)
- Six endpoint pills in a row: `/projects`, `/experience`, `/skills`, `/tags`, `/resume`, `/user-info`
- Each pill: JetBrains Mono, bg-white, border-subtle, Copy icon (12px) on hover
- Below pills: "Base: https://api.stratum.com/v1/{userId}" right-aligned, small text-muted

### 6.7 Excluded Features (Intentional)

**Not included on Dashboard Overview:**
- Recent activity feed (deferred — may add later)
- Time-aware greeting ("Good morning, Vinay") — page title is just "Dashboard"
- Full-width API hero card (opted for compact card instead)
- Usage stats / analytics (future scope)
- Quick actions shortcuts (modules already one click away in sidebar)

---

## 7. Post-Logout Screen — Key Decisions

### 7.1 Layout Pattern

**Simple centered card (not two-column like auth screens):**
- Full viewport, white background
- Stratum logo top-left (24px padding)
- Confirmation card vertically and horizontally centered
- Card: max-width 480px, border-subtle, rounded-lg, p-10

**Rationale:** This isn't a conversion screen (signup/login are), so the brand panel isn't needed. Simpler = faster to understand = appropriate for a transitional confirmation.

### 7.2 Content Structure

- **Icon:** CheckCircle (Lucide, 48px, emerald-500) — circle variant for softer feel
- **Heading:** "You've been logged out" (h2 size, centered)
- **Body:** "Your session has ended securely. You can log back in anytime or return to the homepage." (body text-muted, max-width 360px, centered)
- **Actions:** Two buttons (primary "Log back in", secondary "Go to homepage"), gap-3, centered
- **Reassurance:** "All your content and settings are saved." (small text-muted, 24px below buttons)

**Both buttons equally visible** — no hiding the "go home" option. Respects the user's choice to log out.

### 7.3 Edge Case Handling

If user accesses `/logout` URL directly without being logged in:
- Same layout, same buttons
- Heading changes to: "You're not logged in"
- Body changes to: "You don't have an active session. You can log in or return to the homepage."

---

## 8. Landing Page — Key Decisions

### 8.1 Navigation Structure

**Top navigation bar (sticky):**
- Left: Stratum logo
- Center: "Features", "How it works", "API", "Pricing", "FAQ"
  - "Features" and "FAQ" smooth-scroll to on-page sections
  - Others are placeholders (future pages)
- Right: "Log in" (ghost) + "Sign up" (primary emerald)

### 8.2 Content Sections (Order)

1. **Hero section** — headline, subtext, two CTAs ("Start building free" + "View live API demo"), small text "No credit card. 2-minute setup."
2. **Code preview block** — two-column: fetch call left (60%), JSON response right (40%)
3. **"How it works"** — three numbered cards (01, 02, 03): Sign up & set up, Add your content, Fetch from your site
4. **Feature highlights** — 2×2 grid, four cards with icons: Built for developers, No backend to maintain, One source of truth, Open and simple
5. **FAQ section** — accordion with 6 questions, first expanded by default
6. **CTA footer band** — muted background, h2 + single CTA "Sign up free"
7. **Footer** — three columns: Stratum (logo + tagline), Product links, Company links

### 8.3 FAQ Questions Included

1. Who is Stratum for?
2. How does the API work?
3. Is it really free?
4. What if I already have a portfolio site?
5. Can I delete my data?
6. What tech stack does Stratum use? (transparency disclosure)

### 8.4 Style Constraints Specific to Landing

- NO gradient backgrounds, NO glow effects, NO scroll animations, NO parallax
- Emerald used sparingly: primary buttons, numbered step badges, feature icons, active nav underline
- Section spacing: 96px vertical between major sections
- Code blocks use JetBrains Mono, light card background with subtle border
- Accordion FAQ: simple chevron-down icon rotates on expand

---

## 9. Form Field Conventions

### 9.1 Standard Input Anatomy

**Structure:**
- Label above input (`label` style, mb-1.5)
- Input field (design system spec)
- Helper text below (optional, `small text-muted`, mt-1.5)
- Error message below (on error state, `small text-red-600`, mt-1.5)

**Error state:**
- Input border: `border-red-500`
- Error message: `text-red-600 small`
- Icon: optional AlertCircle inline left of error text

### 9.2 Special Input Patterns Used

**Phone number (onboarding):**
- Two-part input in one row
- Left: country code dropdown (40px wide, flag emoji + code, default 🇮🇳 +91)
- Right: number input, placeholder format

**Social link inputs (onboarding):**
- Platform icon (16px) inside left of input using `pl-9` padding
- Icon absolutely positioned
- Placeholder shows full URL format

**Password with show/hide (signup, login):**
- Eye / EyeOff icon right side of input
- Toggle visibility on click

### 9.3 Optional Field Indicator

**Pattern:** Small pill badge inline right of label
- Style: `rounded-full px-2 py-0.5 text-xs bg-neutral-100 text-neutral-500`
- Label: "optional"
- Used in onboarding Step 2 and Step 3

---

## 10. Interactive Component Patterns

### 10.1 Buttons — State Behaviors

**Primary emerald button:**
- Default: `bg-emerald-500 hover:bg-emerald-600`
- Loading: label changes to "Saving..." / "Creating..." with spinner inline, button width fixed
- Success (transient): label briefly shows "Saved ✓" / "Created ✓" (1.5s) then reverts
- Disabled: `opacity-50 cursor-not-allowed`

**Copy-to-clipboard buttons:**
- Default: "Copy [X]" with Copy icon
- On click: label changes to "Copied ✓" in emerald-600 (1.5s) then reverts
- Icon briefly changes to checkmark

### 10.2 Accordion (FAQ)

**Structure:**
- Each item: question as clickable row + collapsible answer
- Icon: chevron-down (rotates 180deg on expand)
- Animation: smooth height transition (200ms ease-out)
- First item expanded by default

**Styling:**
- Border-bottom between items (border-subtle)
- Question: font-medium, text-default
- Answer: body text, text-muted, padding-left to align with question

### 10.3 Progress Ring (Onboarding Completion Card)

**Design:**
- Circular SVG, 80px diameter
- Emerald-500 stroke for completed arc
- Neutral-200 stroke for remaining arc
- Center text: large fraction "1/5" + small "complete" below

### 10.4 Hover States

**Navigation items:**
- Sidebar nav: `hover:bg-muted rounded-md`
- Top nav links: subtle emerald underline animation (150ms ease-out)

**Module cards (dashboard):**
- Very subtle lift: `translate-y -2px` (150ms ease-out)
- Border color shifts to `emerald-200`

**Buttons:**
- Primary: `hover:bg-emerald-600`
- Secondary: `hover:bg-neutral-50`
- Ghost: `hover:bg-neutral-100`

---

## 11. Data Mapping Reference

### 11.1 Auth vs. UserInformation Distinction

**Critical concept for UI clarity:**

| Field | Auth Table | UserInformation Table | Usage |
|---|---|---|---|
| Name | `Auth.name` (internal) | `UserInformation.name` (public) | Auth name shown in dashboard greetings. Public name shown on portfolio via API. |
| Email | `Auth.email` (login) | `UserInformation.email` (contact) | Auth email is login credential. Public email is optional contact shown on portfolio. |

**Why this matters for UI:**
- Onboarding must explicitly explain the distinction (Step 1 helper text)
- Profile editor shows UserInformation fields, not Auth fields
- Settings page (future) handles Auth fields (password change, delete account)

### 11.2 Module API Endpoints

**Each content module maps to specific API routes:**

| Module | Private Endpoint | Public Endpoint | Data Shape |
|---|---|---|---|
| Projects | `/api/v1/projects` | `/v1/{userId}/projects` | title, description, mediaUrl, githubLink, liveLink, skillIds[], tagIds[] |
| Experience | `/api/v1/experience` | `/v1/{userId}/experience` | title, company, location, durationFrom, durationTo, activeJob, description, certificates[], skillIds[] |
| Skills | `/api/v1/skills` | `/v1/{userId}/skills` | skill (string) |
| Tags | `/api/v1/tags` | `/v1/{userId}/tags` | name (string), isSystem (boolean) |
| Resume | `/api/v1/resume` | `/v1/{userId}/resume` | url (Cloudinary PDF) |
| Profile | `/api/v1/me` | `/v1/{userId}/user-info` | name, email, contactNumber, address, googleLocationLink, socialMediaLinks |

---

## 12. Open Questions / Future Decisions

### 12.1 Unresolved UI/UX Questions

- [ ] **Projects list page layout** — table view, card grid, or list view? Filterable by tags?
- [ ] **Experience list page layout** — timeline view vs. stacked cards?
- [ ] **Skills manager interaction** — inline editing, modal forms, or dedicated pages?
- [ ] **Tags manager interaction** — inline creation, how to show system vs. user tags?
- [ ] **Resume preview** — embedded PDF viewer, link to Cloudinary, or download-only?
- [ ] **Profile editor** — single-page form or sectioned cards like Vercel settings?
- [ ] **Master Admin users list** — search, filters, pagination controls?
- [ ] **Delete confirmation modals** — standard pattern to use across all modules?
- [ ] **Bulk actions** — select multiple projects/skills and delete/tag in batch?
- [ ] **Mobile sidebar behavior** — slide-in drawer, bottom nav, or full-screen overlay?

### 12.2 Deferred Features (Not in MVP)

- Dark mode (design system prepared, not implemented)
- Rich text editor for descriptions (Phase 7 — Markdown storage)
- Media preview in dashboard (Phase 7)
- Email verification UI (Phase 7)
- Forgot password flow (Phase 7 — requires email infra)
- OAuth functional implementation (Phase 7, undecided)
- Custom domains UI (Phase 11)
- Theme switcher UI (Phase 11)
- Usage analytics dashboard (post-MVP)
- API rate limiting indicator (post-MVP)

---

## 13. Working with Claude Design

### 13.1 Tool Reference

**Claude Design:** https://claude.ai/design
- Anthropic's tool for generating high-fidelity interactive prototypes
- Outputs React components rendered in browser
- Best for visual design iteration, not production code

### 13.2 Prompt Structure Pattern

Every Claude Design prompt follows this structure:

```
1. Product context (what Stratum is, 1-2 sentences)
2. Design system (paste full design.md)
3. Screen specification (layout, fields, interactions)
4. Style constraints (anti-patterns, tone, specifics)
5. Output instruction (fidelity, viewport, states to show)
```

**Critical conventions:**
- Always paste `design.md` in full — never summarize it
- State screen number (e.g., "Screen 5 of 17")
- Reference API contracts for field names and validation rules
- Specify both default and error/edge-case states
- Call out anti-patterns explicitly ("NO gradients", "NO glow effects")
- Request specific Lucide icons by name

### 13.3 Iteration Workflow

1. Write prompt following structure pattern
2. Generate in Claude Design
3. Review output, note issues
4. Refine prompt (add constraints, clarify interactions)
5. Regenerate until satisfied
6. Mark screen as ✅ Designed in status matrix
7. Move to next screen

**Do not:** Generate all screens at once. Design sequentially — each screen informs the next.

---

## 14. Consistency Rules

### 14.1 Cross-Screen Consistency Requirements

**Typography:**
- Page titles always use h1 size (32px / 2rem, weight 600)
- Section headings always use h2 (24px / 1.5rem, weight 600)
- Body text always 14px / 0.875rem
- No more than 2 font weights per screen

**Spacing:**
- Section vertical spacing: 96px on landing page, 64px on dashboard pages
- Card internal padding: 40px for focused screens (onboarding), 24px for dense screens (dashboard)
- Form field vertical spacing: 20px between fields, 32px before submit button

**Icons:**
- Default size: 16px inline, 20px for actions, 24px for empty-state heroes, 48px for confirmation screens
- Always Lucide set from React Icons
- Always inherit text color (`currentColor`)

**Buttons:**
- Primary always emerald, secondary always neutral outlined, ghost always text-only
- Loading state always shows spinner inline left of text, button width fixed
- Success transient states always 1.5s duration

### 14.2 Module Page Consistency (Future)

When designing Projects, Experience, Skills, Tags list pages:
- All use same page header pattern (h1 title + subtitle + right-aligned primary action)
- All use same empty state pattern (icon centered, h3, description, CTA)
- All use same filter/search pattern (search input + filter row if needed)
- All use same item action menu pattern (three-dot menu, Edit + Delete options)

---

## 15. Design Collaboration Context

### 15.1 Design References Used

**Vercel dashboard** — primary inspiration for:
- Sidebar navigation structure
- Stacked-card settings pattern
- Dark-on-light aesthetic translated to light-mode Stratum
- Two-column auth screens (adapted)
- Overview dashboard layout concept

**What we took from Vercel:**
- Sidebar + content layout pattern
- Minimal top bar with user menu right
- Card-based settings (future Profile editor)
- Clean typography hierarchy

**What we explicitly did NOT take:**
- Dark mode as default
- Marketing gradients and glow effects
- Project-import flow (not relevant to Stratum)
- Deployment-specific UI patterns

### 15.2 Design Artifacts Organization

**File structure:**
```
/stratum-cms-design/
  design.md                    ← Design system spec
  prompts/
    prompt-1-landing.md        ← Landing page prompt
    prompt-2-signup.md         ← Signup prompt
    prompt-3-login.md          ← Login prompt
    prompt-4-onboarding.md     ← Onboarding prompt
    prompt-5-dashboard.md      ← Dashboard Overview prompt
    prompt-6-post-logout.md    ← Post-Logout prompt
  stratum_cms_ui_ux_knowledge_base.md  ← This document
```

**Claude Design outputs** (not tracked in repo):
- Generated prototypes viewed in browser
- Screenshots saved manually if needed for developer reference
- No React component code extracted (Claude Design output is not production code)

---

## 16. Developer Handoff Notes

### 16.1 What Developers Receive

**From design process:**
- `design.md` — complete design system specification with exact Tailwind classes
- Screen descriptions from prompts (not the prompts themselves)
- Component pattern documentation (this file, §10)
- API endpoint mappings (this file, §11.2)

**What developers implement:**
- React components using Tailwind CSS (per design.md tokens)
- RTK Query slices (one per module, per frontend architecture in KB v2.0)
- Zod validation schemas (mirrored from backend, per coding standards in KB v2.0)
- React Router routes (public, authenticated, admin-gated per §3.1 flow)

### 16.2 Design-to-Code Translation

**Design system tokens map directly to Tailwind:**
- `accent-500` → `emerald-500`
- `bg-subtle` → `neutral-50`
- `text-muted` → `neutral-500`
- `border-subtle` → `neutral-200`

**Component specs in design.md provide exact classes:**
- Buttons: `bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-4 py-2 font-medium text-sm`
- Inputs: `bg-white border border-neutral-300 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`

**Developers do NOT need to interpret design** — classes are specified.

### 16.3 Frontend Folder Structure (from KB v2.0)

```
/client/src/
  /pages          ← Landing, Login, Signup, NotFound
  /dashboard      ← All authenticated screens
    /pages        ← DashboardHome, ProjectsManager, etc.
    /components   ← ProjectCard, ExperienceForm, etc.
  /admin          ← Master Admin screens (role-gated)
  /components     ← Shared UI components, ProtectedRoute, RoleGate
  /validators     ← Zod schemas (mirror backend)
  /redux/api      ← RTK Query slices
```

---

## 17. Next Steps

### 17.1 Immediate Next Screen to Design

**Screen 7: Projects — List Page**
- Location: `/dashboard/projects`
- Purpose: Show all user's projects, allow filtering by tags, navigate to add/edit
- Decisions needed before prompting:
  - Layout: table, card grid, or list?
  - Filtering: tag pills at top, dropdown, or search?
  - Actions per item: inline buttons, three-dot menu, or click-to-edit?
  - Empty state: same pattern as dashboard module cards?
  - Pagination: if needed, offset-based per API contracts

**Discussion required:** Layout and interaction patterns set the template for Experience, Skills, Tags list pages.

### 17.2 Subsequent Screens (Ordered)

1. Projects — Add/Edit form
2. Experience — List
3. Experience — Add/Edit form
4. Skills manager (likely single-page inline CRUD)
5. Tags manager (likely single-page inline CRUD)
6. Resume manager (upload + view/replace)
7. Profile editor (`/me`)
8. Settings (auth, danger zone)
9. Master Admin — Users list
10. Master Admin — User detail
11. 404 / error states

### 17.3 Design System Additions Needed

As module pages are designed, `design.md` will be updated with:
- Table component spec (if used for lists)
- Three-dot action menu pattern
- Filter row / search bar pattern
- Pagination controls (if needed)
- Inline editing patterns (for Skills/Tags managers)
- File upload component (for Resume manager)
- Danger zone card pattern (for Settings)

---

*End of UI/UX Knowledge Base v1.0 — Load this into every Stratum CMS design session.*
