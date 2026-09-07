# Coupon Verifier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify each active Udemy coupon against the real Udemy page so dead coupons get deactivated instead of being broadcast.

**Architecture:** Browser-based verifier. Exploration proved Udemy blocks plain HTTP (axios/curl → 403, Akamai bot protection) and the SSR HTML carries no pricing/coupon state — the verdict must come from the client-rendered buy-box. So the core is a Playwright probe (reused across coupons in one session) that captures the DOM signals, plus a **pure, unit-tested classification layer** (`classifySnapshot`) that turns the captured state into a verdict. A budget cap (`VERIFY_MAX_COUPONS`) keeps each GitHub Actions run inside its 15-min window. A shared core (`src/jobs/lib/verifyCoupon.ts`) drives both the automated cleanup path and a standalone CLI checker.

**Tech Stack:** TypeScript, Node 22, axios, Playwright (`@playwright/test`), Vitest, Prisma.

## Global Constraints

- Follow existing code style (4-space indent, single quotes, semicolons) as seen in `src/jobs/lib/affiliate.ts` and `src/jobs/sync.ts`.
- Verification core must be free of Prisma and env-heavy imports so it can be unit-tested (same convention as `affiliate.ts`).
- All optional env vars must have sane defaults when unset.
- Only refresh `verifiedAt` on a real VALID confirmation; only deactivate on a solid INVALID.
- No schema migrations.

---

### Task 1: Network probe signal exploration

**Status:** DONE (findings recorded)

Exploration result (this session): `axios` and `curl` both get HTTP 403 from
Udemy's bot protection. The server-rendered HTML (200 via a real browser)
contains only the i18n strings dictionary — no pricing/coupon buy-box state, no
`__PRELOADED_STATE__`. Therefore verdicts must come from the client-rendered
page (or client-side API calls) inside a real browser.

Used selectors: `[data-purpose="coupon-banner"]`, `[data-purpose="price"]`,
`[data-purpose="discount-price"]`, buy-box markers
`[data-purpose="buy-box"]`, `[data-purpose="price-text-container"]`,
`[data-purpose="course-price-text"]` (all from the existing spike probes).

---

### Task 2: Verification core

**Files:**
- Create: `src/jobs/lib/verifyCoupon.ts` (pure classification + orchestration)
- Create: `src/jobs/lib/udemyProbe.ts` (browser probe that produces `ProbeSnapshot`)
- Test: `tests/unit/verify-coupon.test.ts`

**Interfaces:**
- Consumes: `extractCoupon` from `src/jobs/lib/affiliate.ts`; browser launcher (Playwright).
- Produces:
  - `export type CouponStatus = "VALID" | "INVALID" | "UNDETERMINED"`
  - `export interface CouponVerdict { status: CouponStatus; price: number | null; evidence: string[] }`
  - `export interface ProbeSnapshot { loaded: boolean; blocked: boolean; prices: string[]; bannerText: string | null; bodySnippet: string }`
  - `export type FetchUdemyStateFn = (url: string) => Promise<ProbeSnapshot>`
  - `export function classifySnapshot(snapshot: ProbeSnapshot): CouponStatus`
  - `export async function verifyCoupon(url: string, opts: { fetchState?: FetchUdemyStateFn }): Promise<CouponVerdict>`
  - `export async function openUdemyProbe(opts?: { timeoutMs?: number; pollIntervalMs?: number }): Promise<{ fetchState: FetchUdemyStateFn; close(): Promise<void> }>`

- [ ] **Step 1: Write the failing test** (`tests/unit/verify-coupon.test.ts`):
  - `classifySnapshot`:
    - banner present -> VALID
    - price `["Free"]` / `["$0"]` without banner -> VALID
    - "discount code is not valid" / "has expired" text -> INVALID
    - prices all > 0 and no banner -> INVALID
    - blocked / empty -> UNDETERMINED
  - `verifyCoupon` with a fake `fetchState` returns the matching verdict + evidence.
- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/verify-coupon.test.ts`
Expected: FAIL — module not defined / type errors

- [ ] **Step 3: Write minimal implementation**

`verifyCoupon.ts`:
- `classifySnapshot` implements the rules above (invalid-signal regex list, zero-price detection via `parseFloat`).
- `verifyCoupon` calls `fetchState`, classifies, returns verdict; guards the URL (must be http(s) and contain `course/`).

`udemyProbe.ts`:
- `openUdemyProbe` launches Chromium (channel `chrome` via `VERIFY_BROWSER_CHANNEL`, falling back to bundled Chromium), opens one page, lazy-loads (scroll bottom then top), poll for buy-box up to `timeoutMs`.
- `fetchState` navigates the shared page to the URL, reads coupon banner + price elements + a body snippet, detects Cloudflare (`Just a moment` / `Attention Required` title or very short body) -> `blocked`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/verify-coupon.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/jobs/lib/verifyCoupon.ts src/jobs/lib/udemyProbe.ts tests/unit/verify-coupon.test.ts
git commit -m "feat: add coupon verification core with pure classification"
```

---

### Task 3: Automated verify job + cleanup wiring

**Files:**
- Create: `src/jobs/verify.ts`
- Modify: `src/jobs/cleanup.ts`
- Test: `tests/unit/cleanup-verify.test.ts` (pure `applyVerdict` helper)

**Interfaces:**
- Consumes: `verifyCoupon`, `openUdemyProbe`, `prisma`, env `VERIFY_*`
- Produces:
  - `export function applyVerdict(status: CouponStatus): { isActive?: false; verifiedAt?: Date } | null`
  - `export async function runVerification(fetchState?: FetchUdemyStateFn): Promise<{ verified: number; invalid: number; undetermined: number }>`
  - `export async function main(): Promise<void>`

- [ ] **Step 1: Write failing test for `applyVerdict`**
  - VALID -> `{ verifiedAt }`
  - INVALID -> `{ isActive: false }`
  - UNDETERMINED -> `null`
- [ ] **Step 2: Run test, verify fail**
- [ ] **Step 3: Implement `src/jobs/verify.ts`**: query active coupons ordered by `verifiedAt` asc, cap at `VERIFY_MAX_COUPONS` (default 50), open one probe session, verify each (rate-limit delay `VERIFY_RATE_LIMIT_MS` default 500), apply verdict via Prisma `update`. `main()` runs `runVerification`. `runVerification` opens/closes the session and accepts an injected `fetchState` for tests.
- [ ] **Step 4: Wire into `cleanup.ts`** — import `runVerification`, run it before the `expiresAt` delete/deactivate block, log counts, keep the existing time-based pass.
- [ ] **Step 5: Run tests, verify pass**
- [ ] **Step 6: Commit**

---

### Task 4: CLI checker

**Files:**
- Create: `src/jobs/checkCoupon.ts`
- Modify: `package.json` (add `"check-coupon"` script)

**Interfaces:**
- Consumes: `verifyCoupon`, `openUdemyProbe`
- Produces: stdout verdict for a single URL, no DB writes.

- [ ] **Step 1: Implement `checkCoupon.ts`** parsing `process.argv[2]` as URL, opening a probe, printing status/price/evidence.
- [ ] **Step 2: Add `"check-coupon": "tsx src/jobs/checkCoupon.ts"` to package.json scripts.**
- [ ] **Step 3: Smoke test** `npm run check-coupon "<url>"` and verify it prints a verdict.
- [ ] **Step 4: Commit**

---

### Task 5: Env example + workflow + final verification

**Files:**
- Modify: `.env.example`
- Modify: `.github/workflows/sync.yml` (install Playwright browsers; pass VERIFY_* env to cleanup)

- [ ] **Step 1: Add VERIFY_* vars (with comments)** to `.env.example` (`VERIFY_MAX_COUPONS`, `VERIFY_TIMEOUT_MS`, `VERIFY_RATE_LIMIT_MS`, `VERIFY_BROWSER_CHANNEL`).
- [ ] **Step 2: Update `sync.yml`**: add `npx playwright install --with-deps chromium` after `prisma generate`; add VERIFY_* to the cleanup step env.
- [ ] **Step 3: Run full checks:** `npm run typecheck && npm run lint && npm run test`
- [ ] **Step 4: Delete spike scripts** now superseded (`spike-*.mjs`, related `spike-*.png`).
- [ ] **Step 5: Commit**

---

## CI Hardening (follow-up, 2026-09-07)

- Verified the browser path runs in GitHub Actions (`@playwright/test` -> `playwright`
  dep, devDeps installed, `--with-deps chromium`, `VERIFY_BROWSER_CHANNEL: none`).
- Unknown: whether the runner IP passes Udemy's bot protection (datacenter IPs
  are often flagged). If blocked, every coupon returns UNDETERMINED and a full
  budget run would burn the 15-min job timeout.
- Changes shipped:
  1. `CouponVerdict.blocked` flag + `nextBlockedStreak` helper; `verify.ts`
     aborts after `VERIFY_BLOCKED_THRESHOLD` (default 3) consecutive blocked
     pages. Blocked runs now end in ~1 min instead of ~21 min.
  2. `sync.yml` uses hardcoded conservative CI defaults (25 coupons, 15s
     timeout, no secrets fallback).
  3. New `verify-probe.yml` (`workflow_dispatch`) runs `npm run verify` against
     5 coupons to empirically test the runner; trigger manually, read the log.
  4. New `"verify"` npm script (verification only, no expiry deletes).
- Next step: run the probe workflow; if the runner passes, scale sync.yml budget
  up; if not, run `npm run verify` from a non-datacenter host or decouple into
  its own longer-running workflow.