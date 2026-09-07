# SearchCourse Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate SearchCourse's public and admin UI to a premium editorial standard through systematic typography, color, spacing, component, accessibility, motion, and error-state improvements.

**Architecture:** Design system first approach — update global tokens in `globals.css`, then propagate changes through components and pages. All styling uses Tailwind CSS v4 with CSS-first config. No new dependencies required (Geist font ships with Next.js).

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript, lucide-react

## Global Constraints

- Next.js 16.3.4, React 19.2.3, Tailwind CSS v4 (CSS-first config, no tailwind.config.js)
- Node >= 22
- No new dependencies — Geist font via `next/font/local`, all else is Tailwind utility classes
- Existing `cn()` helper in `src/lib/utils.ts` uses `clsx` only (no tailwind-merge)
- Dark mode via `.dark` class on `<html>`, custom ThemeProvider (not next-themes)
- Keep all existing functionality working — visual-only changes unless explicitly noted

---

### Task 1: Design Foundation — Typography & Color Tokens

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Nothing (foundation task)
- Produces: Updated CSS variables and font that all subsequent tasks depend on

- [ ] **Step 1: Switch font from Inter to Geist in layout.tsx**

Replace the Inter import and configuration with Geist. Use `next/font/local` to load Geist VF from `src/app/fonts/`. Set `variable: '--font-geist-sans'` and add `font-sans` class to body.

- [ ] **Step 2: Add new color tokens and refine dark mode in globals.css**

In `:root` add `--surface-elevated: #ffffff` and `--muted: #6b6560`. In `.dark` update backgrounds to deeper values and add dark variants. Register both in `@theme inline`.

- [ ] **Step 3: Add reduced-motion media query and scroll reveal keyframes in globals.css**

Add `@keyframes slideUp`, `[data-reveal]` styles, and `@media (prefers-reduced-motion: reduce)` block.

- [ ] **Step 4: Verify font loads and colors apply**

Run `npm run dev`, check homepage loads with Geist font and correct colors in both modes.

- [ ] **Step 5: Commit**

---

### Task 2: Component Tokens & ScrollReveal Component

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/ScrollReveal.tsx`

**Interfaces:**
- Consumes: CSS tokens from Task 1
- Produces: Updated button/card/badge/input utility classes, ScrollReveal component

- [ ] **Step 1: Update button utility classes in globals.css**

Replace existing `.btn` styles with refined versions including `active:scale(0.97)`, `.btn-ghost`, `.btn-sm` variants.

- [ ] **Step 2: Add card, badge, and input utility classes in globals.css**

Add `.card`, `.card-elevated`, `.badge`, `.badge-accent`, `.badge-price`, `.input` classes.

- [ ] **Step 3: Create ScrollReveal.tsx client component**

IntersectionObserver-based wrapper that adds `.revealed` class when element enters viewport. Supports `delay` prop for staggered reveals.

- [ ] **Step 4: Verify utility classes work**

Run `npm run dev`, test classes on elements.

- [ ] **Step 5: Commit**

---

### Task 3: Public Page Layouts & Spacing

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/courses/page.tsx`
- Modify: `src/app/courses/[slug]/page.tsx`
- Modify: `src/app/roadmaps/page.tsx`
- Modify: `src/app/roadmaps/[slug]/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/ui/SearchForm.tsx`

**Interfaces:**
- Consumes: Tokens from Task 1, ScrollReveal from Task 2
- Produces: Updated page layouts

- [ ] **Step 1: Update homepage spacing and add scroll reveals (src/app/page.tsx)**

Adjust hero padding, wrap sections in `<ScrollReveal>`.

- [ ] **Step 2: Update courses listing page spacing (src/app/courses/page.tsx)**

Adjust header, grid gap, pagination spacing.

- [ ] **Step 3: Update course detail page spacing (src/app/courses/[slug]/page.tsx)**

Adjust breadcrumb, content area, grid gap, info cards gap. Wrap sections in ScrollReveal.

- [ ] **Step 4: Update roadmaps pages spacing**

Adjust header, grid gap, CTA padding on both roadmaps pages.

- [ ] **Step 5: Update about page spacing (src/app/about/page.tsx)**

Adjust hero, content sections, stats padding. Wrap sections in ScrollReveal.

- [ ] **Step 6: Update login, header, footer, search form spacing**

Minor padding adjustments across these files.

- [ ] **Step 7: Verify all pages render correctly**

Visit each page, confirm spacing and scroll reveals work.

- [ ] **Step 8: Commit**

---

### Task 4: Course & Roadmap Component Upgrades

**Files:**
- Modify: `src/components/course/CourseCard.tsx`
- Modify: `src/components/course/CourseGrid.tsx`
- Modify: `src/components/course/SearchBar.tsx`
- Modify: `src/app/courses/SortDropdown.tsx`
- Modify: `src/app/courses/[slug]/StickyCourseSidebar.tsx`
- Modify: `src/app/courses/[slug]/CourseAccordion.tsx`
- Modify: `src/components/roadmap/RoadmapCard.tsx`
- Modify: `src/components/roadmap/RoadmapStep.tsx`
- Modify: `src/components/roadmap/RoadmapProgress.tsx`
- Modify: `src/components/roadmap/SavingsBadge.tsx`
- Modify: `src/components/roadmap/RoadmapFilters.tsx`

**Interfaces:**
- Consumes: Tokens from Task 1, utility classes from Task 2
- Produces: Polished components

- [ ] **Step 1: Upgrade CourseCard.tsx** — bg-surface-elevated, padding, thumbnail height, hover effects
- [ ] **Step 2: Upgrade CourseGrid.tsx** — gap-6 to gap-8
- [ ] **Step 3: Upgrade SearchBar.tsx** — aria-expanded, aria-controls on filter toggle
- [ ] **Step 4: Upgrade SortDropdown.tsx** — padding adjustment
- [ ] **Step 5: Upgrade StickyCourseSidebar.tsx** — elevated bg, padding, shadow
- [ ] **Step 6: Upgrade CourseAccordion.tsx** — aria-expanded, aria-controls, padding
- [ ] **Step 7: Upgrade RoadmapCard.tsx** — elevated bg, padding, hover effects
- [ ] **Step 8: Upgrade RoadmapStep.tsx** — elevated bg, gap, hover
- [ ] **Step 9: Upgrade RoadmapProgress.tsx** — role="progressbar" ARIA, muted text
- [ ] **Step 10: Upgrade SavingsBadge.tsx** — muted text token
- [ ] **Step 11: Upgrade RoadmapFilters.tsx** — spacing
- [ ] **Step 12: Verify all components** — check rendering and interactions
- [ ] **Step 13: Commit**

---

### Task 5: Admin Pages — Skeleton Loaders & Polish

**Files:**
- Modify: `src/components/ui/Skeleton.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/courses/page.tsx`
- Modify: `src/app/admin/platforms/page.tsx`
- Modify: `src/app/admin/categories/page.tsx`
- Modify: `src/app/admin/coupons/page.tsx`
- Modify: `src/app/admin/roadmaps/page.tsx`
- Modify: `src/app/admin/analytics/page.tsx`
- Modify: `src/app/admin/settings/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/admin/Sidebar.tsx`
- Modify: `src/components/admin/StatCard.tsx`
- Modify: `src/components/admin/DataTable.tsx`
- Modify: `src/components/admin/Modal.tsx`
- Modify: `src/components/admin/FormField.tsx`

**Interfaces:**
- Consumes: Tokens from Tasks 1-2
- Produces: Polished admin UI with skeleton loading

- [ ] **Step 1: Add admin skeleton variants to Skeleton.tsx** — AdminStatSkeleton, AdminTableSkeleton
- [ ] **Step 2: Replace plain text loading in admin pages** — swap "Loading..." text with skeleton components
- [ ] **Step 3: Polish admin components** — elevated bg, hover effects, transitions
- [ ] **Step 4: Verify admin pages** — check all admin routes
- [ ] **Step 5: Commit**

---

### Task 6: Global Accessibility Fixes

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/ui/SearchForm.tsx`
- Modify: `src/lib/utils.ts`

**Interfaces:**
- Consumes: Layout from Task 1
- Produces: Accessible skip links, ARIA, currency fix

- [ ] **Step 1: Add skip-to-content link in layout.tsx**
- [ ] **Step 2: Add ARIA attributes to Header mobile menu** — aria-expanded, aria-controls
- [ ] **Step 3: Add role and aria-label to Footer**
- [ ] **Step 4: Add search semantics to SearchForm** — role="search", aria-label
- [ ] **Step 5: Fix currency formatting in utils.ts** — locale map per currency
- [ ] **Step 6: Verify accessibility** — tab through, check ARIA, test currency
- [ ] **Step 7: Commit**

---

### Task 7: Motion & Hover Refinements

**Files:**
- Modify: `src/components/course/CourseCard.tsx`
- Modify: `src/components/roadmap/RoadmapCard.tsx`
- Modify: `src/components/roadmap/RoadmapStep.tsx`
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: ScrollReveal from Task 2, tokens from Task 1
- Produces: Polished hover states

- [ ] **Step 1: Refine CourseCard hover** — shadow-lg, translate-y, transitions
- [ ] **Step 2: Refine RoadmapCard hover** — shadow-lg, translate-y
- [ ] **Step 3: Refine RoadmapStep hover** — shadow-md on course cards
- [ ] **Step 4: Refine Header mobile menu** — smooth open/close transition
- [ ] **Step 5: Verify motion** — hover effects, reduced-motion check
- [ ] **Step 6: Commit**

---

### Task 8: Loading & Error States

**Files:**
- Create: `src/app/not-found.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/loading.tsx`
- Create: `src/app/courses/not-found.tsx`
- Create: `src/app/courses/error.tsx`
- Create: `src/app/courses/loading.tsx`
- Create: `src/app/courses/[slug]/error.tsx`
- Create: `src/app/courses/[slug]/loading.tsx`
- Create: `src/app/roadmaps/not-found.tsx`
- Create: `src/app/roadmaps/error.tsx`
- Create: `src/app/roadmaps/loading.tsx`
- Create: `src/app/roadmaps/[slug]/error.tsx`
- Create: `src/app/roadmaps/[slug]/loading.tsx`
- Create: `src/app/admin/not-found.tsx`
- Create: `src/app/admin/error.tsx`

**Interfaces:**
- Consumes: Tokens from Task 1, Skeleton components from Task 5
- Produces: Complete loading/error/404 experience

- [ ] **Step 1: Create global not-found.tsx** — branded 404 with back-to-home CTA
- [ ] **Step 2: Create global error.tsx** — error boundary with retry button
- [ ] **Step 3: Create global loading.tsx** — simple pulse skeleton
- [ ] **Step 4: Create route-specific not-found pages** — courses, roadmaps, admin
- [ ] **Step 5: Create route-specific error pages** — each with retry + back link
- [ ] **Step 6: Create route-specific loading pages** — using existing skeleton components
- [ ] **Step 7: Verify all loading/error/404 pages** — test each route
- [ ] **Step 8: Commit**
