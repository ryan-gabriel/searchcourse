# SearchCourse

Course-deal discovery platform: scrapes Udemy coupons via RapidAPI, publishes
deals to the web and a Telegram channel, tracks affiliate clicks, and provides
an admin CMS.

## Getting started

1. `cp .env.example .env` and fill in your values.
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run dev`

## Scripts

- `npm run dev` — local dev server
- `npm run build` — prisma generate + next build
- `npm run sync` — fetch Udemy coupons from RapidAPI (cron)
- `npm run telegram` — broadcast unpublished deals to Telegram (cron)
- `npm run cleanup` — expire/delete stale coupons (cron)
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright tests
- `npm run typecheck` — tsc --noEmit
