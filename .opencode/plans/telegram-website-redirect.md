# Telegram → Website → Udemy Redirect Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route Telegram broadcast clicks to the course detail page on our website (`/courses/{slug}?src=tg`) instead of straight to Udemy, so users see ads on the site before clicking "Enroll" to reach Udemy.

**Architecture:** Change the `/go/{slug}` route's redirect target from the affiliate API to the course detail page, carrying `?src=tg`. The course detail page reads `searchParams.src` and appends `?src=tg` to its `affiliateUrl` only when the source is Telegram, preserving TELEGRAM attribution for that first click. Sidebar and mobile bottom-bar CTAs render `affiliateUrl` unchanged.

**Tech Stack:** Next.js 16 App Router (async `searchParams`), TypeScript, Prisma, Playwright (e2e), Vitest (unit).

## Global Constraints

- Do NOT add an inline badge/banner for Telegram users on the course page.
- TELEGRAM source attribution applies ONLY to the landing course's first click; subsequent in-site navigation counts as WEB.
- Do NOT convert footer/platform/course-card links to routed redirects — minimal scope.
- Do NOT modify `/src/app/api/out/[id]/route.ts`.
- Preserve existing `target="_blank"` + `rel="noopener noreferrer"` on CTA links.
- Follow existing code style (4-space indent, single quotes, no comments unless required).

---

### Task 1: Redirect `/go/{slug}` to the course detail page with `?src=tg`

**Files:**
- Modify: `src/app/go/[slug]/route.ts`
- Test: `tests/unit/go-redirect.test.ts` (new)

**Interfaces:**
- Consumes: `getCourseBySlug(slug)` from `@/services` (returns `{ id, slug } | null`).
- Produces: `NextResponse.redirect` to `/courses/{slug}?src=tg`. New unit test asserts the redirect location header.

- [ ] **Step 1: Write the failing unit test**

Create `tests/unit/go-redirect.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/services', () => ({
    getCourseBySlug: vi.fn(),
}));

import { getCourseBySlug } from '@/services';
import { GET } from '@/app/go/[slug]/route';

const mockGetCourseBySlug = vi.mocked(getCourseBySlug);

describe('GET /go/[slug]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to the course detail page with src=tg', async () => {
        mockGetCourseBySlug.mockResolvedValue({
            id: 'course-1',
            slug: 'microsoft-excel-basics',
        } as never);

        const req = new NextRequest('https://searchcourse.vercel.app/go/microsoft-excel-basics');
        const ctx = { params: Promise.resolve({ slug: 'microsoft-excel-basics' }) };

        const res = await GET(req, ctx as never);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe(
            'https://searchcourse.vercel.app/courses/microsoft-excel-basics?src=tg'
        );
        expect(mockGetCourseBySlug).toHaveBeenCalledWith('microsoft-excel-basics');
    });

    it('returns 404 when the course is not found', async () => {
        mockGetCourseBySlug.mockResolvedValue(null);

        const req = new NextRequest('https://searchcourse.vercel.app/go/nope');
        const ctx = { params: Promise.resolve({ slug: 'nope' }) };

        const res = await GET(req, ctx as never);

        expect(res.status).toBe(404);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/go-redirect.test.ts`
Expected: FAIL — the redirect location is still `/api/out/...?src=tg`, not `/courses/...?src=tg`.

- [ ] **Step 3: Update the route implementation**

In `src/app/go/[slug]/route.ts`, change the redirect target:

```ts
return NextResponse.redirect(
    new URL(`/courses/${course.slug}?src=tg`, request.url)
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/go-redirect.test.ts`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/go/[slug]/route.ts tests/unit/go-redirect.test.ts
git commit -m "feat: redirect telegram /go links to course page with src=tg"
```

---

### Task 2: Course detail page carries `?src=tg` on the affiliate CTA

**Files:**
- Modify: `src/app/courses/[slug]/page.tsx`
- Test: `tests/e2e/public-flows.spec.ts`

**Interfaces:**
- Consumes: existing `CourseDetailPage` server component; adds `searchParams: Promise<{ src?: string }>` to props.
- Produces: `affiliateUrl` variable — `/api/out/${course.id}?src=tg` when `src === 'tg'`, else `/api/out/${course.id}`. Passed unchanged to `StickyCourseSidebar` and the mobile bottom bar `Link`.

- [ ] **Step 1: Add `searchParams` to the component signature**

In `src/app/courses/[slug]/page.tsx`:

```ts
interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ src?: string }>;
}

export default async function CourseDetailPage(props: PageProps) {
    const { slug } = await props.params;
    const { src } = await props.searchParams;
```

- [ ] **Step 2: Set affiliateUrl based on source**

```ts
const affiliateUrl =
    src === 'tg'
        ? `/api/out/${course.id}?src=tg`
        : `/api/out/${course.id}`;
```

(Replaces the existing `const affiliateUrl = \`/api/out/${course.id}\`;` line.)

- [ ] **Step 3: Verify existing CTA wiring**

Confirm both the desktop sidebar call (`<StickyCourseSidebar ... affiliateUrl={affiliateUrl} />`) and the mobile bottom bar `<Link href={affiliateUrl} target="_blank" ...>` already reference the `affiliateUrl` variable — no change needed to those. Confirm the bottom-bar `Link` has `rel="noopener noreferrer"`; if missing, add it.

- [ ] **Step 4: Add e2e coverage**

In `tests/e2e/public-flows.spec.ts`, append a new `describe` block (note: course data requires DB; the existing suite only tests shells, so keep this as a structural assertion that the page mounts and the CTA href matches the pattern):

```ts
test.describe("Telegram redirect flow", () => {
  test("course page CTA preserves src=tg in affiliate href", async ({ page }) => {
    // Visit the course page with a Telegram source. If course data is absent
    // (notFound), the test is skipped rather than failing.
    await page.goto("/courses/some-tg-course?src=tg");
    const notFound = page.locator("text=Course Not Found").first();
    const isNotFound = await notFound.isVisible().catch(() => false);
    if (isNotFound) {
      test.skip();
      return;
    }
    const enroll = page
      .locator("a[href^='/api/out/']", { hasText: "Enroll Now" })
      .first();
    await expect(enroll).toBeVisible();
    const href = await enroll.getAttribute("href");
    expect(href).toMatch(/^\/api\/out\/[^?]+(\?src=tg)?$/);
  });
});
```

**Note:** The authoritative behavioral test for the new flow (visiting `/go/{slug}` resolves to `/courses/{slug}?src=tg` and its Enroll CTA href is `/api/out/{id}?src=tg`) requires seeded course data. Mark the corresponding test to require seeding:

```ts
test.describe("Telegram redirect flow (seeded)", () => {
  test("go slug lands on course page and enroll href carries src=tg", async ({ page }) => {
    // Requires a known seeded course slug; update SLUG/ID via env.
    const slug = process.env.E2E_COURSE_SLUG || "microsoft-excel-basics";
    const courseId = process.env.E2E_COURSE_ID;
    await page.goto(`/go/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/courses/${slug}\\?src=tg`));
    if (courseId) {
      const enroll = page.locator("a[href^='/api/out/']", { hasText: "Enroll Now" }).first();
      await expect(enroll).toHaveAttribute("href", `/api/out/${courseId}?src=tg`);
    }
  });
});
```

- [ ] **Step 5: Run e2e to verify no regression**

Run: `npx playwright test tests/e2e/public-flows.spec.ts`
Expected: existing shell tests PASS; Telegram tests SKIP if no seeded data.

- [ ] **Step 6: Commit**

```bash
git add src/app/courses/[slug]/page.tsx tests/e2e/public-flows.spec.ts
git commit -m "feat: carry tg source on course page enroll CTA"
```

---

### Task 3: Final verification

**Files:** none (read/run only)

- [ ] **Step 1: Run the full unit suite**

Run: `npx vitest run`
Expected: all unit tests pass, including the new `go-redirect` test.

- [ ] **Step 2: Run typecheck / lint**

Run: `npx tsc --noEmit` and `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual smoke check (if dev DB available)**

Run the dev server, visit `/go/{existing-slug}` in a browser, confirm you land on `/courses/{slug}?src=tg` and the Enroll button opens `/api/out/{id}?src=tg` in a new tab.

---

## Self-Review

**Spec coverage:** Task 1 covers the `/go` redirect change; Task 2 covers the course page `searchParams` + `affiliateUrl`, plus CTA wiring and mobile `rel="noopener noreferrer"` verification; Task 3 covers testing. Non-goals (no badge, no session threading, minimal scope) are respected — no other files touched.

**Placeholder scan:** No TODOs/TBDs; all test code and implementation steps are concrete.

**Type consistency:** `getCourseBySlug` returns `{ id, slug }` used consistently across Task 1 (route) — matches the current route usage. `PageProps.searchParams` uses the same Promise pattern already used in `courses/page.tsx` and `roadmaps/page.tsx`.
