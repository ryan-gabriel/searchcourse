# SearchCourse Rebuild — Design Doc

Date: 2026-09-04
Status: Design (approved)

## Purpose

Rebuild the SearchCourse platform — a course-deal discovery site that scrapes
Udemy coupons via RapidAPI, publishes deals to a public website and a Telegram
channel, tracks affiliate clicks, and provides an admin CMS — as a single,
consolidated, well-tested codebase.

The current implementation is split across two separate repos
(`SearchCourse-old/` Next.js app and `search-course-cron-and-telegram/` scripts)
that duplicate the Prisma schema, environment config, and types. The rebuild
consolidates them into one clean project at `searchcourse/`.

## Goals

- Consolidate two repos into one Next.js app with the cron/telegram jobs inside it.
- One Prisma schema, one `.env`, one Prisma client shared by app and jobs.
- Keep all existing features: public site, admin CMS, cron/TG automation, affiliate tracking.
- Fix existing TypeScript errors (admin DataTable types, analytics route).
- Add light testing (Vitest unit tests + Playwright smoke tests).
- Redesign the UI in a minimalist editorial style.
- Schedule jobs via GitHub Actions cron.

## Non-goals (YAGNI)

- No new features beyond what currently exists.
- No framework or auth-provider changes.
- No full test coverage mandate.
- No changing the database provider.

## Architecture

Single repository at `searchcourse/`:

```
searchcourse/
├── prisma/
│   └── schema.prisma          # single source of truth for DB
├── src/
│   ├── app/                   # Next.js App Router (routes + page components)
│   ├── components/            # shared React components
│   ├── lib/
│   │   ├── db/                # Prisma client (shared by app + jobs)
│   │   ├── supabase/          # auth client
│   │   └── utils/
│   ├── services/              # business logic (DB access via queries)
│   ├── validations/           # Zod schemas
│   ├── jobs/                  # cron scripts: sync, telegram, cleanup
│   └── middleware.ts          # auth guard (admin CMS protection)
├── tests/                     # Vitest unit + Playwright e2e
├── .github/workflows/         # scheduled jobs
├── .env                       # single env (shared by app + jobs)
├── .env.example
└── package.json               # scripts: dev, build, sync, telegram, cleanup
```

### Stack

- Next.js App Router (kept)
- Prisma + Postgres (kept), with `@prisma/adapter-pg`
- Supabase auth (kept), `@supabase/ssr`
- Tailwind CSS v4 (kept), redesigned
- Zod (kept) for validation
- `cheerio`, `lru-cache`, `lucide-react` (kept)
- Vitest (new) for unit tests
- Playwright (new) for e2e smoke tests
- `tsx` for running job scripts

## Data Model

Core entities (kept from existing schema):

- **Platform** — e.g., Udemy
- **Course** — externalId (dedup), title, slug, image, rating, etc.
- **Coupon** — code, price, validity, affiliate link, isPosted flag, platformId
- **Category / CourseCategory** — course categorization
- **Roadmap / RoadmapStep** — curated sequences linking to courses
- **ClickEvent** — affiliate click tracking with `source` field (TELEGRAM vs web)

## Features

1. **Public site** — homepage (featured/recent deals), course list + detail,
   roadmap list + detail, about, sitemap/robots/manifest.
2. **Admin CMS** — protected dashboard for courses, categories, platforms,
   coupons, roadmaps (+ steps), analytics, settings.
3. **Cron/TG automation** — `sync` (RapidAPI → upsert courses + coupons),
   `telegram` (broadcast unpublished `isPosted=false` deals), `cleanup`
   (expire/delete stale coupons, deactivate old deals).
4. **Affiliate tracking** — `/api/out/[id]` logs ClickEvent then redirects;
   rate-limited via lru-cache.

## Data Flow

1. **Sync** (GitHub Action, every 8h): `sync.ts` fetches courses/coupons from
   RapidAPI → validates with Zod → upserts via Prisma by `externalId`, creating
   coupons. New unpublished deals get `isPosted=false`.
2. **Telegram** (every 2h): `telegram.ts` queries `isPosted=false` coupons →
   sends to channel → marks `isPosted=true`.
3. **Public browse**: server components read via services → render. Affiliate
   links go to `/api/out/[id]`.
4. **Click tracking**: `/api/out/[id]` validates + rate-limits + logs ClickEvent
   (source from `?src=tg`) → redirects to affiliate URL.
5. **Admin**: CRUD routes validate with Zod → services → Prisma.

## Error Handling

- **Cron jobs**: wrap each in try/catch, log failures, exit non-zero so the
  Action fails visibly. Use `upsert`/`updateMany` with safe IDs; never corrupt data.
- **API routes**: Zod parse failures → 400 with a consistent error shape;
  not-found → 404; DB errors → 500 + logged.
- **Click tracking**: invalid/expired coupon → fail-safe redirect to homepage
  instead of 500.
- **Non-public routes**: middleware redirects unauthenticated/non-admin to `/login`.

## Testing

Light testing:

- **Vitest** unit tests for pure logic: Zod validations, service functions
  (coupon upsert dedup, expired-coupon cleanup), affiliate URL building.
- **Playwright** smoke tests for core public flows: homepage loads deals, course
  detail renders, admin login → dashboard, click-tracking redirect works.

## UI Redesign

Redesign to a **minimalist editorial** direction:

- Clean editorial feel; warm neutrals; strong typography; flat bento grids; no
  gradients; calm and modern.
- Applies to both public site and admin CMS.
- Built with Tailwind CSS v4 and a shared design system (tokens for color,
  type scale, spacing, motion).

## Scheduling

GitHub Actions scheduled workflow(s) running the job scripts:
- `sync` every 8h, `telegram` every 2h, `cleanup` on a sensible interval.
- All with `workflow_dispatch` for manual triggering.
- Read shared `.env` via repo secrets.

## Deliverables

- Single consolidated repo at `searchcourse/` with merged app + jobs.
- Fixed TypeScript errors.
- Shared schema/env/Prisma client for app + jobs.
- Light test suite (Vitest + Playwright).
- Redesigned minimalist editorial UI (public + admin).
- GitHub Actions cron for the three jobs.
- README + `.env.example` documenting the single setup.
