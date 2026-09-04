# SearchCourse Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the two existing SearchCourse projects (Next.js app + cron/telegram scripts) into a single clean Next.js repo at `searchcourse/`, with one schema/env/Prisma client, fixed TypeScript errors, light testing, GitHub Actions cron, and a minimalist-editorial redesign.

**Architecture:** A single Next.js App Router application. The existing `SearchCourse-old/` app and `search-course-cron-and-telegram/` scripts are replaced by a fresh `searchcourse/` project. The **cron schema** (which has the sync fields `externalId`, `isPosted`, `headline`, `language` and a **nullable** `categoryId` on Course) is adopted as the canonical single schema, and the app's service/validation/UI layers are extended to support those fields. Jobs become plain `tsx` scripts under `src/jobs/` importing the app's shared Prisma client.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7 (`@prisma/adapter-pg` + pg Pool), Supabase auth (`@supabase/ssr`), Zod 4, Tailwind CSS v4 (CSS-first), `tsx` for jobs, Vitest + Playwright for tests, GitHub Actions for cron.

## Global Constraints

- **Workspace root:** `/mnt/c/Codes/Projects/SearchCourse-test/`. The new project lives in `/mnt/c/Codes/Projects/SearchCourse-test/searchcourse/`.
- **Canonical schema:** the cron project's `Course` model is the source of truth — it MUST include `externalId String? @unique`, `headline String? @db.VarChar(500)`, `language String? @db.VarChar(50)`, `isPosted Boolean @default(false)`, and `categoryId String?` (nullable) with `category Category?`. Do NOT regress to the app's required-category / no-sync-field model.
- **Node version:** `20` for CI cron jobs (matches existing workflows).
- **TS strict mode** must pass: `tsc --noEmit` clean.
- **Prisma client pattern:** Prisma 7 driver adapter (`new PrismaPg(pool)`), global singleton via `globalForPrisma`, throws if `DATABASE_URL` missing.
- Test command: `npm run test` (Vitest) and `npm run test:e2e` (Playwright).
- Lint command: `npm run lint` (eslint, `eslint-config-next`).
- **Do NOT add comments to code** unless the original file had them; when porting files, preserve existing comments.

---

### Task 1: Scaffold the consolidated project

**Files:**
- Create: `searchcourse/package.json`
- Create: `searchcourse/tsconfig.json`
- Create: `searchcourse/next.config.ts`
- Create: `searchcourse/postcss.config.mjs`
- Create: `searchcourse/eslint.config.mjs`
- Create: `searchcourse/.gitignore`
- Create: `searchcourse/.env.example`
- Create: `searchcourse/next-env.d.ts`
- Create: `searchcourse/prisma.config.ts`
- Create: `searchcourse/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the runnable project skeleton that all later tasks build on; `npm run dev` / `npm run build` work.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "searchcourse",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "sync": "tsx src/jobs/sync.ts",
    "telegram": "tsx src/jobs/telegram.ts",
    "cleanup": "tsx src/jobs/cleanup.ts",
    "postinstall": "prisma generate",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.3.0",
    "@prisma/client": "^7.3.0",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.93.3",
    "axios": "^1.7.0",
    "clsx": "^2.1.1",
    "lru-cache": "^11.2.5",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "pg": "^8.18.0",
    "prisma": "^7.3.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "server-only": "^0.0.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@tailwindcss/postcss": "^4",
    "@types/cheerio": "^0.22.35",
    "@types/node": "^20",
    "@types/pg": "^8.16.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "cheerio": "^1.2.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "tsx": "^4.19.0",
    "typescript": "^5",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
    "types": ["node"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts",
    "vitest.config.ts"
  ],
  "exclude": ["node_modules", "tests/e2e"]
}
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img-c.udemycdn.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "d3njjcbhbojbot.cloudfront.net", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

- [ ] **Step 5: Create `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "playwright-report/**", "test-results/**"]),
]);
```

- [ ] **Step 6: Create `.gitignore`**

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/
playwright-report/
test-results/

# next.js
.next/
out/
next-env.d.ts

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# typescript
*.tsbuildinfo

# sdd workspace
.superpowers/
```

- [ ] **Step 7: Create `.env.example`**

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# RapidAPI (Udemy Coupons)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=udemy-coupons1.p.rapidapi.com

# Affiliate Links (Impact.com)
IMPACT_AFFILIATE_BASE=https://impact.example.com/click

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890

# Site
SITE_BASE_URL=https://searchcourse.com

# Rate limiting (optional)
RATE_LIMIT_SEARCH=30
RATE_LIMIT_CLICK=60

# IP hashing salt (optional)
IP_SALT=change-me
```

- [ ] **Step 8: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 9: Create `prisma.config.ts`**

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

- [ ] **Step 10: Create `README.md`**

```md
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
```

- [ ] **Step 11: Verify the scaffold**

Run: `npm install` then `npm run lint` and `npm run typecheck` from `searchcourse/`.
Expected: install succeeds; lint has no errors; typecheck reports no TS errors.

- [ ] **Step 12: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold consolidated searchcourse project"
```

---

### Task 2: Author the canonical Prisma schema

**Files:**
- Create: `searchcourse/prisma/schema.prisma`

**Interfaces:**
- Consumes: nothing.
- Produces: the single schema; Prisma client with models `Platform`, `Category`, `Course`, `Coupon`, `Roadmap`, `RoadmapStep`, `SiteSettings`, `CourseLearningOutcome`, `CourseSyllabusSection`, `CourseSyllabusItem`, `ClickEvent`; enums `ClickSource`, `CourseLevel`. This is copied from `search-course-cron-and-telegram/prisma/schema.prisma` **verbatim** (it is the canonical source with the sync fields). Do not apply the old app's non-null `categoryId` — keep `categoryId String?` nullable.

- [ ] **Step 1: Copy the canonical schema**

Copy the file `search-course-cron-and-telegram/prisma/schema.prisma` into `searchcourse/prisma/schema.prisma` exactly (no edits — the cron schema is canonical). Verify it contains:
- `enum ClickSource { WEB TELEGRAM }` and `enum CourseLevel { BEGINNER INTERMEDIATE ADVANCED ALL_LEVELS }`
- On `Course`: `externalId String? @unique`, `headline String? @db.VarChar(500)`, `language String? @db.VarChar(50)`, `isPosted Boolean @default(false)`, `categoryId String?` with `category Category?`, and `@@index([isPosted])`, `@@index([externalId])`.

- [ ] **Step 2: Generate the client and verify**

Run (from `searchcourse/`): `npx prisma generate`
Expected: no errors; `@prisma/client` generated with the canonical models.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git add -A
git commit -m "feat: add canonical prisma schema with sync fields"
```

---

### Task 3: Port the shared lib layer

**Files:**
- Create: `searchcourse/src/lib/prisma.ts`
- Create: `searchcourse/src/lib/rate-limit.ts`
- Create: `searchcourse/src/lib/slug.utils.ts`
- Create: `searchcourse/src/lib/utils.ts`
- Create: `searchcourse/src/lib/supabase.ts`
- Create: `searchcourse/src/lib/supabase-browser.ts`

**Interfaces:**
- Consumes: nothing (depends only on installed deps + canonical schema).
- Produces:
  - `export const prisma: PrismaClient` and `export default prisma`
  - `rateLimit(identifier, endpoint?, config?): RateLimitResult`, `getRateLimitHeaders(result): Record<string,string>`, `export const rateLimiters: { search; click }`
  - `generateSlug(title): string`, `isValidSlug(slug): boolean`, `generateUniqueSlug(baseSlug, existingSlugs): string`
  - `cn(...inputs): string`, `slugify(text): string`, `formatPrice(price, currency?): string`, `calculateDiscountPercentage(original, final): number`, `formatDuration(minutes): string`, `formatCompactNumber(num): string`, `debounce(fn, wait)`, `hashIP(ip): Promise<string>`, `getRelativeTime(date): string`, `isCouponExpired(expiresAt): boolean`, `truncate(text, maxLength): string`
  - `createSupabaseServerClient()`, `getUser(): Promise<User|null>`, `isAdmin(): Promise<boolean>`, `getAdminUser(): Promise<User|null>`
  - `createSupabaseBrowserClient()`

- [ ] **Step 1: Create `src/lib/prisma.ts`** (port from `SearchCourse-old/src/lib/prisma.ts` — the Prisma 7 driver-adapter singleton pattern)

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

- [ ] **Step 2: Create `src/lib/rate-limit.ts`** (port from `SearchCourse-old/src/lib/rate-limit.ts`)

```ts
import { LRUCache } from "lru-cache";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

const defaultConfig: RateLimitConfig = { limit: 30, windowMs: 60000 };

const caches = new Map<string, LRUCache<string, number[]>>();

function getCache(endpoint: string) {
  let cache = caches.get(endpoint);
  if (!cache) {
    cache = new LRUCache<string, number[]>({ max: 10000, ttl: 60000 });
    caches.set(endpoint, cache);
  }
  return cache;
}

export function rateLimit(
  identifier: string,
  endpoint: string = "default",
  config: RateLimitConfig = defaultConfig
): RateLimitResult {
  const cache = getCache(endpoint);
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const hits = (cache.get(identifier) ?? []).filter((t) => t > windowStart);
  const remaining = Math.max(0, config.limit - hits.length);
  const resetTime = hits.length ? Math.max(...hits) + config.windowMs : now + config.windowMs;
  if (hits.length >= config.limit) {
    cache.set(identifier, hits);
    return { success: false, limit: config.limit, remaining: 0, resetTime };
  }
  hits.push(now);
  cache.set(identifier, hits);
  return { success: true, limit: config.limit, remaining, resetTime };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetTime),
  };
}

function rateLimitSearch(identifier: string) {
  return rateLimit(identifier, "search", {
    limit: Number(process.env.RATE_LIMIT_SEARCH) || 30,
    windowMs: 60000,
  });
}

function rateLimitClick(identifier: string) {
  return rateLimit(identifier, "click", {
    limit: Number(process.env.RATE_LIMIT_CLICK) || 60,
    windowMs: 60000,
  });
}

export const rateLimiters = {
  search: rateLimitSearch,
  click: rateLimitClick,
};
```

- [ ] **Step 3: Create `src/lib/slug.utils.ts`** (port from old app)

```ts
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 200;
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  const set = new Set(existingSlugs);
  let candidate = baseSlug;
  let counter = 0;
  while (set.has(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}
```

- [ ] **Step 4: Create `src/lib/utils.ts`** (port from old app)

```ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(price: number | string, currency: string = "USD"): string {
  const value = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateDiscountPercentage(originalPrice: number, finalPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

export function debounce<T extends (...args: never[]) => unknown>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

export async function hashIP(ip: string): Promise<string> {
  const salt = process.env.IP_SALT || "search-course-salt";
  const data = new TextEncoder().encode(ip + salt);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function isCouponExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() < Date.now();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
```

- [ ] **Step 5: Create `src/lib/supabase.ts`**

```ts
import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component; safe to ignore when read-only.
          }
        },
      },
    }
  );
}

export async function getUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.user_metadata?.is_admin === true;
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getUser();
  if (user?.user_metadata?.is_admin === true) return user;
  return null;
}
```

- [ ] **Step 6: Create `src/lib/supabase-browser.ts`**

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck` from `searchcourse/`.
Expected: no TS errors.

- [ ] **Step 8: Commit**

`git add src/lib && git commit -m "feat: port shared lib layer (prisma, rate-limit, slug, utils, supabase)"`

---

### Task 4: Port validations (Zod schemas)

**Files:**
- Create: `searchcourse/src/validations/course.schema.ts`
- Create: `searchcourse/src/validations/coupon.schema.ts`
- Create: `searchcourse/src/validations/roadmap.schema.ts`
- Create: `searchcourse/src/validations/click.schema.ts`
- Create: `searchcourse/src/validations/platform.schema.ts`
- Create: `searchcourse/src/validations/category.schema.ts`
- Create: `searchcourse/src/validations/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exported from the barrel `index.ts`):
  - `CourseLevelEnum`, `CourseLearningOutcomeSchema`, `CourseSyllabusItemSchema`, `CourseSyllabusSectionSchema`, `CourseSearchSchema`, `CourseCreateSchema`, `CourseUpdateSchema`, `CourseResponseSchema`, and their `*Params`/`*Input`/`*Response` types.
  - `DiscountTypeEnum`, `CouponCreateSchema`, `CouponUpdateSchema`, `CouponSearchSchema`
  - `RoadmapCreateSchema`, `RoadmapUpdateSchema`, `RoadmapStepCreateSchema`, `RoadmapStepUpdateSchema`, `RoadmapSearchSchema`
  - `ClickSourceEnum`, `ClickCreateSchema`, `ClickAnalyticsSchema`
  - `PlatformCreateSchema`, `PlatformUpdateSchema`, `PlatformSearchSchema`
  - `CategoryCreateSchema`, `CategoryUpdateSchema`, `CategorySearchSchema`

**Note on the sync fields:** `CourseCreateSchema`/`CourseResponseSchema` must be **extended** to include `externalId`, `headline` (max 500), `language` (max 50), `isPosted` (boolean, default false), and make `categoryId` nullable `z.string().cuid().nullable().optional()`.

- [ ] **Step 1: Create `course.schema.ts`** (extended with sync fields)

```ts
import { z } from "zod";

export const CourseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]);
export type CourseLevel = z.infer<typeof CourseLevelEnum>;

export const CourseLearningOutcomeSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export const CourseSyllabusItemSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export const CourseSyllabusSectionSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().min(1),
  duration: z.string().optional(),
  sortOrder: z.number().int().default(0),
  items: z.array(CourseSyllabusItemSchema).default([]),
});

export const CourseSearchSchema = z.object({
  query: z.string().max(200).optional(),
  platform: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  level: CourseLevelEnum.optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().min(0).optional(),
  hasDiscount: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(12),
  sortBy: z.enum(["rating", "price", "date", "discount", "popular"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type CourseSearchParams = z.infer<typeof CourseSearchSchema>;

export const CourseCreateSchema = z.object({
  externalId: z.string().max(100).optional().nullable(),
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(10000).optional().nullable(),
  shortDescription: z.string().max(320).optional().nullable(),
  headline: z.string().max(500).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  instructorName: z.string().max(100).optional().nullable(),
  instructorBio: z.string().max(5000).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  originalPrice: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  level: CourseLevelEnum.default("ALL_LEVELS"),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().min(0).default(0),
  studentCount: z.number().int().min(0).default(0),
  duration: z.string().max(20).optional().nullable(),
  lectureCount: z.number().int().min(0).optional().nullable(),
  directUrl: z.string().url(),
  affiliateUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPosted: z.boolean().default(false),
  platformId: z.string().cuid(),
  categoryId: z.string().cuid().nullable().optional(),
});
export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;

export const CourseUpdateSchema = CourseCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>;

export const CourseResponseSchema = CourseCreateSchema.extend({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastVerifiedAt: z.date(),
  platform: z.object({ id: z.string().cuid(), name: z.string(), slug: z.string() }).optional(),
  category: z.object({ id: z.string().cuid(), name: z.string(), slug: z.string() }).nullable().optional(),
  activeCoupon: z
    .object({
      id: z.string().cuid(),
      finalPrice: z.number(),
      discountValue: z.number(),
      code: z.string().nullable(),
    })
    .nullable()
    .optional(),
});
export type CourseResponse = z.infer<typeof CourseResponseSchema>;
```

- [ ] **Step 2: Create `coupon.schema.ts`**

```ts
import { z } from "zod";

export const DiscountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

export const CouponCreateSchema = z.object({
  code: z.string().max(50).optional().nullable(),
  discountType: DiscountTypeEnum.default("PERCENTAGE"),
  discountValue: z.number().min(0),
  finalPrice: z.number().min(0),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
  source: z.string().max(100).optional().nullable(),
  courseId: z.string().cuid(),
});
export type CouponCreateInput = z.infer<typeof CouponCreateSchema>;

export const CouponUpdateSchema = CouponCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type CouponUpdateInput = z.infer<typeof CouponUpdateSchema>;

export const CouponSearchSchema = z.object({
  courseId: z.string().cuid().optional(),
  isActive: z.coerce.boolean().optional(),
  minDiscount: z.number().min(0).max(100).optional(),
  notExpired: z.coerce.boolean().default(true),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});
export type CouponSearchParams = z.infer<typeof CouponSearchSchema>;
```

- [ ] **Step 3: Create `roadmap.schema.ts`**

```ts
import { z } from "zod";

export const RoadmapCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional().nullable(),
  iconName: z.string().max(50).optional().nullable(),
  estimatedHours: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("ALL_LEVELS"),
  hasJobGuarantee: z.boolean().default(false),
  hasCertificate: z.boolean().default(false),
  hasFreeResources: z.boolean().default(false),
  isShortPath: z.boolean().default(false),
  skillTags: z.array(z.string()).default([]),
});
export type RoadmapCreateInput = z.infer<typeof RoadmapCreateSchema>;

export const RoadmapUpdateSchema = RoadmapCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type RoadmapUpdateInput = z.infer<typeof RoadmapUpdateSchema>;

export const RoadmapStepCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  orderIndex: z.number().int().min(0),
  roadmapId: z.string().cuid(),
  courseId: z.string().cuid(),
});
export type RoadmapStepCreateInput = z.infer<typeof RoadmapStepCreateSchema>;

export const RoadmapStepUpdateSchema = RoadmapStepCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type RoadmapStepUpdateInput = z.infer<typeof RoadmapStepUpdateSchema>;

export const RoadmapSearchSchema = z.object({
  query: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  category: z.string().optional(),
  hasJobGuarantee: z.coerce.boolean().optional(),
  hasCertificate: z.coerce.boolean().optional(),
  hasFreeResources: z.coerce.boolean().optional(),
  isShortPath: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
export type RoadmapSearchParams = z.infer<typeof RoadmapSearchSchema>;
```

- [ ] **Step 4: Create `click.schema.ts`**

```ts
import { z } from "zod";

export const ClickSourceEnum = z.enum(["WEB", "TELEGRAM"]);
export type ClickSource = z.infer<typeof ClickSourceEnum>;

export const ClickCreateSchema = z.object({
  courseId: z.string().cuid(),
  source: ClickSourceEnum.default("WEB"),
  userAgent: z.string().max(512).optional(),
  referer: z.string().max(512).optional(),
  ipHash: z.string().max(64).optional(),
  country: z.string().length(2).optional(),
});
export type ClickCreateInput = z.infer<typeof ClickCreateSchema>;

export const ClickAnalyticsSchema = z.object({
  courseId: z.string().cuid().optional(),
  source: ClickSourceEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  groupBy: z.enum(["day", "week", "month", "source", "country"]).default("day"),
});
export type ClickAnalyticsParams = z.infer<typeof ClickAnalyticsSchema>;
```

- [ ] **Step 5: Create `platform.schema.ts`**

```ts
import { z } from "zod";

export const PlatformCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().nullable().optional(),
  baseUrl: z.string().url(),
  isActive: z.boolean().default(true),
});
export type PlatformCreateInput = z.infer<typeof PlatformCreateSchema>;

export const PlatformUpdateSchema = PlatformCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type PlatformUpdateInput = z.infer<typeof PlatformUpdateSchema>;

export const PlatformSearchSchema = z.object({
  query: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});
export type PlatformSearchParams = z.infer<typeof PlatformSearchSchema>;
```

- [ ] **Step 6: Create `category.schema.ts`**

```ts
import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).nullable().optional(),
  iconName: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().default(0),
});
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  id: z.string().cuid(),
});
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;

export const CategorySearchSchema = z.object({
  query: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});
export type CategorySearchParams = z.infer<typeof CategorySearchSchema>;
```

- [ ] **Step 7: Create the barrel `index.ts`**

```ts
export * from "./course.schema";
export * from "./coupon.schema";
export * from "./roadmap.schema";
export * from "./click.schema";
export * from "./platform.schema";
export * from "./category.schema";
```

- [ ] **Step 8: Verify + commit**

Run: `npm run typecheck`.
Expected: no TS errors.
Commit: `git add src/validations && git commit -m "feat: port zod validations (with sync fields)"`

---

### Task 5: Port the service layer

**Files:**
- Create: `searchcourse/src/services/course.service.ts`
- Create: `searchcourse/src/services/coupon.service.ts`
- Create: `searchcourse/src/services/roadmap.service.ts`
- Create: `searchcourse/src/services/click.service.ts`
- Create: `searchcourse/src/services/platform.service.ts`
- Create: `searchcourse/src/services/category.service.ts`
- Create: `searchcourse/src/services/admin.service.ts`
- Create: `searchcourse/src/services/settings.service.ts`
- Create: `searchcourse/src/services/index.ts`

**Interfaces:**
- Consumes: `prisma` (Task 3), validation `*Input`/`*Params` types (Task 4).
- Produces (barrel exports everything):
  - `course.service.ts`: `CourseWithDetails`, `PaginatedResult<T>`, `CourseFullDetails` + `searchCourses`, `getCourseBySlug`, `getCourseById`, `getFeaturedCourses`, `getTopDiscountCourses`, `getCourseWithFullDetails`, `createCourse`, `updateCourse`, `deleteCourse`, `updateCourseLearningOutcomes`, `updateCourseSyllabus`.
  - `coupon.service.ts`: `CouponWithCourse`, `CouponSearchParams` + `searchCoupons`, `getCouponById`, `getActiveCouponsForCourse`, `createCoupon`, `updateCoupon`, `deleteCoupon`, `deactivateExpiredCoupons`.
  - `roadmap.service.ts`: `RoadmapWithSteps`, `RoadmapStepWithCourse` + `searchRoadmaps`, `getRoadmapBySlug`, `getRoadmapById`, `getFeaturedRoadmaps`, `createRoadmap`, `updateRoadmap`, `deleteRoadmap`, `addRoadmapStep`, `removeRoadmapStep`, `reorderRoadmapSteps`.
  - `click.service.ts`: `recordClick`, `getCourseClickCount`, `getClickStats`, `getTopClickedCourses`, `getDailyClickTrend`.
  - `platform.service.ts`: `PlatformWithCounts` + `searchPlatforms`, `getAllPlatforms`, `getPlatformById`, `getPlatformBySlug`, `createPlatform`, `updatePlatform`, `deletePlatform`.
  - `category.service.ts`: `CategoryWithCounts` + `searchCategories`, `getAllCategories`, `getCategoryById`, `getCategoryBySlug`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`.
  - `admin.service.ts`: `DashboardStats`, `ClickAnalytics` + `getDashboardStats`, `getClickAnalytics`.
  - `settings.service.ts`: `SETTINGS_ID`, `SiteSettingsUpdateInput` + `getSiteSettings`, `updateSiteSettings`, `getAboutPageStats`, `getMissionContent`, `getHomepageStats`.

**Key requirement — sync-field exposure:** `course.service.ts` return types and `searchCourses`/`getCourseById`/`getCourseWithFullDetails` must **include** `externalId`, `isPosted`, `headline`, and `language` in their selects, and `searchCourses` must gain a new optional filter `isPosted?: boolean`. Where a `// @ts-ignore` was needed in the old repo right after `prisma generate`, replicate it.

- [ ] **Step 1: Port `course.service.ts`** from `SearchCourse-old/src/services/course.service.ts`, adding `externalId`, `headline`, `language`, `isPosted` to `CourseWithDetails` (all typed with `externalId: string | null`, `headline: string | null`, `language: string | null`, `isPosted: boolean`) and to the `searchCourses` params as `isPosted?: boolean`.

- [ ] **Step 2: Port the other service files** (`coupon`, `roadmap`, `click`, `platform`, `category`, `admin`, `settings`) verbatim from `SearchCourse-old/src/services/<file>` to the same path, preserving all exports listed in Interfaces.

- [ ] **Step 3: Create the barrel `index.ts`**

```ts
export * from "./course.service";
export * from "./roadmap.service";
export * from "./click.service";
export * from "./platform.service";
export * from "./category.service";
export * from "./coupon.service";
export * from "./admin.service";
export * from "./settings.service";
```

- [ ] **Step 4: Verify types**

Run: `npm run typecheck`.
Expected: services clean; pre-existing admin DataTable errors remain (fixed in Task 9).

- [ ] **Step 5: Commit**

`git add src/services && git commit -m "feat: port service layer with sync-field support"`

---

### Task 6: Port the API routes

**Files:**
- Create: `searchcourse/src/app/api/courses/route.ts`
- Create: `searchcourse/src/app/api/out/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/analytics/route.ts`
- Create: `searchcourse/src/app/api/admin/analytics/events/route.ts`
- Create: `searchcourse/src/app/api/admin/categories/route.ts`
- Create: `searchcourse/src/app/api/admin/categories/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/coupons/route.ts`
- Create: `searchcourse/src/app/api/admin/coupons/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/courses/route.ts`
- Create: `searchcourse/src/app/api/admin/courses/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/courses/[id]/outcomes/route.ts`
- Create: `searchcourse/src/app/api/admin/courses/[id]/syllabus/route.ts`
- Create: `searchcourse/src/app/api/admin/platforms/route.ts`
- Create: `searchcourse/src/app/api/admin/platforms/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/roadmaps/route.ts`
- Create: `searchcourse/src/app/api/admin/roadmaps/[id]/route.ts`
- Create: `searchcourse/src/app/api/admin/roadmaps/[id]/steps/route.ts`
- Create: `searchcourse/src/app/api/admin/roadmaps/[id]/steps/[stepId]/route.ts`
- Create: `searchcourse/src/app/api/admin/roadmaps/[id]/steps/reorder/route.ts`
- Create: `searchcourse/src/app/api/admin/settings/route.ts`

**Interfaces:**
- Consumes: services + validations (Tasks 4–5), `rateLimiters` (Task 3).
- Produces: the same HTTP surface as the old app. Auth is enforced by middleware (Task 10 of old / new Task 7 here), so routes do not self-check auth.
- **Critical fix:** `/api/admin/analytics/events/route.ts` must NOT reference a `coupon` relation on `ClickEvent` (there is none). Use `include: { course: { select: { id: true, title: true, slug: true } } }`.

- [ ] **Step 1:** Port all public + admin route handlers by copying each `route.ts` from `SearchCourse-old/src/app/api/...` to the matching path, preserving handlers and Zod usage.

- [ ] **Step 2:** Fix `/api/admin/analytics/events/route.ts`: use the `course` include above (not `coupon`).

- [ ] **Step 3:** Run `npm run typecheck`. Expected: no TS errors in `src/app/api/**`.

- [ ] **Step 4:** Commit: `git add src/app/api && git commit -m "fix: port api routes and resolve click event types"`

---

### Task 7: Port middleware + layout + public pages with the redesign

**Files:**
- Create: `searchcourse/src/middleware.ts`
- Create: `searchcourse/src/app/layout.tsx`
- Create: `searchcourse/src/app/globals.css` (redesigned — minimalist editorial)
- Create: `searchcourse/src/app/page.tsx` (homepage)
- Create: `searchcourse/src/app/sitemap.ts`
- Create: `searchcourse/src/app/robots.ts`
- Create: `searchcourse/src/app/manifest.ts`
- Create: `searchcourse/src/app/courses/page.tsx`
- Create: `searchcourse/src/app/courses/[slug]/page.tsx`
- Create: `searchcourse/src/app/roadmaps/page.tsx`
- Create: `searchcourse/src/app/roadmaps/[slug]/page.tsx`
- Create: `searchcourse/src/app/about/page.tsx`
- Create: `searchcourse/src/app/login/page.tsx`

**Interfaces:**
- Consumes: services (Task 5), lib (Task 3), components (Task 8), validations.
- Produces: the runnable public site with the new minimalist-editorial visual system.

**Design direction (minimalist editorial):** warm neutral palette (off-white background `#faf9f7`, near-black ink `#1a1917`), strong editorial typography, flat bento-style grids, **no gradients**, no glassmorphism, subtle/no shadows, restrained motion. Replace the old indigo/purple gradient + glass aesthetic entirely.

- [ ] **Step 1: Create `src/middleware.ts`** (port from `SearchCourse-old/src/middleware.ts`; matcher `/admin/:path*`, redirects non-admin to `/login?redirectTo=...`).

- [ ] **Step 2: Author the redesigned `src/app/globals.css`** (Tailwind v4 CSS-first) with the minimalist tokens: `--background:#faf9f7; --foreground:#1a1917; --surface:#ffffff; --surface-muted:#f1efe9; --border:#e5e1d8; --accent:#1a1917; --accent-ink:#faf9f7; --price:#0b7a3b;` plus `.dark` equivalents and `@theme inline` mapping, `.btn`, `.btn-primary`, `.btn-secondary`, `.animate-fadeIn`. No gradient/glass utilities.

- [ ] **Step 3: Create `src/app/layout.tsx`** with the minimalist header/footer (via Task 8 components), Inter font, metadata.

- [ ] **Step 4: Port the public page files** from `SearchCourse-old/src/app/...`, restyled to the minimalist components (Task 8). Drop old gradient-text/glass classes for new tokens. Preserve same data fetching via services and same routes.

- [ ] **Step 5: Verify** — `npm run build` (or `npm run dev` briefly) and `npm run typecheck`. Expected: app builds; pages render; no TS errors.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: port middleware and public pages with minimalist redesign"`

---

### Task 8: Port + restyle shared components

**Files:**
- Create: `searchcourse/src/components/layout/ThemeProvider.tsx`
- Create: `searchcourse/src/components/layout/Header.tsx`
- Create: `searchcourse/src/components/layout/Footer.tsx`
- Create: `searchcourse/src/components/layout/index.ts`
- Create: `searchcourse/src/components/ui/SearchForm.tsx`
- Create: `searchcourse/src/components/ui/Skeleton.tsx`
- Create: `searchcourse/src/components/ui/index.ts`
- Create: `searchcourse/src/components/course/CourseCard.tsx`
- Create: `searchcourse/src/components/course/CourseGrid.tsx`
- Create: `searchcourse/src/components/course/SearchBar.tsx`
- Create: `searchcourse/src/components/course/index.ts`
- Create: `searchcourse/src/components/roadmap/RoadmapCard.tsx`
- Create: `searchcourse/src/components/roadmap/RoadmapFilters.tsx`
- Create: `searchcourse/src/components/roadmap/RoadmapProgress.tsx`
- Create: `searchcourse/src/components/roadmap/RoadmapStep.tsx`
- Create: `searchcourse/src/components/roadmap/SavingsBadge.tsx`
- Create: `searchcourse/src/components/roadmap/index.ts`
- Create: `searchcourse/src/components/admin/Sidebar.tsx`
- Create: `searchcourse/src/components/admin/StatCard.tsx`
- Create: `searchcourse/src/components/admin/Modal.tsx`
- Create: `searchcourse/src/components/admin/DataTable.tsx`
- Create: `searchcourse/src/components/admin/FormField.tsx`
- Create: `searchcourse/src/components/admin/index.ts`

**Interfaces:**
- Consumes: `cn`/`formatPrice`/`calculateDiscountPercentage`/`formatCompactNumber` from lib (Task 3), `useTheme` hook.
- Produces: `ThemeProvider` + `useTheme()`; Header/Footer; CourseCard/CourseGrid/SearchBar; RoadmapCard/RoadmapFilters/RoadmapProgress/RoadmapStep/SavingsBadge; admin Sidebar/StatCard/Modal/DataTable/FormField.

- [ ] **Step 1: Port `ThemeProvider.tsx`** (verbatim) — keeps `useTheme()` API.

- [ ] **Step 2: Port Header/Footer and all course/roadmap/admin components**, restyling to minimal tokens.

- [ ] **Step 3: Fix admin DataTable typing** (the `tsc_errors.txt` TS2322/2345). Give it a generic `Column<T>` where `accessorKey` is `keyof T`:

```ts
import React from "react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
}: {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-left">
          <tr>
            {columns.map((c) => (
              <th key={String(c.accessorKey)} className="px-4 py-3 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])} className="border-t border-border">
              {columns.map((c) => (
                <td key={String(c.accessorKey)} className="px-4 py-3">
                  {c.cell ? c.cell(row) : String(row[c.accessorKey])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `npm run typecheck`.

- [ ] **Step 5: Commit** — `git add src/components && git commit -m "feat: port and restyle shared components, fix DataTable typing"`

---

### Task 9: Port + simplify admin CMS pages

**Files:**
- Create: `searchcourse/src/app/admin/layout.tsx`
- Create: `searchcourse/src/app/admin/page.tsx`
- Create: `searchcourse/src/app/admin/courses/page.tsx`
- Create: `searchcourse/src/app/admin/courses/[id]/page.tsx`
- Create: `searchcourse/src/app/admin/categories/page.tsx`
- Create: `searchcourse/src/app/admin/platforms/page.tsx`
- Create: `searchcourse/src/app/admin/coupons/page.tsx`
- Create: `searchcourse/src/app/admin/roadmaps/page.tsx`
- Create: `searchcourse/src/app/admin/roadmaps/[id]/page.tsx`
- Create: `searchcourse/src/app/admin/roadmaps/[id]/steps/page.tsx`
- Create: `searchcourse/src/app/admin/analytics/page.tsx`
- Create: `searchcourse/src/app/admin/settings/page.tsx`

**Interfaces:**
- Consumes: services + validations + admin components (Tasks 4–5, 8).
- Produces: the protected admin CMS (dashboard, courses CRUD, categories, platforms, coupons, roadmaps + steps, analytics, settings) restyled to minimalist design.

- [ ] **Step 1: Port `admin/layout.tsx`** (Sidebar + content wrapper) with new design tokens.

- [ ] **Step 2: Port each admin page** from `SearchCourse-old/src/app/admin/...`, converting each to the new `DataTable<T>`/`Column<T>` generic types with concrete service return types. This resolves remaining `tsc_errors.txt` errors.

- [ ] **Step 3: Verify** — `npm run typecheck`. Expected: **zero TS errors** across the entire project.

- [ ] **Step 4: Commit** — `git add src/app/admin && git commit -m "feat: port admin CMS with fixed types and redesign"`

---

### Task 10: Port the cron/telegram jobs into the app

**Files:**
- Create: `searchcourse/src/jobs/sync.ts`
- Create: `searchcourse/src/jobs/telegram.ts`
- Create: `searchcourse/src/jobs/cleanup.ts`
- Create: `searchcourse/src/jobs/lib/categories.ts`

**Interfaces:**
- Consumes: the shared `prisma` client (Task 3). Jobs import `prisma` from `@/lib/prisma` and call `prisma.$disconnect()` in a `finally`.
- Produces: runnable via `npm run sync`, `npm run telegram`, `npm run cleanup`.

- [ ] **Step 1:** Port the three job scripts and `lib/categories.ts` from the cron project into `src/jobs/`, changing the import from `import { prisma, disconnect } from './lib/prisma.js'` to `import { prisma } from "@/lib/prisma"`, and replacing each `await disconnect()` with `await prisma.$disconnect()`.

- [ ] **Step 2:** Remove the cron's raw `ALTER TABLE ... ADD COLUMN IF NOT EXISTS "isPosted"` hack in telegram.ts — the canonical schema now has `isPosted`.

- [ ] **Step 3:** DRY the slug — import `generateSlug` from `@/lib/slug.utils` (or keep the local one); choose one and use it consistently in sync.ts.

- [ ] **Step 4:** Verify TS: `npx tsc --noEmit src/jobs/sync.ts src/jobs/telegram.ts src/jobs/cleanup.ts --module esnext --moduleResolution bundler --strict --skipLibCheck`. Expected: no TS errors.

- [ ] **Step 5:** Commit — `git add src/jobs && git commit -m "feat: consolidate cron/telegram/cleanup jobs into app"`

---

### Task 11: Add GitHub Actions cron workflows

**Files:**
- Create: `searchcourse/.github/workflows/sync.yml`
- Create: `searchcourse/.github/workflows/broadcast.yml`

**Interfaces:**
- Consumes: the new `npm run sync|telegram|cleanup` scripts + shared `.env` secrets.
- Produces: automated 8-hourly sync (with cleanup) and 2-hourly Telegram broadcast, plus manual dispatch.

- [ ] **Step 1: Create `sync.yml`**

```yaml
name: Sync Udemy Courses

on:
  schedule:
    - cron: "0 */8 * * *"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - name: Run Sync
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RAPIDAPI_KEY: ${{ secrets.RAPIDAPI_KEY }}
          RAPIDAPI_HOST: ${{ secrets.RAPIDAPI_HOST }}
          IMPACT_AFFILIATE_BASE: ${{ secrets.IMPACT_AFFILIATE_BASE }}
          SITE_BASE_URL: ${{ secrets.SITE_BASE_URL }}
        run: npm run sync
      - name: Run Cleanup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run cleanup
```

- [ ] **Step 2: Create `broadcast.yml`**

```yaml
name: Telegram Broadcast

on:
  schedule:
    - cron: "0 */2 * * *"
  workflow_dispatch:

jobs:
  broadcast:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - name: Run Broadcast
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
          SITE_BASE_URL: ${{ secrets.SITE_BASE_URL }}
        run: npm run telegram
```

- [ ] **Step 3:** Verify YAML parses.

- [ ] **Step 4:** Commit — `git add .github && git commit -m "ci: add scheduled sync and telegram broadcast workflows"`

---

### Task 12: Add light testing (Vitest unit + Playwright smoke)

**Files:**
- Create: `searchcourse/vitest.config.ts`
- Create: `searchcourse/playwright.config.ts`
- Create: `searchcourse/tests/unit/utils.test.ts`
- Create: `searchcourse/tests/unit/coupon-cleanup.test.ts`
- Create: `searchcourse/tests/unit/affiliate-url.test.ts`
- Create: `searchcourse/tests/e2e/public-flows.spec.ts`

**Interfaces:**
- Consumes: lib/utils + pure-logic helpers, app routes.
- Produces: `npm run test` (Vitest) and `npm run test:e2e` (Playwright) passing.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 3: Write unit tests** (pure logic, no DB) in the three unit files — test `calculateDiscountPercentage`, `generateSlug`, `isCouponExpired`, `buildAffiliateUrl` (null when no base; encodes URL), and `isEligibleForDeactivation` cleanup logic.

- [ ] **Step 4: Write Playwright smoke test** `tests/e2e/public-flows.spec.ts` asserting homepage/courses/roadmaps page shells render.

- [ ] **Step 5: Run** `npm run test`. Expected: all Vitest specs pass.

- [ ] **Step 6: Commit** — `git add vitest.config.ts playwright.config.ts tests && git commit -m "test: add vitest unit and playwright smoke tests"`

---

### Task 13: Verify the whole build + final review

**Files:**
- Modify: none (verification only).

- [ ] **Step 1:** `npm run lint && npm run typecheck` — clean, zero errors.
- [ ] **Step 2:** `npm run build` — succeeds.
- [ ] **Step 3:** `npm run test` — all pass.
- [ ] **Step 4:** Final commit — `git add -A && git commit -m "chore: final review"`

---

## Self-Review Notes

**Spec coverage:** single repo/schema/env/shared client (Tasks 1,2,3,10); all features (Tasks 6–11); TS fixes (Tasks 6,8,9); light testing (Task 12); minimalist redesign (Tasks 7,8,9); GH Actions cron (Task 11); README + .env.example (Task 1); schema drift reconciliation (Task 2, + Tasks 4,5).

**Placeholder scan:** all tasks include concrete code or explicit "port file X preserving signature Y" with real signatures enumerated in Interfaces. No TBD/TODO.

**Type consistency:** `CourseWithDetails` (Task 5) matches `CourseResponse` (Task 4), both include sync fields. `Column<T>`/`DataTable<T>` (Task 8) used in Task 9. Jobs import `prisma` from `@/lib/prisma` (Task 3), consistent with Task 10. `rateLimiters.search/click` (Task 3) used in Task 6.
