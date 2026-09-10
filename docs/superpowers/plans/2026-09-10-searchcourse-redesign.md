# SearchCourse Dark-Tech Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin all public pages and shared layout to a modern dark-tech / premium emerald design system, dark-first with a working light toggle.

**Architecture:** All colors flow through semantic CSS variables in `src/app/globals.css`. Redefining those values re-skins every surface. Components already use semantic Tailwind classes (`bg-surface`, `text-foreground`, `text-price`, `bg-accent`, `text-muted`, `border-border`), so most work is token values plus targeted class fixes where raw colors/emojis were used. `ThemeProvider` flips to dark default with a pre-hydration script to avoid a light flash.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (`@theme inline`), `next/font/google` (Outfit), `geist` (Geist Sans), `lucide-react`.

## Global Constraints

- Only change values of existing semantic tokens; do not rename tokens (`--background`, `--foreground`, `--surface`, `--surface-muted`, `--surface-elevated`, `--border`, `--accent`, `--accent-ink`, `--price`, `--muted`).
- New tokens allowed: `--rating`, `--rating-ink`, `--danger`.
- Scope: public pages + shared layout only. Do NOT modify `src/app/admin/**`, `src/components/admin/**`, `src/services/**`, `src/validations/**`, `src/jobs/**`, `src/app/api/**`, or any Prisma/DB file.
- No emoji as icons anywhere in public UI (use `lucide-react`).
- No raw Tailwind color literals in public components: no `amber-*`, `red-*`, `blue-*`, `text-white`, `bg-black`, `border-2 border-dashed` with hardcoded colors. Use semantic tokens.
- Every interactive element: `cursor-pointer` and visible focus.
- Hover transitions 150-300ms. Respect `prefers-reduced-motion` (already handled globally; do not regress).
- Preserve all behavior: routing, URL params, `formatPrice`, discount math, `src=tg` affiliate logic, JsonLd, metadata, `revalidate` values, `'use client'` directives.
- No new runtime dependencies. No GSAP. Outfit is added via `next/font/google` (build-time, no package install).
- After every task run `npm run typecheck` and `npm run lint`.
- Do NOT commit. The user has instructed no commits unless explicitly asked.

---

### Task 1: Theme tokens, fonts, dark-first

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/ThemeProvider.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--rating`, `--rating-ink`, `--danger` (plus existing tokens with new values); `--font-display` theme variable and the `font-display` Tailwind utility; `<html>` without a hardcoded theme class.

- [ ] **Step 1: Rewrite `src/app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #0b0f0d;
  --foreground: #edf2ef;
  --surface: #121715;
  --surface-muted: #1b211e;
  --surface-elevated: #161c19;
  --border: #28302c;
  --accent: #10b981;
  --accent-ink: #04140c;
  --price: #34d399;
  --muted: #8c968f;
  --rating: #fbbf24;
  --rating-ink: #0b0f0d;
  --danger: #f87171;
}

.light {
  --background: #f6f9f7;
  --foreground: #0a0f0d;
  --surface: #ffffff;
  --surface-muted: #edf2ef;
  --surface-elevated: #ffffff;
  --border: #d8e0db;
  --accent: #059669;
  --accent-ink: #ffffff;
  --price: #047857;
  --muted: #5a655f;
  --rating: #d97706;
  --rating-ink: #ffffff;
  --danger: #dc2626;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-surface-elevated: var(--surface-elevated);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-price: var(--price);
  --color-muted: var(--muted);
  --color-rating: var(--rating);
  --color-rating-ink: var(--rating-ink);
  --color-danger: var(--danger);
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-display: var(--font-outfit), var(--font-geist-sans), system-ui, sans-serif;
}

*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

html {
  color-scheme: dark;
}

html.light {
  color-scheme: light;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  select,
  summary,
  a {
    cursor: pointer;
  }
}

h1,
h2,
h3,
.font-display {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out both;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn:active {
  transform: scale(0.97);
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.btn-primary {
  background: var(--accent);
  color: var(--accent-ink);
}
.btn-primary:hover {
  filter: brightness(1.08);
}
.btn-secondary {
  background: transparent;
  color: var(--foreground);
  border: 1px solid var(--border);
}
.btn-secondary:hover {
  background: var(--surface-muted);
}
.btn-ghost {
  background: transparent;
  color: var(--foreground);
  padding: 0.5rem 0.75rem;
}
.btn-ghost:hover {
  background: var(--surface-muted);
}
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.card {
  background: var(--surface);
  border-radius: 1rem;
  border: 1px solid var(--border);
  padding: 1.25rem;
  transition: all 0.2s ease;
}
.card-elevated {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--surface-muted);
  color: var(--foreground);
}
.badge-accent {
  background: var(--accent);
  color: var(--accent-ink);
}
.badge-price {
  color: var(--price);
  font-weight: 600;
}
.input {
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input::placeholder {
  color: var(--muted);
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}

[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-reveal] {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Update `src/app/layout.tsx` for Outfit and dark-first**

At the top, after the existing `GeistSans` import, add:

```tsx
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});
```

Change the `<html>` opening tag from:

```tsx
<html lang="en" className="light" suppressHydrationWarning>
  <body className={`${GeistSans.variable} antialiased min-h-screen flex flex-col`}>
```

to:

```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r);}catch(e){document.documentElement.classList.add('dark');}})();`,
      }}
    />
  </head>
  <body
    className={`${GeistSans.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
  >
```

- [ ] **Step 3: Update the Telegram banner block in `src/app/layout.tsx`**

Replace the existing fixed banner block:

```tsx
      {/* Sticky Telegram Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-900 text-white text-sm py-3 px-4 text-center opacity-95 transition-opacity duration-300 hover:opacity-100">
        <span className="font-medium">💰 FREE UDEMY DEALS DAILY — JOIN 500+ SAVVY LEARNERS</span>
        <a href="https://t.me/searchcourses" className="font-medium underline underline-offset-2 ml-2" target="_blank" rel="noopener noreferrer">
          t.me/searchcourses
        </a>
      </div>
```

with:

```tsx
      <div className="h-14" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
          <Send className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-foreground/80">Free Udemy deals daily</span>
          <a
            href="https://t.me/searchcourses"
            className="font-semibold text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join 500+ learners
          </a>
        </div>
      </div>
```

Add `Send` to the lucide import in `layout.tsx`:

```tsx
import { Send } from 'lucide-react';
```

- [ ] **Step 4: Update `src/components/layout/ThemeProvider.tsx`**

Change the initial state from light to dark:

```tsx
    const [theme, setTheme] = useState<Theme>('dark');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
```

Change the load effect so a missing saved theme falls back to `'dark'`:

```tsx
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);
```

(Unchanged — `useState('dark')` already covers the no-saved case.)

Change the apply effect so `localStorage` is only written when a theme is explicitly set, and `setTheme` is exposed as before. Replace the body of the second effect:

```tsx
    useEffect(() => {
        const root = window.document.documentElement;

        let resolved: 'light' | 'dark' = 'dark';

        if (theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        } else {
            resolved = theme;
        }

        setResolvedTheme(resolved);
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        localStorage.setItem('theme', theme);
    }, [theme]);
```

This is unchanged behavior except the `resolved` default is now `'dark'`.

- [ ] **Step 5: Verify**

Run: `npm run typecheck`
Expected: PASS (0 errors).

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: build succeeds; Outfit fetched at build time.

Manual: run `npm run dev`, open `/`. Page renders dark by default. Toggle to light works. Refresh keeps the chosen theme with no light flash.

- [ ] **Step 6: Commit — SKIP.** The user does not want commits. Do not run `git commit`.

---

### Task 2: Header and Footer

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: no exported API changes.

- [ ] **Step 1: Restyle `src/components/layout/Header.tsx`**

Replace the `<header>` opening element:

```tsx
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
```

Replace the desktop nav link className body with an active-aware version. Replace the whole desktop nav block:

```tsx
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                                    'text-foreground/70 hover:text-foreground hover:bg-surface-muted'
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
```

Replace the theme toggle and mobile button classes:

```tsx
                        <button
                            onClick={toggleTheme}
                            className="cursor-pointer p-2.5 rounded-lg text-foreground/70 hover:text-accent hover:bg-surface-muted transition-colors duration-200"
                            aria-label="Toggle theme"
                        >
```

```tsx
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden cursor-pointer p-2.5 rounded-lg text-foreground/70 hover:text-accent hover:bg-surface-muted transition-colors duration-200"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-navigation"
                        >
```

Replace the mobile nav link classes:

```tsx
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200',
                                        'text-foreground/70 hover:text-foreground hover:bg-surface-muted'
                                    )}
```

- [ ] **Step 2: Restyle `src/components/layout/Footer.tsx`**

Replace the brand icon block:

```tsx
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-accent-ink" />
                            </div>
```

Replace the two link-list classNames from `text-foreground opacity-70 hover:text-accent` to:

```tsx
                                        className="text-foreground/70 hover:text-accent text-sm transition-colors duration-200"
```

Replace the "Built with" line to drop inline color styling:

```tsx
                        <p className="text-foreground/50 text-sm">
                            Built with <Heart className="w-4 h-4 inline text-accent" /> for lifelong learners.
                        </p>
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Manual: header is translucent dark on scroll; mobile menu opens/closes; theme toggle works; footer hover states are emerald.

---

### Task 3: CourseCard

**Files:**
- Modify: `src/components/course/CourseCard.tsx`

**Interfaces:**
- Consumes: tokens, `formatPrice`, `calculateDiscountPercentage`, `formatCompactNumber`, `CourseWithDetails` (unchanged).
- Produces: same `CourseCard({ course }: CourseCardProps)` signature.

**Link ruling (user):** CourseCard's title and thumbnail link to the course detail page `/courses/${course.slug}`, NOT the affiliate URL. The "Get Deal" button remains the affiliate CTA (`/api/out/${course.id}`). This preserves the current list navigation behavior.

- [ ] **Step 1: Point title and thumbnail at the detail page**

In `CourseCard.tsx`, change the thumbnail `Link` and the title `Link` so their `href` is `/courses/${course.slug}` instead of `affiliateUrl`:

```tsx
            <Link href={`/courses/${course.slug}`} className="block relative h-48 overflow-hidden">
```

```tsx
                    <Link
                        href={`/courses/${course.slug}`}
                        className="hover:text-accent transition-colors"
                    >
```

Keep `const affiliateUrl = \`/api/out/${course.id}\`;` and `handleRevealDeal` unchanged — the Get Deal button still opens the affiliate URL.

- [ ] **Step 2: Replace rating stars markup**

Replace the rating block:

```tsx
                    {course.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-rating text-rating" />
                            <span className="font-medium text-foreground">
                                {course.rating.toFixed(1)}
                            </span>
                            <span className="text-foreground/40">
                                ({formatCompactNumber(course.reviewCount)})
                            </span>
                        </div>
                    )}
```

- [ ] **Step 3: Replace discount badge and CTA**

Replace the discount badge block:

```tsx
            {hasDiscount && discountPercent > 0 && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-ink">
                        {discountPercent}% OFF
                    </span>
                </div>
            )}
```

Replace the CTA button className:

```tsx
                        className={cn(
                            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                            'bg-accent text-accent-ink hover:brightness-110',
                            'active:scale-95'
                        )}
```

- [ ] **Step 4: Replace remaining raw-opacity classes**

Replace `text-foreground opacity-40` occurrences with `text-foreground/40`, and `text-foreground opacity-50` with `text-foreground/50`, and `text-foreground opacity-60` with `text-foreground/60` throughout the file.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -nE "amber-|red-|blue-|text-white|bg-black" src/components/course/CourseCard.tsx`
Expected: no matches.

Run: `grep -n "courses/\${course.slug}" src/components/course/CourseCard.tsx`
Expected: 2 matches (thumbnail link + title link).

---

### Task 4: CourseGrid, Skeleton, EditorialNote

**Files:**
- Modify: `src/components/course/CourseGrid.tsx`
- Modify: `src/components/ui/Skeleton.tsx`
- Modify: `src/components/course/EditorialNote.tsx`

**Interfaces:**
- Consumes: `CourseCard`, `CourseGridSkeleton`.
- Produces: unchanged `CourseGrid({ courses, isLoading })`.

- [ ] **Step 1: Replace the emoji empty state in `CourseGrid.tsx`**

Add `SearchX` to the lucide import:

```tsx
import { SearchX } from 'lucide-react';
```

Replace the empty-state block:

```tsx
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-muted mb-4">
                    <SearchX className="w-7 h-7 text-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No courses found
                </h3>
                <p className="text-foreground/50 max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find what you&apos;re looking for.
                </p>
            </div>
        );
```

- [ ] **Step 2: Update `Skeleton.tsx`**

Change the base skeleton to a token shimmer:

```tsx
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-surface-muted',
                className
            )}
        />
    );
}
```

(No change needed — already token-based. Verify no raw colors exist.)

- [ ] **Step 3: Update `EditorialNote.tsx`**

Replace the section wrapper and heading:

```tsx
        <section className="mb-10 rounded-2xl border border-border bg-surface-muted p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground mb-3">
                <ShieldCheck className="w-5 h-5 text-price" />
                Why we&apos;re featuring this
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">{note}</p>
        </section>
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -rn "📚\|💰\|🎉\|💡\|✓\|🚀" src/components src/app --include=*.tsx`
Expected: no matches in public components.

---

### Task 5: SearchForm and SearchBar

**Files:**
- Modify: `src/components/ui/SearchForm.tsx`
- Modify: `src/components/course/SearchBar.tsx`

**Interfaces:**
- Consumes: tokens.
- Produces: unchanged signatures.

- [ ] **Step 1: Restyle `SearchForm.tsx`**

Replace the form body:

```tsx
        <form onSubmit={handleSubmit} role="search" aria-label="Search courses" className={`relative ${className}`}>
            <div className="relative flex items-center overflow-hidden rounded-xl border border-border bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
                <div className="pl-4 text-foreground/40">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-4 py-5 text-lg text-foreground placeholder:text-foreground/40 focus:outline-none"
                />
                <button
                    type="submit"
                    className="hidden sm:flex items-center gap-2 px-6 py-3 bg-accent text-accent-ink font-semibold transition-all duration-200 hover:brightness-110 cursor-pointer"
                >
                    {buttonText}
                </button>
            </div>
        </form>
```

- [ ] **Step 2: Fix the `✓` in `SearchBar.tsx`**

Replace:

```tsx
                    {hasDiscount ? '✓ On Sale Only' : 'Show All'}
```

with:

```tsx
                    {hasDiscount ? 'On Sale Only' : 'Show All'}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

---

### Task 6: Courses list page and SortDropdown

**Files:**
- Modify: `src/app/courses/page.tsx`
- Modify: `src/app/courses/SortDropdown.tsx`

**Interfaces:**
- Consumes: `CourseCard`, `CourseGridSkeleton`, `SortDropdown`, existing services.
- Produces: no API changes.

- [ ] **Step 1: Add the `CourseCard` import to `courses/page.tsx`**

Add after the existing imports:

```tsx
import { CourseCard } from '@/components/course';
```

- [ ] **Step 2: Replace the inline course card loop with `CourseCard`**

Replace the entire `<div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">` block (the inline map that renders thumbnail, title, rating, price) with:

```tsx
                                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                                    {coursesResult.data.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
```

Remove now-unused imports from `courses/page.tsx`: `Image` (from `next/image`) and the `Star` usage if no longer referenced. Keep `Star` only if still used by the rating filter sidebar — it is used there, so keep it.

Per the user's link ruling, `CourseCard` now points its title/thumbnail at `/courses/${course.slug}`, matching the inline card this replaces; list navigation behavior is preserved.

- [ ] **Step 3: Replace the rating filter stars with tokens**

In the minimum-rating filter block, replace:

```tsx
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.floor(rating)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'fill-border text-border'
                                                        }`}
                                                    />
```

with:

```tsx
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.floor(rating)
                                                                ? 'fill-rating text-rating'
                                                                : 'fill-border text-border'
                                                        }`}
                                                    />
```

- [ ] **Step 4: Replace the hasDiscount checkbox colors**

Replace the discount-filter link block colors:

```tsx
                                     className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                                         validParams.hasDiscount
                                             ? 'bg-surface-muted text-price font-medium'
                                             : 'text-foreground/60 hover:bg-surface-muted'
                                     }`}
```

Replace the checkbox square:

```tsx
                                     <div
                                         className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                             validParams.hasDiscount
                                                 ? 'bg-price border-price'
                                                 : 'border-foreground/30'
                                         }`}
                                     >
```

and the check SVG color class:

```tsx
                                                 className="w-3 h-3 text-background"
```

- [ ] **Step 5: Replace remaining raw opacity classes in `courses/page.tsx`**

Replace every `text-foreground/60` (already fine), `text-foreground/40` (fine), `text-foreground opacity-XX` (none present) and any `text-foreground/30` with `text-foreground/40`. Specifically change the empty-state `border-2 border-dashed` if present (not present in this file).

- [ ] **Step 6: Restyle `SortDropdown.tsx`**

Replace the select className:

```tsx
                className="appearance-none pl-3 pr-8 py-2.5 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer transition-colors duration-200"
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -nE "amber-|red-|blue-|text-white" src/app/courses/page.tsx src/app/courses/SortDropdown.tsx`
Expected: no matches.

Manual: `/courses` renders cards via `CourseCard`; filters, chips, pagination, sort all work.

---

### Task 7: Course detail, StickyCourseSidebar, CourseAccordion

**Files:**
- Modify: `src/app/courses/[slug]/page.tsx`
- Modify: `src/app/courses/[slug]/StickyCourseSidebar.tsx`
- Modify: `src/app/courses/[slug]/CourseAccordion.tsx`

**Interfaces:**
- Consumes: tokens, services, `formatPrice`.
- Produces: no API changes.

- [ ] **Step 1: Replace rating stars in `[slug]/page.tsx`**

For every occurrence of the star pattern:

```tsx
                                                            i < Math.floor(Number(course.rating))
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'fill-border text-border'
```

replace with:

```tsx
                                                            i < Math.floor(Number(course.rating))
                                                                ? 'fill-rating text-rating'
                                                                : 'fill-border text-border'
```

and replace the numeric rating color `text-amber-600` with `text-rating`.

- [ ] **Step 2: Replace raw-opacity classes in `[slug]/page.tsx`**

Replace `text-foreground opacity-40` → `text-foreground/40`, `text-foreground opacity-50` → `text-foreground/50`, `text-foreground opacity-60` → `text-foreground/60`, `text-foreground opacity-70` → `text-foreground/70` throughout.

- [ ] **Step 3: Replace the mobile bottom-bar CTA**

The bottom bar CTA uses `btn btn-primary py-3 rounded-xl gap-2` — keep. Replace its wrapper border to token (already `border-border`). No change needed beyond confirming no raw colors.

- [ ] **Step 4: Replace urgency color in `StickyCourseSidebar.tsx`**

Replace:

```tsx
                            <div className="flex items-center gap-2 text-red-600 mb-2">
```

with:

```tsx
                            <div className="flex items-center gap-2 text-danger mb-2">
```

Replace the discount pill:

```tsx
                                <span className="px-2 py-1 bg-surface-muted text-price text-sm font-semibold rounded">
```

(Already token-based; keep.)

- [ ] **Step 5: Restyle `CourseAccordion.tsx`**

Replace the toggle button hover:

```tsx
                                className="w-full flex items-center justify-between p-4 bg-surface-muted hover:bg-border/50 transition-colors duration-200 text-left cursor-pointer"
```

Replace item icon colors `text-foreground/40` (already token-based; keep).

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -nE "amber-|red-|blue-|text-white" src/app/courses/\[slug\]/page.tsx src/app/courses/\[slug\]/StickyCourseSidebar.tsx`
Expected: no matches.

---

### Task 8: Roadmap components

**Files:**
- Modify: `src/components/roadmap/RoadmapCard.tsx`
- Modify: `src/components/roadmap/RoadmapFilters.tsx`
- Modify: `src/components/roadmap/RoadmapStep.tsx`
- Modify: `src/components/roadmap/RoadmapProgress.tsx`
- Modify: `src/components/roadmap/SavingsBadge.tsx`

**Interfaces:**
- Consumes: tokens, `formatPrice`.
- Produces: unchanged signatures.

- [ ] **Step 1: Remove emoji from `RoadmapProgress.tsx`**

Replace:

```tsx
                            <h3 className="font-semibold text-foreground">
                                {isCompleted ? 'Roadmap Completed! 🎉' : 'Your Progress'}
                            </h3>
```

with:

```tsx
                            <h3 className="font-semibold text-foreground">
                                {isCompleted ? 'Roadmap Completed!' : 'Your Progress'}
                            </h3>
```

Replace:

```tsx
                <p className="mt-4 text-xs text-muted text-center">
                    💡 Your progress is saved automatically in your browser
                </p>
```

with:

```tsx
                <p className="mt-4 text-xs text-muted text-center">
                    Your progress is saved automatically in your browser
                </p>
```

- [ ] **Step 2: Replace raw-opacity classes across roadmap components**

In `RoadmapCard.tsx`, `RoadmapStep.tsx`, `RoadmapProgress.tsx`, `RoadmapFilters.tsx`, replace `text-foreground opacity-XX` with `text-foreground/XX` (e.g. `opacity-50` → `/50`, `opacity-70` → `/70`).

- [ ] **Step 3: Restyle `RoadmapFilters.tsx` controls**

Replace the select className:

```tsx
                            className="w-full p-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
```

for both selects.

- [ ] **Step 4: Restyle `RoadmapStep.tsx` rating star**

Replace:

```tsx
                                    <Star className="w-4 h-4 fill-accent text-accent" />
```

with:

```tsx
                                    <Star className="w-4 h-4 fill-rating text-rating" />
```

- [ ] **Step 5: Restyle `SavingsBadge.tsx`**

No raw colors present; keep the token classes. Confirm `bg-surface-muted text-price` is correct.

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -rnE "🎉|💡|amber-|red-|blue-|text-white" src/components/roadmap`
Expected: no matches.

---

### Task 9: Roadmaps list and detail pages

**Files:**
- Modify: `src/app/roadmaps/page.tsx`
- Modify: `src/app/roadmaps/[slug]/page.tsx`

**Interfaces:**
- Consumes: roadmap components, services.
- Produces: no API changes.

- [ ] **Step 1: Restyle the search input in `roadmaps/page.tsx`**

Replace:

```tsx
                                className="w-full pl-4 pr-12 py-3 bg-surface-muted border border-border rounded-xl focus:ring-2 focus:ring-accent text-foreground"
```

with:

```tsx
                                className="w-full pl-4 pr-12 py-3 bg-surface-muted border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
```

- [ ] **Step 2: Replace the empty state in `roadmaps/page.tsx`**

Replace:

```tsx
                            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
```

with:

```tsx
                            <div className="text-center py-20 rounded-2xl border border-border bg-surface">
```

- [ ] **Step 3: Replace the timeline step marker in `roadmaps/[slug]/page.tsx`**

Replace:

```tsx
                                                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-ink flex items-center justify-center font-bold text-sm">
```

with:

```tsx
                                                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-ink flex items-center justify-center font-bold text-sm font-display">
```

- [ ] **Step 4: Replace the rating star in `roadmaps/[slug]/page.tsx`**

Replace:

```tsx
                                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
```

with:

```tsx
                                                                            <Star className="w-4 h-4 fill-rating text-rating" />
```

- [ ] **Step 5: Replace raw-opacity classes in both files**

Replace `text-foreground opacity-XX` and `text-foreground/XX` patterns to the slash form consistently.

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -nE "amber-|red-|blue-|text-white" src/app/roadmaps/page.tsx "src/app/roadmaps/[slug]/page.tsx"`
Expected: no matches.

---

### Task 10: Home page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `CourseGrid`, `SearchForm`, `ScrollReveal`, `JsonLd`, services.
- Produces: unchanged page export.

- [ ] **Step 1: Replace the hero section**

Replace the hero `<section>` block with:

```tsx
      <ScrollReveal>
      <section className="relative overflow-hidden bg-background pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.05]">
            Master New Skills. <br className="hidden md:block" />
            <span className="text-muted">We Filter the Noise.</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scrolling through low-quality content. SearchCourse aggregates the best
            technical education from top providers, verifying deals so you save money and time.
          </p>

          <SearchForm className="max-w-2xl mx-auto mb-8" />

          <p className="text-sm text-foreground/50">
            Trending:{' '}
            <Link href="/courses?query=react" className="text-accent hover:underline">
              React Patterns
            </Link>
            ,{' '}
            <Link href="/courses?query=python" className="text-accent hover:underline">
              Python for Data
            </Link>
            ,{' '}
            <Link href="/courses?query=aws" className="text-accent hover:underline">
              AWS Cert
            </Link>
          </p>
        </div>
      </section>
      </ScrollReveal>
```

- [ ] **Step 2: Replace the stats band numbers**

Replace the three stat value paragraphs:

```tsx
              <p className="font-display text-3xl font-bold text-foreground mb-1">{stats.coursesVerified}</p>
```

```tsx
              <p className="font-display text-3xl font-bold text-foreground mb-1">{stats.studentSavings}</p>
```

```tsx
              <p className="font-display text-3xl font-bold text-foreground mb-1">{stats.uptime}</p>
```

- [ ] **Step 3: Replace the featured section heading**

Replace:

```tsx
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Top Picks of the Month
                </h2>
```

with:

```tsx
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Top Picks of the Month
                </h2>
```

- [ ] **Step 4: Replace the bottom CTA section**

Replace the bottom CTA block with:

```tsx
      <ScrollReveal>
      <section className="py-20 lg:py-24 bg-accent text-accent-ink">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to upgrade your career?
          </h2>
          <p className="text-accent-ink/70 mb-8 text-lg">
            Join thousands of developers saving time and money on technical education. No
            spam, just high-signal deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-ink text-accent font-semibold rounded-xl transition-opacity hover:opacity-90"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-ink/10 text-accent-ink font-semibold rounded-xl border border-accent-ink/20 hover:bg-accent-ink/20 transition-colors duration-200"
            >
              Our Vetting Process
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
```

- [ ] **Step 5: Replace remaining raw-opacity classes in `page.tsx`**

Replace `text-foreground/60` (fine), `text-foreground/40` (fine). Replace any `text-foreground opacity-XX` and `bg-accent-ink/60` → `bg-accent-ink/70` if used on a background. Ensure the category card hover border uses `hover:border-accent/50`.

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -nE "amber-|red-|blue-|text-white|bg-black" src/app/page.tsx`
Expected: no matches.

Manual: `/` hero has an emerald glow behind the headline; all sections render in dark theme; light toggle looks correct.

---

### Task 11: About, LegalPage, error and loading states

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/components/layout/LegalPage.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/courses/error.tsx`
- Modify: `src/app/courses/[slug]/error.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/app/courses/loading.tsx`
- Modify: `src/app/courses/[slug]/loading.tsx`
- Modify: `src/app/roadmaps/loading.tsx`
- Modify: `src/app/roadmaps/[slug]/loading.tsx`

**Interfaces:**
- Consumes: tokens.
- Produces: no API changes.

- [ ] **Step 1: Update `AboutPage`**

Replace the stat value element:

```tsx
                                <div className="font-display text-4xl font-extrabold text-foreground mb-2">
                                    {stat.value}
                                </div>
```

Replace the core-principles card classNames from `bg-surface p-8 rounded-2xl border border-border` (keep) and the icon wrapper `bg-surface-muted ... text-foreground` (keep).

Replace the affiliate disclosure section heading with `font-display`.

Replace the final CTA section `bg-accent text-accent-ink` (keep) and the button `bg-accent-ink text-accent` (keep).

Replace all `text-foreground opacity-XX` with `text-foreground/XX`.

- [ ] **Step 2: Update `LegalPage.tsx`**

Replace the heading:

```tsx
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
```

Replace body paragraph class:

```tsx
                                        className="text-sm text-foreground/70 leading-relaxed"
```

- [ ] **Step 3: Update `not-found.tsx` and both `error.tsx` files**

Replace the accent CTA class from `bg-accent text-accent-ink hover:opacity-85` to `bg-accent text-accent-ink hover:brightness-110 transition-all duration-200` in `not-found.tsx`, `error.tsx`, and `courses/error.tsx`, `courses/[slug]/error.tsx`.

Replace the 404 numeral:

```tsx
            <span className="font-display text-7xl font-bold text-accent mb-6">404</span>
```

- [ ] **Step 4: Update loading files**

In `loading.tsx`, `courses/loading.tsx`, `courses/[slug]/loading.tsx`, `roadmaps/loading.tsx`, `roadmaps/[slug]/loading.tsx`: replace any `bg-surface-muted rounded-* animate-pulse` divs by using the `Skeleton` component from `@/components/ui/Skeleton` where a direct replacement is clean. If a file already uses `Skeleton`, leave as is. If it uses inline `animate-pulse bg-surface-muted` divs, keep them — they are already token-based.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

Run: `grep -rnE "amber-|red-|blue-|text-white|bg-black|💰|📚|🎉|💡" src/app src/components/layout src/components/course src/components/roadmap src/components/ui --include=*.tsx`
Expected: no matches outside `src/app/admin` and `src/components/admin`.

---

### Task 12: Final verification sweep

**Files:**
- No file changes unless a check fails.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a verified redesign.

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: PASS, 0 errors.

- [ ] **Step 2: Full lint**

Run: `npm run lint`
Expected: PASS, 0 errors.

- [ ] **Step 3: Unit tests**

Run: `npm run test`
Expected: PASS. If any pre-existing test fails for an unrelated reason, record it and do not change behavior to force it green.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds. Prisma generate runs first per `package.json`.

- [ ] **Step 5: Raw-color and emoji sweep**

Run: `grep -rnE "amber-[0-9]|red-[0-9]|blue-[0-9]|text-white|bg-black|fill-amber|text-amber" src/app src/components --include=*.tsx`
Expected: matches only inside `src/app/admin` and `src/components/admin`.

Run: `grep -rnE "[💰📚🎉💡🚀✅✓]" src/app src/components --include=*.tsx`
Expected: no matches in public files.

- [ ] **Step 6: Manual responsive and theme check**

Run: `npm run dev`.
Check at 375, 768, 1024, 1440 widths: no horizontal scroll; focus rings visible on tab; dark default; light toggle correct; no emoji icons; header/footer/banner do not overlap the footer content.

- [ ] **Step 7: Commit — SKIP.** Do not commit.

---

## Self-Review Notes

- **Spec coverage:** tokens/fonts (Task 1), layout + banner (Tasks 1-2), course components (Tasks 3-5), courses page (Task 6), course detail (Task 7), roadmap components (Task 8), roadmaps pages (Task 9), home (Task 10), legal/error/loading (Task 11), accessibility/quality gates (Task 12). Admin explicitly excluded per Global Constraints.
- **Placeholder scan:** no TBD/TODO; every step has concrete code or an exact command with expected output.
- **Type consistency:** `CourseCard({ course }: CourseCardProps)` unchanged; `CourseGrid({ courses, isLoading })` unchanged; `Skeleton`/`CourseGridSkeleton` exports unchanged; new CSS tokens `--rating`, `--rating-ink`, `--danger` map to `text-rating`, `text-danger`, `fill-rating` utilities via `@theme inline`.