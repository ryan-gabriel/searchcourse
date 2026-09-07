# SearchCourse Frontend Redesign — Design Spec

## Overview

Elevated editorial redesign of SearchCourse's public and admin pages. Keep the warm editorial aesthetic but make it more premium through better typography (Geist font), refined color tokens, consistent spacing, polished component states, subtle animations, and proper accessibility.

**Scope:** Public pages (homepage, courses listing, course detail, roadmaps, about) + admin dashboard.  
**Approach:** Design system first — establish foundation tokens, then apply systematically.

## 1. Typography

**Font:** Switch from Inter to **Geist** via `next/font/local` (ships with Next.js).

| Role | Size | Weight | Letter-spacing | Line-height |
|------|------|--------|----------------|-------------|
| Display (hero h1) | `text-5xl md:text-6xl lg:text-7xl` | 700 | `tracking-tight` (-0.02em) | `leading-[1.05]` |
| Section heading (h2) | `text-3xl md:text-4xl` | 600 | `tracking-tight` | `leading-[1.15]` |
| Card heading (h3) | `text-lg` | 600 | `tracking-tight` | `leading-snug` |
| Body | `text-base` | 400 | default | `leading-relaxed` |
| Small / labels | `text-sm` | 500 | `tracking-wide` (0.02em) | `leading-normal` |
| Caption / metadata | `text-xs` | 500 | `tracking-wide` (0.04em) | `leading-normal` |

**Key changes:**
- Introduce `font-medium` (500) more broadly for subtle hierarchy
- Tighter letter-spacing on headlines, positive tracking on labels
- `leading-relaxed` for body text readability

## 2. Color Palette

### Light mode

| Token | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| `--background` | `#faf9f7` | `#faf9f7` | Keep |
| `--foreground` | `#1a1917` | `#1a1917` | Keep |
| `--surface` | `#ffffff` | `#ffffff` | Keep |
| `--surface-muted` | `#f1efe9` | `#f0ece4` | Slightly warmer |
| `--border` | `#e5e1d8` | `#ddd8cc` | More visible for card definition |
| `--accent` | `#1a1917` | `#1a1917` | Keep monochrome inverted |
| `--accent-ink` | `#faf9f7` | `#faf9f7` | Keep |
| `--price` | `#0b7a3b` | `#0b7a3b` | Keep |
| `--surface-elevated` | — | `#ffffff` | New: for modals, popovers |
| `--muted` | — | `#6b6560` | New: dedicated muted text token |

### Dark mode

| Token | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| `--background` | `#141311` | `#12110f` | Slightly deeper |
| `--foreground` | `#f4f2ec` | `#f4f2ec` | Keep |
| `--surface` | `#1d1b18` | `#1c1a17` | Slightly deeper |
| `--surface-muted` | `#262320` | `#242220` | Keep similar |
| `--border` | `#35322c` | `#3a3731` | More visible |
| `--accent` | `#f4f2ec` | `#f4f2ec` | Keep |
| `--price` | `#57c77d` | `#57c77d` | Keep |

**Key changes:**
- Add `--surface-elevated` and `--muted` tokens
- Replace hard-coded `text-foreground/50` with `text-muted`
- Dark mode backgrounds slightly deeper for richness

## 3. Spacing and Layout

| Context | Max-width | Padding |
|---------|-----------|---------|
| Page content | `max-w-6xl` (1152px) | `px-4 sm:px-6 lg:px-8` |
| Wide sections | `max-w-7xl` (1280px) | `px-4 sm:px-6 lg:px-8` |
| Card grids | `max-w-6xl` | `gap-6` |

| Section | Top padding | Bottom padding |
|---------|-------------|----------------|
| Hero | `pt-20 lg:pt-28` | `pb-16 lg:pb-24` |
| Stats bar | `py-12` | `py-12` |
| Content sections | `py-16 lg:py-24` | `py-16 lg:py-24` |
| CTA band | `py-16 lg:py-20` | `py-16 lg:py-20` |

## 4. Component Tokens

### Buttons

| Variant | Styles |
|---------|--------|
| `btn-primary` | `bg-accent text-accent-ink font-medium px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200` |
| `btn-secondary` | `bg-transparent text-foreground border border-border font-medium px-5 py-2.5 rounded-lg hover:bg-surface-muted active:scale-[0.98] transition-all duration-200` |
| `btn-ghost` | `bg-transparent text-foreground font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors duration-200` |
| `btn-sm` | `px-3 py-1.5 text-sm rounded-md` |

### Cards

| Variant | Styles |
|---------|--------|
| Default | `bg-surface rounded-xl border border-border p-5 hover:border-border/60 transition-colors duration-200` |
| Elevated | `bg-surface-elevated rounded-xl shadow-sm border border-border/50 p-5` |
| Interactive | Adds `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200` |

### Badges

| Variant | Styles |
|---------|--------|
| Default | `inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-muted text-foreground` |
| Accent | `bg-accent text-accent-ink` |
| Price | `text-price font-semibold` |

### Inputs

| State | Styles |
|-------|--------|
| Default | `w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors duration-200` |
| Error | Adds `border-red-500 focus:ring-red-500/20 focus:border-red-500` |

## 5. Motion and Transitions

- Cards: subtle border shift + shadow lift
- Buttons: opacity + scale on press
- Scroll reveals via IntersectionObserver with `data-reveal` attribute
- Respect `prefers-reduced-motion: reduce`
- Transition standards: `transition-colors duration-200` for color, `transition-all duration-200` for transforms

## 6. Accessibility

- Skip-to-content link in root layout
- `prefers-reduced-motion` CSS media query
- `aria-expanded` on accordions and filter dropdowns
- Currency formatting fix (locale-aware)
- Skeleton loaders replacing plain text loading in admin
- Meaningful `alt` text on all images
- Focus trap in mobile menu
- Status indicators alongside color-only pills
- `aria-label` on rating containers

## 7. Loading and Error States

- Custom 404 pages (global + route-specific)
- Error boundaries with retry buttons
- Loading skeletons for all routes
- Admin skeleton table rows replacing plain text
