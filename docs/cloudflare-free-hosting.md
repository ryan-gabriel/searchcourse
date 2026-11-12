# Hosting SearchCourse on Cloudflare (Free Tier)

## Goal
Deploy the Next.js 16 App Router app to Cloudflare with $0/month, preserving Prisma + PostgreSQL + Supabase Auth + cron jobs.

## Constraints discovered
- Next.js 16.3.4 App Router with `nodejs` runtime assumptions (`pg` Pool, `process.env`).
- Prisma 7 via `@prisma/adapter-pg` (TCP to Postgres).
- Supabase Auth (external, fine).
- CRON_SECRET-guarded job endpoints under `/api/jobs/*`.
- CSP in `next.config.ts` allowlists connect-src.

## Recommended architecture (free)

| Component | Cloudflare product | Free limits | Notes |
|---|---|---|---|
| Web app | Cloudflare Pages via OpenNext (`@opennextjs/cloudflare`) | Unlimited requests, 500 builds/mo | Replaces `next start`; use `wrangler pages deploy` |
| Database | Supabase free Postgres (or Neon free) | 500MB / 0.5GB | Keep Prisma schema unchanged; use pooler URL |
| DB connection | Cloudflare Hyperdrive | Free on Workers/Pages | Solves TCP-in-isolate issue for `pg` |
| Cron | cron-job.org (already referenced) OR Cloudflare Cron Triggers via a small Worker | Free | Hits `/api/jobs/*` with `x-cron-secret` |
| Secrets | Cloudflare Pages env vars / Wrangler secrets | Free | Mirror `.env` |

## Steps

### 1. Add OpenNext adapter
- `npm i -D @opennextjs/cloudflare wrangler`
- Create `open-next.config.ts` with default config.
- Add `wrangler.toml`:
  ```toml
  name = "searchcourse"
  compatibility_date = "2025-01-01"
  compatibility_flags = ["nodejs_compat"]
  pages_build_output_dir = ".open-next"
  ```
  `nodejs_compat` flag is required for `pg`/Prisma.
- Scripts: `"build:cf": "opennextjs-cloudflare build"`, `"deploy:cf": "opennextjs-cloudflare deploy"`.
- Update `next.config.ts` only if needed (keep CSP; add Hyperdrive binding usage).

### 2. Database connection strategy (critical)
Cloudflare Workers/Pages isolates cannot hold raw TCP `pg` connections reliably. Two free options:

**Option A (simplest, recommended):** Use Supabase's *transaction pooler* URL (port 6543) as `DATABASE_URL`, and keep `@prisma/adapter-pg` with `?pgbouncer=true`. Add `directUrl` for migrations (Supabase direct connection, port 5432) in `prisma.config.ts`. Hyperdrive not required but helps.

**Option B (best perf):** Create a Cloudflare Hyperdrive binding to the Supabase/Neon Postgres and point Prisma at the Hyperdrive connection string (Hyperdrive exposes a local Postgres-compatible URL inside the worker). Free tier includes Hyperdrive.

Recommendation: start with Option A; move to B only if cold-start latency is bad.

### 3. Environment variables
Set in Cloudflare Pages dashboard (Production + Preview):
- `DATABASE_URL` (pooler URL)
- `NEXT_PUBLIC_APP_URL`, `SITE_BASE_URL` → `https://<project>.pages.dev` (or custom domain)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `IMPACT_AFFILIATE_BASE`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `NEXT_PUBLIC_TELEGRAM_URL`
- `CRON_SECRET`, `IP_SALT`, rate limits

### 4. Cron jobs
Keep using cron-job.org (free) hitting `https://<host>/api/jobs/scrape-coupons` etc. with header `x-cron-secret`. OR add a tiny Cloudflare Worker with `[triggers] crons = ["0 * * * *"]` that fetches those endpoints. Free tier allows 3 cron triggers per account.

### 5. Image optimization
`next/image` with remotePatterns already configured (Udemy CDNs). On Cloudflare, `next/image` optimization runs via OpenNext's image handler using Cloudflare Images? Actually OpenNext uses a worker-based image optimizer; free tier may charge after 100k transforms. Acceptable for low traffic. Alternatively disable optimization (`images.unoptimized = true`) to be safe on free tier.

### 6. Build & deploy
- `npm run build:cf` then `npm run deploy:cf` (or connect GitHub repo to Cloudflare Pages for auto-deploy on push).
- Run migrations: `npx prisma migrate deploy` against production DB before first deploy (use direct URL).

### 7. Gotchas / things to verify
- Supabase Auth redirect URLs: add `https://<host>/auth/callback` (and preview URLs) in Supabase dashboard.
- `nodejs_compat` flag must be set or `pg`/`crypto` break.
- `prisma generate` runs in postinstall; Cloudflare build environment must run `npm install` (it does).
- File-system based jobs (`src/jobs/*.ts`) won't run on Cloudflare — only via HTTP endpoints or external runner. Fine.
- Telegram webhook: set webhook URL to `https://<host>/api/telegram/webhook` (if exists) in Telegram.
- Free tier CPU time limit 10ms-50ms on Pages Functions; scraping is heavy — keep scraping on cron-job.org external runner OR accept that `/api/jobs/scrape` may time out. Better: run scraper as a GitHub Actions job (free) hitting the DB directly, OR accept partial. Actually cron endpoints run inside Pages Functions with 30s wall-clock but 10ms CPU on free — heavy cheerio scraping will exceed CPU. **Recommendation: keep scraping on a free external runner (GitHub Actions scheduled workflow running `npm run scrape`) and only host the web app on Cloudflare.** This is the realistic free setup.

## Deliverables checklist
- [ ] `wrangler.toml`, `open-next.config.ts`
- [ ] package.json scripts
- [ ] `.env` mirrored in Cloudflare dashboard
- [ ] Supabase redirect URLs updated
- [ ] GitHub Actions workflow for scraping (optional but recommended)
- [ ] First deploy + smoke test

## Cost: $0/month (within free tiers). Risk: CPU limits force scraping off-platform.