# Coupon Verifier — Design Doc

Date: 2026-09-07
Status: Design (approved)

## Purpose

Udemy coupons now die fast — median ~7 hours, capped at ~100 redemptions, and
they can exhaust before their listed end date. The current SearchCourse sync
trusts the feed's `expiresAt` as the only coupon validity signal, leaving dead
coupons active in the DB and allowed to reach the public site and Telegram
broadcast.

This design adds a coupon verifier that actually checks each active coupon
against Udemy and marks invalid ones dead, so what we publish reflects reality.

## Goals

- Actually verify coupon validity against Udemy instead of trusting feed expiry.
- Detect VALID / INVALID / UNDETERMINED and record the result.
- On INVALID, deactivate the coupon; on VALID, refresh `verifiedAt`.
- Reuse the same verification core in:
  1. The automated cleanup path (inside the existing sync cron).
  2. A standalone CLI checker (`npm run check-coupon <url>`).
- Keep it cheap enough for a 15-minute GitHub Actions job (per-run budget).

## Non-goals (YAGNI)

- No new DB columns / migration (`verifiedAt` already exists and is reused).
- No separate workflow or heavier runner.
- No distributed browser farm; single job, sequential budget-capped runs.
- No change to how coupons are seeded or how the broadcast guard works.

## Findings that shaped the design

Exploration this session:

- Plain HTTP is blocked: `axios`/`curl` GETs to a coupon URL return HTTP 403
  (Udemy/Akamai bot protection).
- The server-rendered HTML (200 only inside a real browser) contains the i18n
  strings dictionary but no pricing/coupon buy-box state and no
  `__PRELOADED_STATE__` — so the verdict cannot be parsed from raw HTML.
- The client-rendered page does carry the signal: Udemy shows a
  `data-purpose="coupon-banner"` when a coupon is applied, price elements
  (`data-purpose="price"` / `"discount-price"`) settle at ~$0 for a valid 100%
  coupon, and an invalid/expired/sold-out coupon renders alert text such as
  "This discount code is not valid" / "has expired" / "is sold out".
- The existing spike probes (`spike-probe1/2.mjs`) already detect these signals
  via Playwright with a real Chrome channel.

Conclusion: the verifier is browser-based (Playwright). The edge between the
browser and the logic is a `ProbeSnapshot` of DOM signals; all classification is
pure and unit-testable.

## Detection approach (browser probe + pure classification)

One Playwright session is reused across coupons (cookies pass the challenge
once; subsequent navigations are faster). For each coupon URL:

- Navigate the shared page, lazy-load (scroll bottom then top), poll up to
  `VERIFY_TIMEOUT_MS` for the buy-box.
- Capture `ProbeSnapshot { loaded, blocked, prices[], bannerText, bodySnippet }`.
- `classifySnapshot` decides:
  - Coupon banner present -> VALID
  - Any displayed price is $0 / "Free" -> VALID
  - Invalid-alert text ("not valid"/"has expired"/"sold out", etc.) -> INVALID
  - A definite full price (> 0) with no banner -> INVALID
  - Page blocked (Cloudflare/Akamai) or nothing resolved -> UNDETERMINED

## Components

### 1. Verification core — `src/jobs/lib/verifyCoupon.ts` (pure + orchestration)

- `types.ts`-style types exported from the same file: `CouponStatus`,
  `CouponVerdict`, `ProbeSnapshot`, `FetchUdemyStateFn`.
- `classifySnapshot(snapshot): CouponStatus` — pure, fully unit-tested.
- `verifyCoupon(url, { fetchState }): CouponVerdict` — orchestrates fetch +
  classify; guards the URL (http(s), contains `/course/`).

### 2. Browser probe — `src/jobs/lib/udemyProbe.ts`

- `openUdemyProbe(opts)` launches Chromium (`VERIFY_BROWSER_CHANNEL`, default
  channel `chrome` with bundled-Chromium fallback), opens one page, and returns
  `{ fetchState, close }`.
- `fetchState(url)` navigates the shared page, lazy-loads, polls for the
  buy-box, detects bot-protection `blocked` state, returns the snapshot.

### 3. Automated verifier job — `src/jobs/verify.ts` + cleanup wiring

- `applyVerdict(status)` pure helper -> `{ isActive:false }` | `{ verifiedAt }` | null.
- `runVerification(fetchState?)` — opens one probe session, queries active
  coupons ordered by `verifiedAt` asc, caps at `VERIFY_MAX_COUPONS` (default 50),
  verifies each with a `VERIFY_RATE_LIMIT_MS` delay, applies verdicts, returns counts.
- `main()` — CLI entry.
- Wired into `src/jobs/cleanup.ts` before the existing `expiresAt` pass.

### 4. Standalone CLI checker — `src/jobs/checkCoupon.ts`

- `npm run check-coupon <url>` — opens a probe, verifies one URL, prints a
  human-readable verdict + evidence. No DB writes.

## Environment (all optional, sane defaults when unset)

- `VERIFY_MAX_COUPONS=50`           coupons verified per cleanup run (budget)
- `VERIFY_TIMEOUT_MS=25000`         per-coupon page timeout
- `VERIFY_RATE_LIMIT_MS=500`        delay between coupon navigations
- `VERIFY_BROWSER_CHANNEL=chrome`   "none" to force bundled Playwright Chromium (CI)

## Data flow

```
sync feed (existing)
   │
   ▼
Coupon row (expiresAt from feed, verifiedAt=savedtime)
   │
   ▼
cleanup (new verify step, budget-capped, one browser session)
   ├─ browser probe ── banner present / $0            -> VALID  -> verifiedAt=now()
   ├─ browser probe ── invalid/expired/sold-out text  -> INVALID -> isActive=false
   ├─ browser probe ── full price, no banner          -> INVALID -> isActive=false
   └─ browser probe ── blocked / nothing resolved     -> UNDETERMINED -> untouched
   └─ (then existing expiresAt-based delete/deactivate)
```

## Testing

- Unit tests (`tests/unit/verify-coupon.test.ts`) for `classifySnapshot` and
  `verifyCoupon` with a fake `fetchState`:
  - banner -> VALID; "$0"/"Free" -> VALID
  - "not valid"/"has expired"/"sold out" -> INVALID; full price no banner -> INVALID
  - blocked / no data -> UNDETERMINED
- Unit tests (`tests/unit/cleanup-verify.test.ts`) for `applyVerdict`.
- Follow existing `tests/unit` structure (Vitest), same conventions as
  `src/jobs/lib/affiliate.ts` (pure, no Prisma/env imports in tested helpers).

## Out of scope / follow-ups

- Publishing verified-status in the UI or API (future).
- Splitting verification into its own workflow (only if it outgrows the job).
- Using Udemy's client-side price/graphql API for a faster signal (future
  optimization; DOM signals suffice first).