# SearchCourse UI/UX Redesign — Design Spec

Date: 2026-09-10
Status: Approved design (pending user review of this document)
Scope: Public pages + shared layout. Admin CMS out of scope (inherits colors only).

## 1. Goal

Redesign the entire public-facing UI from scratch for a **modern dark-tech / premium**
feel, optimizing for course-deal discovery: trust, scanability, fast scanning of
discounts, and high-quality perceived value.

Non-goals:

- No admin layout or admin-specific redesign. Admin inherits the recolored tokens and
  keeps its current structure.
- No data, service, API, validation, scraper, or job changes.
- No new icon library, no GSAP, no animation framework beyond what exists.
- No light-only or dark-only shipping: both themes must remain fully usable.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Visual direction | Modern dark-tech / premium |
| Brand accent | Emerald / green |
| Theme model | Dark-first default + light toggle retained |
| Typography | Outfit (display headings) + Geist (body) |
| Redesign scope | All public pages + shared layout now; admin later |
| Admin token impact | Admin inherits new palette (functional, recolored) |

## 3. Design System

### 3.1 Color tokens

Single source of truth: `src/app/globals.css`. All existing semantic tokens keep their
names so existing class usage (`bg-surface`, `text-foreground`, `border-border`,
`text-muted`, `text-price`, `bg-accent`, `text-accent-ink`, `bg-surface-muted`,
`bg-surface-elevated`) continues to work — only values change.

Dark theme (default):

| Token | Value | Use |
|---|---|---|
| `--background` | `#0B0F0D` | page background, near-black with faint green undertone |
| `--foreground` | `#EDF2EF` | primary text |
| `--surface` | `#121715` | header, footer, base cards |
| `--surface-elevated` | `#161C19` | raised cards, sidebars, modals |
| `--surface-muted` | `#1B211E` | chips, insets, hover fills |
| `--border` | `#28302C` | 1px hairlines |
| `--muted` | `#8C968F` | secondary text |
| `--accent` | `#10B981` | CTAs, links, active states, focus rings |
| `--accent-ink` | `#04140C` | text/icon on emerald |
| `--price` | `#34D399` | prices, savings, positive signals |

Light theme (toggle):

| Token | Value |
|---|---|
| `--background` | `#F6F9F7` |
| `--foreground` | `#0A0F0D` |
| `--surface` | `#FFFFFF` |
| `--surface-elevated` | `#FFFFFF` |
| `--surface-muted` | `#EDF2EF` |
| `--border` | `#D8E0DB` |
| `--muted` | `#5A655F` |
| `--accent` | `#059669` |
| `--accent-ink` | `#FFFFFF` |
| `--price` | `#047857` |

Contrast requirements: body text >= 4.5:1 against its background in both themes;
emerald `--accent` on `--background` >= 3:1 for focus rings and link affordances.
Note: current values are a starting point; adjust only if a measured contrast check
fails, and keep both themes in sync.

### 3.2 Typography

- Add `Outfit` via `next/font/google` in `src/app/layout.tsx`, exposed as
  `--font-display`.
- Keep `GeistSans` as `--font-sans` (body).
- In `globals.css` `@theme inline`: add `--font-display: var(--font-display), var(--font-sans), sans-serif`.
- Headings (`h1`-`h3`), stat numbers, section titles, and price figures use
  `font-display` with `tracking-tight`. Body copy stays Geist at base 16px, line-height 1.5.

### 3.3 Motion & effects

- Keep `ScrollReveal` (IntersectionObserver, already reduced-motion aware) and
  `animate-fadeIn`.
- Hover transitions 150-300ms; no animation longer than 600ms.
- Add: emerald radial glow behind the hero, emerald focus ring (already token-driven),
  subtle card lift on hover (`-translate-y-0.5` + shadow).
- Do NOT add heavy blur, scanlines, glitch effects, or neon text-shadow.

### 3.4 Component primitives (`globals.css`)

Restyle existing primitives to the new tokens and refine details:

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`: emerald primary,
  neutral secondary, visible focus, `cursor-pointer`, 200ms transitions.
- `.card`, `.card-elevated`, `.badge`, `.badge-accent`, `.badge-price`, `.input`:
  dark surface hierarchy, emerald focus ring on inputs.
- Add `.font-display` utility mapping to `--font-display`.

## 4. Shared layout

### 4.1 `src/app/layout.tsx`

- Register Outfit via `next/font/google`; add `outfit.variable` to `<body>` className.
- Remove the hardcoded `className="light"` on `<html>` so the ThemeProvider controls
  the theme; keep `suppressHydrationWarning`.
- Keep skip-link, JsonLd, Header/Footer structure.

### 4.2 `src/components/layout/ThemeProvider.tsx`

- Default `theme` to `'dark'` (instead of `'light'`) when no saved value exists in
  `localStorage`.
- Initialize `resolvedTheme` to `'dark'` to match.
- Preserve `'system'` support and the system-change listener.
- To prevent a flash of light theme on first paint, set the initial `dark` class on
  `<html>` (either statically or via a small inline pre-hydration script reading
  `localStorage`). Preferred: a tiny inline script in `layout.tsx` head that applies
  the saved/derived theme class before paint.

### 4.3 `src/components/layout/Header.tsx`

- Sticky dark bar: `bg-surface/80 backdrop-blur border-b border-border`.
- Emerald active-nav indicator; nav links restyled with hover fill.
- Logo image swap kept (light/dark long logos).
- Theme toggle kept; mobile menu restyled with the new surfaces.
- Ensure all interactive elements have `cursor-pointer` and visible focus.

### 4.4 Telegram banner (`src/app/layout.tsx`)

- Replace the `bg-blue-900` bar and the `💰` emoji with a semantic emerald accent bar.
- Use token colors (`bg-accent text-accent-ink` or `bg-surface-elevated` with emerald
  border), a Lucide `Send`/`MessageCircle` icon instead of emoji, no uppercase shouting.
- Keep it dismissible-safe and respect bottom safe area; ensure it does not permanently
  cover the footer (add bottom padding to the page or make it non-fixed after scroll —
  choose the simplest option that keeps the current behavior of a persistent bar but
  adds compensating bottom space on the body).

### 4.5 `src/components/layout/Footer.tsx`

- Restructure into a richer dark footer: brand block, Resources, Legal, and a
  "Courses from" strip.
- Emerald hover states; muted secondary text; affiliate disclosure retained.
- Remove emoji; use Lucide icons only.

### 4.6 `src/components/course/CourseGrid.tsx`

- Replace the `📚` emoji empty state with a Lucide icon (e.g. `SearchX`/`BookOpen`)
  inside a token-colored circle. No emoji as icons anywhere.

### 4.7 `src/components/ui/SearchForm.tsx`

- Premium command-bar treatment: `bg-surface`, hairline border, emerald submit button,
  emerald focus ring, consistent height with the dark hero.
- Keep the existing navigation behavior and `role="search"` a11y attributes.

## 5. Page-by-page

### 5.1 Home (`src/app/page.tsx`)

Sections (order preserved, visuals rebuilt):

1. Hero: left-aligned or centered editorial headline (Outfit, tight tracking),
   emerald radial glow backdrop, subcopy, `SearchForm`, trending links.
2. Stats band: token surfaces, Outfit numerals.
3. Categories: token cards, Lucide icons, emerald hover.
4. Career Roadmaps teaser: emerald "New Feature" badge, feature list with emerald
   check icons, roadmap preview cards.
5. Featured Courses: `CourseGrid` with the new `CourseCard`.
6. Bottom CTA: emerald-on-dark block with primary and secondary CTAs.

Constraints: no raw hex colors; use semantic tokens only.

### 5.2 Courses list (`src/app/courses/page.tsx`)

- Page header block restyled to dark surfaces.
- Filter rail: sticky dark panel, token chips, emerald selected state, focus-visible.
- Replace the inline hand-rolled course card markup with the shared `CourseCard`
  component to remove duplication and guarantee consistency.
- Discount badges use emerald tokens (no raw `bg-price text-white`).
- Rating stars: replace raw `amber-400`/`border` literals with a semantic rating
  treatment consistent with `CourseCard` (either a dedicated token pair or a single
  shared star component).
- Active-filter chips, sort control, pagination, and empty state restyled.
- Price formatting stays via `formatPrice`; do not hand-format `$`.

### 5.3 Course detail (`src/app/courses/[slug]/page.tsx`)

- Breadcrumb bar: dark surface, token text.
- Hero: Outfit title, rating/students/verified rows on tokens, instructor block.
- Media block, "Career Growth"/"Certificate" cards, learning outcomes, description,
  editorial note, syllabus accordion, feedback panel, instructor panel — all restyled
  to the dark system.
- Replace `text-red-600` urgency text with a semantic urgency token or emerald/amber
  semantic pair.
- `StickyCourseSidebar`: premium elevated buy box, emerald CTA, Outfit price, urgency
  countdown on semantic colors.
- Mobile bottom bar: dark surface, emerald CTA, safe-area padding.
- Preserve all schema/JsonLd, `src=tg` affiliate logic, and `formatPrice` usage.

### 5.4 Roadmaps list (`src/app/roadmaps/page.tsx`) and detail (`src/app/roadmaps/[slug]/page.tsx`)

- List: dark header, search field, `RoadmapFilters` restyled, roadmap cards on tokens
  with emerald savings, empty state with Lucide icon.
- Detail: breadcrumb, hero with token chips, value-prop cards, timeline with emerald
  step markers, sidebar summary with emerald savings, mobile bottom bar.
- Preserve schema/JsonLd and all pricing logic.

### 5.5 Roadmap components

- `RoadmapCard.tsx`, `RoadmapFilters.tsx`, `RoadmapProgress.tsx`, `RoadmapStep.tsx`,
  `SavingsBadge.tsx`: re-skin to tokens, emerald accents, focus-visible states.

### 5.6 About / Privacy / Terms (`LegalPage.tsx`)

- Dark prose layout, emerald links, improved measure and spacing, Outfit headings.

### 5.7 Shared UI

- `Skeleton.tsx`: dark shimmer using token surfaces; `CourseGridSkeleton` matches new
  card dimensions to avoid layout shift.
- `SortDropdown.tsx`, `CourseAccordion.tsx`, `EditorialNote.tsx`, `ScrollReveal.tsx`:
  re-skin to tokens; keep behavior.

## 6. Accessibility & quality gates

- Contrast >= 4.5:1 for body text in both themes.
- Visible focus on every interactive element; never remove focus rings.
- All clickable elements `cursor-pointer`.
- Hover transitions 150-300ms.
- Touch targets >= 44x44px.
- No emoji as icons anywhere.
- `prefers-reduced-motion` respected (already implemented; do not regress).
- Responsive verified at 375 / 768 / 1024 / 1440.
- No horizontal scroll at 375px.

## 7. Implementation phases

1. Tokens + fonts: rewrite `globals.css`; add Outfit in `layout.tsx`; flip
   ThemeProvider + `<html>` to dark-first; add pre-hydration theme script.
2. Shared layout: Header, Footer, Telegram banner, SearchForm, CourseGrid empty state.
3. Core commerce: CourseCard, CourseGrid, courses list + filters, SortDropdown, Skeleton.
4. Detail: course detail, StickyCourseSidebar, CourseAccordion, EditorialNote, roadmap
   detail components.
5. Home + secondary: home page, roadmaps list + filters, LegalPage/About.
6. Verify: `npm run typecheck`, `npm run lint`, `npm run test`; manual light/dark
   spot-check at four breakpoints.

## 8. Risks

- Dark-first default changes first impression for returning light-mode users; saved
  `localStorage` theme must win. Mitigate with the pre-hydration script.
- Admin inherits the new palette and may need contrast touch-ups later; explicitly
  deferred to the admin phase.
- `courses/page.tsx` currently duplicates card markup; switching to `CourseCard`
  requires matching its props to the list query shape — verify types before removing
  the inline markup.
- Token rename is avoided on purpose; only values change, which limits blast radius.

## 9. Verification

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- Manual: both themes render with correct contrast at 375/768/1024/1440; focus rings
  visible; reduced-motion honored; no emoji icons; no raw hex in public components.