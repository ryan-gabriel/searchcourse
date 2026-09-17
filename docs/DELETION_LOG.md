# Code Deletion Log

## [2026-09-17] Refactor Session — Layering & Validation Consolidation

### Moved Business Logic Out of App Layer
- `src/app/api/out/[id]/route.ts` — Inlined redirect/URL-safety logic moved to `src/services/click.service.ts`:
  - `isAffiliateUrl()` (was a private route helper)
  - `isAllowedRedirectTarget()` (was a private route helper, duplicated the affiliate check inline)
  - `buildCourseRedirectUrl()` (was the inline `affiliateUrl || directUrl` + couponCode-append block)
  - Reason: meets the strict Database → Service → Validation → UI layering; route now only delegates to services.
  - Callers updated: route imports `buildCourseRedirectUrl`, `isAllowedRedirectTarget` from `@/services`.

### Unused Validation Duplication Consolidated
- Created `src/validations/shared.ts` with `slugPattern`, `pageField`, `limitField(max, default)`.
- `src/validations/course.schema.ts` — Used `slugPattern` (CourseCreateSchema), `pageField` + `limitField(500, 12)` (CourseSearchSchema).
- `src/validations/coupon.schema.ts` — Used `pageField` + `limitField(500, 20)` (CouponSearchSchema).
- `src/validations/roadmap.schema.ts` — Used `slugPattern` (RoadmapCreateSchema), `pageField` + `limitField(20, 10)` (RoadmapSearchSchema).
- `src/validations/platform.schema.ts` — Used `slugPattern` (PlatformCreateSchema), `pageField` + `limitField(500, 20)` (PlatformSearchSchema).
- `src/validations/category.schema.ts` — Used `slugPattern` (CategoryCreateSchema), `pageField` + `limitField(500, 20)` (CategorySearchSchema).
- `src/validations/click.schema.ts` — Used `pageField` + `limitField(200, 20)` (EventsSearchSchema).
- `src/validations/index.ts` — Re-exports `./shared`.
- Reason: page field was copy-pasted identically 6x; limit field pattern 6x; slug regex 4x. Schema object names/output shapes unchanged.

### Deliberately Left Alone
- `src/services/course.service.ts` (383 lines) — cohesive read pipeline sharing one DTO mapper; writes already split into course-admin.service.ts.
- `src/services/roadmap.service.ts` (303 lines) — cohesive search/read + 3-line admin wrappers; no low-cohesion grouping.
- `src/jobs/lib/tutorialbar-post.ts` (411 lines) — already pure parsing helpers + exported parser/merge; extraction adds indirection without clarity.
- `src/app/admin/**` form pages — thin data-loading wrappers delegating to `src/components/admin/*` client forms.
- `generateSlug` vs `slugify` — semantically different (NFD vs NFKD, & handling, fallback/truncation); separate callers depend on divergent behavior.
- `formatPriceSimple` vs `formatPrice`, `formatCount` vs `formatStudents` — different output formats with dedicated tests/callers.

### Impact
- Files changed: 8 (7 edited, 1 created)
- Lines removed: ~110 (mostly duplicated URL-safety logic in route)

### Testing
- `npm run lint` — 0 errors, 5 pre-existing warnings (unchanged: `.opencode/plugins/ecc-hooks.ts`, `scripts/generate-seo-assets.mjs`)
- `npm run typecheck` — clean
- `npm run test` — 16 files, 186 tests passing