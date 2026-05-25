# Stratum CMS — Design System

> **Purpose**
> This document is the single source of truth for Stratum CMS's visual language. Every Claude Design prompt should reference this file so that screens stay visually consistent across sessions.
>
> **Owner:** Vinay
> **Version:** 1.0
> **Status:** Locked for Phase 0/1 design work. Will evolve as screens are built.

---

## Table of Contents

- [1. Design Philosophy](#1-design-philosophy)
- [2. Color System](#2-color-system)
- [3. Typography](#3-typography)
- [4. Spacing & Layout](#4-spacing--layout)
- [5. Border Radius](#5-border-radius)
- [6. Elevation / Shadows](#6-elevation--shadows)
- [7. Core Components](#7-core-components)
- [8. Iconography](#8-iconography)
- [9. Motion](#9-motion)
- [10. Layout Patterns](#10-layout-patterns)
- [11. Voice & Microcopy](#11-voice--microcopy)
- [12. Accessibility Baseline](#12-accessibility-baseline)
- [13. Theme Strategy (Future)](#13-theme-strategy-future)
- [14. How to Use This Doc in Claude Design Prompts](#14-how-to-use-this-doc-in-claude-design-prompts)
- [15. Component Inventory (Build Status)](#15-component-inventory-build-status)

---

## 1. Design Philosophy

### 1.1 Personality

Stratum CMS is a **developer tool**, not a creative platform or corporate SaaS. The interface should feel:

- **Confident, not flashy.** No gradients-for-the-sake-of-gradients, no decorative illustrations, no marketing fluff inside the product.
- **Quiet, not silent.** The UI gets out of the way, but small details (focus states, subtle motion, considered spacing) signal craft.
- **Direct, not clever.** Labels say what they mean. Buttons say what they do.
- **Functional first, beautiful as a consequence.** Beauty emerges from precision, whitespace, and restraint — not from added ornamentation.

### 1.2 Reference Points

- **Linear** — for sidebar/content layout, restraint, typography hierarchy
- **Vercel dashboard** — for card patterns, settings page structure, sidebar grouping
- **Raycast** — for command-bar-feel inputs, sharp interactions
- **Notion settings** — for stacked-card forms with per-section save

### 1.3 What We Avoid

- Purple/violet gradients on white (overused AI aesthetic)
- Generic system fonts (Inter, Roboto, Arial) as the only choice
- Heavy drop shadows
- Glassmorphism, neumorphism, bevels
- Decorative icons next to every label
- Emoji as UI elements
- Marketing-style hero illustrations inside the dashboard

---

## 2. Color System

### 2.1 Primary Accent — Emerald

The single brand color. Used sparingly for primary actions, active states, and key highlights. **Never as a background flood.**

| Token | Hex | Use |
|---|---|---|
| `--accent-50` | `#ECFDF5` | Subtle accent background (selected row hover, success toast bg) |
| `--accent-100` | `#D1FAE5` | Soft fills, focus ring tint |
| `--accent-500` | `#10B981` | Primary accent — buttons, links, active states |
| `--accent-600` | `#059669` | Primary button hover, pressed states |
| `--accent-700` | `#047857` | Active/pressed text on light bg |

### 2.2 Neutrals — Warm Slate

Avoid pure black/white. Use slightly warm neutrals for a more sophisticated, less clinical feel.

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#FAFAF9` | App background (off-white, warm) |
| `--bg-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--bg-muted` | `#F5F5F4` | Subtle section backgrounds, input fills |
| `--bg-sidebar` | `#FAFAF9` | Sidebar background (matches app bg, separated by border) |
| `--border-subtle` | `#E7E5E4` | Default border, dividers |
| `--border-strong` | `#D6D3D1` | Input borders, focused borders |
| `--text-primary` | `#1C1917` | Headings, primary body text |
| `--text-secondary` | `#57534E` | Labels, secondary content |
| `--text-tertiary` | `#A8A29E` | Placeholders, captions, metadata |
| `--text-disabled` | `#D6D3D1` | Disabled labels |

### 2.3 Semantic Colors

Used only when the meaning is semantic — never decoratively.

| Token | Hex | Use |
|---|---|---|
| `--danger-500` | `#DC2626` | Destructive button bg, error text |
| `--danger-50` | `#FEF2F2` | Error banner background |
| `--warning-500` | `#D97706` | Warning text, block-delete badges |
| `--warning-50` | `#FFFBEB` | Warning banner background |
| `--info-500` | `#0EA5E9` | Info text |
| `--info-50` | `#F0F9FF` | Info banner background |

### 2.4 Color Usage Rules

1. **One accent at a time.** A page should have at most one prominent emerald CTA. Secondary actions use neutral buttons.
2. **Text on accent must pass WCAG AA.** White text on `--accent-500` is fine; black text on it is not.
3. **No colored backgrounds for whole sections.** Color is a highlight, not a wash.
4. **Destructive red is reserved.** Only delete buttons, error states, and danger-zone banners use red.

---

## 3. Typography

### 3.1 Font Stack

**Display + Body:** `"Geist", "Inter", system-ui, -apple-system, sans-serif`
**Monospace:** `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`

Geist is the choice because it's modern, developer-coded, and reads cleanly at all sizes. Inter is the fallback.

Load via Google Fonts or `@vercel/fonts` package.

### 3.2 Type Scale

| Token | Size / Line-Height | Weight | Use |
|---|---|---|---|
| `--text-xs` | `12px / 16px` | 500 | Captions, badges, table metadata |
| `--text-sm` | `14px / 20px` | 400 | Body small, form labels, secondary text |
| `--text-base` | `15px / 24px` | 400 | Default body text |
| `--text-lg` | `17px / 26px` | 500 | Card titles, section subheadings |
| `--text-xl` | `20px / 28px` | 600 | Page section headings |
| `--text-2xl` | `24px / 32px` | 600 | Page titles |
| `--text-3xl` | `30px / 38px` | 700 | Landing page subheads |
| `--text-4xl` | `40px / 48px` | 700 | Landing page hero |
| `--text-5xl` | `56px / 64px` | 700 | Landing page mega-hero (optional) |

### 3.3 Typography Rules

1. **Body text is `--text-base` (15px).** Not 14, not 16. 15 reads as "considered."
2. **No more than 3 type sizes per screen.** Hierarchy comes from size + weight, not from 7 different sizes.
3. **Letter-spacing tightens as size grows.** `tracking-tight` on anything `--text-xl` and above.
4. **Numbers in tables and metrics use tabular figures.** `font-variant-numeric: tabular-nums`.
5. **Code references inline use mono font** at `0.92em` of surrounding text.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |
| `--space-24` | `96px` |

### 4.2 Layout Constants

| Constant | Value |
|---|---|
| Sidebar width (desktop) | `240px` |
| Sidebar collapsed width | `64px` |
| Top bar height | `56px` |
| Content max-width | `1200px` |
| Form field max-width | `480px` (single column forms) |
| Card padding | `24px` |
| Modal width | `480px` (small), `640px` (medium), `800px` (large) |

### 4.3 Grid Rules

- Dashboard content area uses a **12-column grid** with `24px` gutter.
- Forms use a **single-column layout** with `480px` max-width, left-aligned.
- Settings pages use **stacked cards**, full-width up to `800px`.
- Lists/tables go **full-width** of the content area.

---

## 5. Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `4px` | Badges, tags, small chips |
| `--radius-md` | `6px` | Inputs, buttons, small cards |
| `--radius-lg` | `8px` | Cards, modals, panels |
| `--radius-xl` | `12px` | Large feature cards |
| `--radius-full` | `9999px` | Avatars, pill buttons |

**Rule:** Smaller elements get smaller radii. Don't put `12px` radius on a small badge — it looks bubbly.

---

## 6. Elevation / Shadows

Used minimally. Most surfaces are flat with a 1px border instead of a shadow.

| Token | Value | Use |
|---|---|---|
| `--shadow-none` | `none` | Default for cards (border defines them) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Dropdown panels, popovers |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | Modals, dialogs |
| `--shadow-focus` | `0 0 0 3px var(--accent-100)` | Focus ring on inputs/buttons |

---

## 7. Core Components

### 7.1 Buttons

Three variants. **Never invent new ones without adding to this doc first.**

**Primary (`btn-primary`)**
- Background: `--accent-500`
- Text: white
- Hover: `--accent-600`
- Pressed: `--accent-700`
- Disabled: `--bg-muted` bg, `--text-disabled` text
- Padding: `10px 16px`
- Border radius: `--radius-md`
- Font: `--text-sm`, weight 500
- One per page maximum.

**Secondary (`btn-secondary`)**
- Background: white
- Text: `--text-primary`
- Border: `1px solid --border-strong`
- Hover: `--bg-muted` background
- Same padding, radius, font as primary.

**Ghost (`btn-ghost`)**
- Background: transparent
- Text: `--text-secondary`
- Hover: `--bg-muted` background, `--text-primary` text
- No border.

**Destructive (`btn-danger`)**
- Background: `--danger-500`
- Text: white
- Used only for delete actions, always with a confirmation step.

**Sizes:** default (`10px 16px`), small (`6px 12px`, `--text-xs`), large (`12px 20px`, `--text-base`).

### 7.2 Inputs

- Height: `40px` (default), `32px` (small)
- Padding: `10px 12px`
- Border: `1px solid --border-strong`
- Border radius: `--radius-md`
- Background: white
- Text: `--text-primary` at `--text-sm`
- Placeholder: `--text-tertiary`
- Focus: border becomes `--accent-500`, add `--shadow-focus`
- Error: border becomes `--danger-500`, error text below at `--text-xs --danger-500`

**Labels** sit above inputs, `--text-sm`, weight 500, `--text-secondary`, `--space-2` below.

**Helper text** sits below inputs, `--text-xs`, `--text-tertiary`, `--space-2` above.

### 7.3 Cards

- Background: white (`--bg-surface`)
- Border: `1px solid --border-subtle`
- Border radius: `--radius-lg`
- Padding: `--space-6` (`24px`)
- No shadow by default.
- Hover (for clickable cards): border becomes `--border-strong`, slight `translateY(-1px)` lift with `transition: 150ms ease`.

### 7.4 Sidebar Navigation

- Width: `240px`
- Background: `--bg-sidebar` (`#FAFAF9` — same as app bg, separated by `1px solid --border-subtle` on right edge)
- Item padding: `8px 12px`
- Item border radius: `--radius-md`
- Default item: `--text-secondary`, `--text-sm`, weight 400
- Hover: `--bg-muted` background, `--text-primary` text
- Active: `--accent-50` background, `--accent-700` text, weight 500, small `--accent-500` indicator on left edge (3px wide, full height of item)
- Icon size: `16px`, `--space-3` gap to label
- Section labels: `--text-xs`, weight 600, `--text-tertiary`, uppercase, letter-spacing `0.05em`, padding `16px 12px 8px`

### 7.5 Tables / Lists

- Row height: `48px`
- Row border bottom: `1px solid --border-subtle`
- Header: `--text-xs`, weight 500, `--text-tertiary`, uppercase, letter-spacing `0.05em`
- Row hover: `--bg-muted` background
- Cell padding: `12px 16px`

### 7.6 Badges / Tags

- Padding: `2px 8px`
- Border radius: `--radius-sm`
- Font: `--text-xs`, weight 500
- Default: `--bg-muted` bg, `--text-secondary` text
- Accent: `--accent-50` bg, `--accent-700` text (used for system tag `featured`)
- Danger: `--danger-50` bg, `--danger-500` text

### 7.7 Modals

- Width: `480px` default
- Padding: `--space-8` (`32px`)
- Border radius: `--radius-lg`
- Shadow: `--shadow-md`
- Backdrop: `rgba(28, 25, 23, 0.4)` with `backdrop-filter: blur(4px)`
- Close button (X) top-right, `--text-tertiary`, hover `--text-primary`

### 7.8 Empty States

- Centered content in card or section
- Icon at top (line-style, `48px`, `--text-tertiary`)
- Title `--text-lg`, `--text-primary`, weight 500
- Description `--text-sm`, `--text-secondary`, max-width `360px`
- Primary action button below (`btn-primary`)
- Vertical spacing: `--space-3` between title and description, `--space-6` between description and button

### 7.9 Toasts (React Hot Toast)

- Position: top-right
- Width: `360px`
- Padding: `12px 16px`
- Border radius: `--radius-md`
- Background: white
- Border: `1px solid --border-subtle`
- Shadow: `--shadow-sm`
- Success: small `--accent-500` dot or check icon on left
- Error: `--danger-500` accent
- Duration: 4 seconds default

---

## 8. Iconography

- **Library:** Lucide (via `lucide-react`) — clean line icons, developer-tool feel
- **Stroke width:** `1.5px` default
- **Size scale:** `14px`, `16px`, `20px`, `24px` (no other sizes)
- **Color:** Inherits from text color by default; never use accent color for decorative icons
- **Rule:** Icons must communicate something. No icon "just to add visual interest."

---

## 9. Motion

### 9.1 Timing

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | `120ms ease` | Micro-interactions (hover, focus) |
| `--motion-base` | `200ms ease` | Card hovers, button presses, dropdowns |
| `--motion-slow` | `320ms ease-out` | Modal entry, page transitions |

### 9.2 Motion Rules

1. **No animation without a reason.** Motion communicates state change, not decoration.
2. **Page transitions are subtle.** Fade + 4px slide, nothing more.
3. **Loading states use skeleton screens**, not spinners, for content areas.
4. **Spinners only for action buttons in progress.**
5. **No infinite bounce/pulse animations** except for loading skeletons.

---

## 10. Layout Patterns

### 10.1 Authenticated App Shell

```
┌────────────────────────────────────────────────────────┐
│  [Sidebar 240px]   [Top bar 56px              ] [Avatar] │
│                  ├──────────────────────────────────────│
│  ├ Logo           │                                      │
│  ├                │   ┌──────────────────────────────┐  │
│  ├ Nav section 1  │   │                              │  │
│  │   • Dashboard  │   │   Content area               │  │
│  │   • Projects   │   │   max-width 1200px           │  │
│  │   • Experience │   │   padding 32px               │  │
│  │   • Skills     │   │                              │  │
│  │   • Tags       │   │                              │  │
│  │   • Resume     │   │                              │  │
│  │                │   │                              │  │
│  ├ Nav section 2  │   │                              │  │
│  │   • Profile    │   │                              │  │
│  │   • Settings   │   │                              │  │
│  │                │   │                              │  │
│  ├ User card      │   │                              │  │
│  │   (bottom)     │   └──────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 10.2 Public / Auth Shell

- Centered card on `--bg-base` background
- Logo top-left of viewport, `32px` padding
- Card: `--bg-surface`, `--radius-lg`, `--space-10` (`40px`) padding
- Card max-width: `400px`
- Footer link below card (`--text-sm`, `--text-secondary`)

### 10.3 Landing Page

- Full-width sections, generous vertical rhythm (`--space-24` between major sections)
- Hero: centered, max-width `720px` for text content
- Subsequent sections: alternating background (`--bg-base` ↔ `--bg-muted`) to create visual rhythm
- Footer: 4-column grid on desktop, single column on mobile

---

## 11. Voice & Microcopy

### 11.1 Tone

- **Direct:** "Delete project" not "Are you sure you'd like to remove this project?"
- **Calm:** No exclamation marks except in success toasts.
- **Practical:** Empty states tell the user what to do next, not why nothing is there.

### 11.2 Button Labels

- Verbs in active form: "Create project," "Save changes," "Delete account"
- Never "OK" or "Submit" — always specific
- Cancel actions: "Cancel" (not "Discard," "Nevermind," etc.)

### 11.3 Error Messages

- State what went wrong, then what to do
- Bad: "Invalid input."
- Good: "Email must include an @ symbol."

### 11.4 Empty States

- Bad: "No projects yet!"
- Good: "Add your first project to start building your portfolio."

---

## 12. Accessibility Baseline

1. **Color contrast:** All text passes WCAG AA (4.5:1 for body, 3:1 for large text).
2. **Focus states:** Every interactive element has a visible focus ring (`--shadow-focus`).
3. **Form labels:** Always present and programmatically associated (`for` / `id`).
4. **Touch targets:** Minimum `40x40px` for primary actions.
5. **Keyboard:** All flows completable without mouse.
6. **Aria:** Modals trap focus and use `aria-modal`. Toasts use `role="status"`.

---

## 13. Theme Strategy (Future)

Phase 1 ships **light mode only**. Theme switching is a Phase 7+ feature.

When dark mode is added:
- All color tokens get a `.dark` variant
- Accent emerald stays the same (already passes contrast in both modes)
- `--bg-base` becomes `#0C0A09` (near-black, warm)
- `--bg-surface` becomes `#1C1917`
- Text colors invert (primary becomes near-white)
- Borders become slightly lighter than surface

**System preference detection** via `prefers-color-scheme`, with manual override stored in `localStorage`.

---

## 14. How to Use This Doc in Claude Design Prompts

When writing a prompt for Claude Design, always include this preamble:

```
This design is for Stratum CMS — a developer portfolio CMS.

Design system rules (must follow):
- Light mode only
- Primary accent: emerald #10B981, hover #059669
- Font: Geist (fallback Inter)
- Background: warm off-white #FAFAF9, surfaces #FFFFFF
- Text: #1C1917 primary, #57534E secondary, #A8A29E tertiary
- Border: 1px solid #E7E5E4 (subtle), #D6D3D1 (strong)
- Border radius: 6px inputs/buttons, 8px cards, 12px large cards
- Body text: 15px, line-height 24px
- Spacing: 4px base scale (use 4, 8, 12, 16, 24, 32, 48, 64)
- Icons: Lucide, 1.5px stroke
- Style: clean, minimal, developer-tool confident — like Linear, Vercel, Raycast
- Avoid: gradients, drop shadows beyond subtle, decorative illustrations,
  emoji, purple/violet, glassmorphism, generic SaaS aesthetics
```

Then describe the **specific screen** below that preamble.

---

## 15. Component Inventory (Build Status)

Tracked here so we don't redesign things mid-flow.

| Component | Status | First Used In |
|---|---|---|
| Button (primary, secondary, ghost, danger) | Specified | TBD |
| Input (text, email, password) | Specified | Signup |
| Textarea | Specified | TBD |
| Select / Dropdown | Pending | Project form |
| Multi-select chip picker | Pending | Project form (skills, tags) |
| File uploader | Pending | Resume, Media |
| Card | Specified | Dashboard |
| Sidebar | Specified | Dashboard shell |
| Top bar | Specified | Dashboard shell |
| Modal | Specified | Delete confirmations |
| Toast | Specified | All mutations |
| Badge / Tag chip | Specified | Projects list |
| Empty state | Specified | Module pages on first visit |
| Skeleton loader | Pending | Module pages |
| Avatar | Pending | Top bar, sidebar user card |
| Pagination | Pending | List pages |

---

*End of design.md v1.0 — Stratum CMS Design System*
