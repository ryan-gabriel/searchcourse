# Graph Report - searchcourse  (2026-09-11)

## Corpus Check
- 170 files · ~280,403 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1347 nodes · 2069 edges · 97 communities (90 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a71fff25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pipeline.ts
- validate_data.py
- Path
- devDependencies
- course.service.ts
- SEO Audit
- design_system.py
- compilerOptions
- dependencies
- Common Code Smells & Fixes
- roadmap.service.ts
- search_stack
- read_rows
- SearchCourse UI/UX Redesign — Design Spec
- search
- core.py
- admin-route.ts
- coupon.service.ts
- validations/index.ts
- canonical.ts
- _select_palette_for_mode
- platform.service.ts
- DesignSystemGenerator
- generate-seo-assets.mjs
- utils.ts
- BM25
- Community Marketing
- UI/UX Pro Max - Design Intelligence
- Global Constraints
- Global Constraints
- SearchCourse Frontend Redesign — Design Spec
- SearchCourse Rebuild — Design Doc
- detect_domain
- cleanup.ts
- telegram.ts
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- .generate
- prisma.ts
- click.service.ts
- _resolve_color_mode
- services/index.ts
- Global Constraints
- settings.service.ts
- rate-limit.ts
- parse_decision_rules
- TestTextLayoutDataContracts
- The 5 Community Models
- _normalize
- AI Writing Detection
- constants.ts
- AGENTS.md
- Global Constraints
- Content Quality Across Locales
- URL Structure
- Hreflang
- test_skill_script_paths.py
- _row_identities
- TestStackFlagWithDesignSystem
- Phrases That Signal AI Writing
- Canonicalization & i18n
- International Sitemaps
- outcomes/route.ts
- opencode.json
- International SEO: Evidence & Sources
- Em Dashes: The Primary AI Tell
- SearchCourse
- next.config.ts
- graphify.js
- proxy.ts
- eslint.config.mjs
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `DesignSystemGenerator` - 45 edges
2. `search()` - 40 edges
3. `search_stack()` - 30 edges
4. `BM25` - 22 edges
5. `withAdmin()` - 20 edges
6. `compilerOptions` - 18 edges
7. `detect_domain()` - 17 edges
8. `CatalogRefreshTest` - 15 edges
9. `TestSearchDomains` - 15 edges
10. `TestDomainDetection` - 15 edges

## Surprising Connections (you probably didn't know these)
- `TestBm25CoreBehavior` --uses--> `BM25`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/tests/test_core.py → .opencode/skills/ui-ux-pro-max/scripts/core.py
- `TestDomainDetection` --uses--> `BM25`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/tests/test_core.py → .opencode/skills/ui-ux-pro-max/scripts/core.py
- `TestPersistence` --uses--> `BM25`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/tests/test_core.py → .opencode/skills/ui-ux-pro-max/scripts/core.py
- `TestReasoningMatch` --uses--> `BM25`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/tests/test_core.py → .opencode/skills/ui-ux-pro-max/scripts/core.py
- `TestSearchDomains` --uses--> `BM25`  [INFERRED]
  .opencode/skills/ui-ux-pro-max/scripts/tests/test_core.py → .opencode/skills/ui-ux-pro-max/scripts/core.py

## Import Cycles
- None detected.

## Communities (97 total, 7 thin omitted)

### Community 0 - "pipeline.ts"
Cohesion: 0.06
Nodes (70): buildAffiliateUrl(), extractCoupon(), formatDuration(), isCouponValid(), normalizeDuration(), parseExpiry(), parsePrice(), getCategoryMap() (+62 more)

### Community 1 - "validate_data.py"
Cohesion: 0.07
Nodes (46): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _catalog_date(), _check_app_interface_contract(), _check_catalog_contract() (+38 more)

### Community 2 - "Path"
Cohesion: 0.08
Nodes (9): CatalogRefreshTest, CatalogSummaryLineEndingsTest, _load_generator(), Simulate a Windows checkout: the recorded hashes must still validate., TestBm25CoreBehavior, TestFixtureValidation, TestMetricMath, TestThresholdGate (+1 more)

### Community 3 - "devDependencies"
Cohesion: 0.05
Nodes (43): cheerio, eslint, eslint-config-next, devDependencies, cheerio, eslint, eslint-config-next, @tailwindcss/postcss (+35 more)

### Community 4 - "course.service.ts"
Cohesion: 0.07
Nodes (35): DELETE, GET, PUT, RouteParams, GET, POST, GET(), getRateLimitHeaders() (+27 more)

### Community 5 - "SEO Audit"
Cohesion: 0.05
Nodes (42): Audit Framework, Audit Report Structure, Canonicalization for Multilingual Sites, Common Issues by Site Type, Content/Blog Sites, Content Depth, Content Optimization, Content Quality Across Locales (+34 more)

### Community 6 - "design_system.py"
Cohesion: 0.08
Nodes (31): ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides() (+23 more)

### Community 7 - "compilerOptions"
Cohesion: 0.06
Nodes (33): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node (+25 more)

### Community 8 - "dependencies"
Cohesion: 0.06
Nodes (33): axios, clsx, geist, lru-cache, lucide-react, next, dependencies, axios (+25 more)

### Community 9 - "Common Code Smells & Fixes"
Cohesion: 0.06
Nodes (32): 10. Inappropriate Intimacy, 1. Long Method/Function, 2. Duplicated Code, 3. Large Class/Module, 4. Long Parameter List, 5. Feature Envy, 6. Primitive Obsession, 7. Magic Numbers/Strings (+24 more)

### Community 10 - "roadmap.service.ts"
Cohesion: 0.08
Nodes (27): DELETE, GET, PUT, RouteParams, POST, RouteParams, GET, POST (+19 more)

### Community 11 - "search_stack"
Cohesion: 0.10
Nodes (8): _project_row(), Search stack-specific guidelines, search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 12 - "read_rows"
Cohesion: 0.11
Nodes (7): read_rows(), split_values(), style_identities(), TestGeneratedCatalogContract, TestLandingAndStackContract, TestReasoningContract, TestStyleIdentityContract

### Community 13 - "SearchCourse UI/UX Redesign — Design Spec"
Cohesion: 0.07
Nodes (28): 1. Goal, 2. Decisions (locked), 3.1 Color tokens, 3.2 Typography, 3.3 Motion & effects, 3.4 Component primitives (`globals.css`), 3. Design System, 4.1 `src/app/layout.tsx` (+20 more)

### Community 14 - "search"
Cohesion: 0.10
Nodes (9): _exact_stack_identifier(), Resolve a deprecated in-domain alias, or expose a cross-domain redirect., Main search function with auto-domain detection, Resolve a standalone API identifier even when its BM25 IDF is low., search(), _style_search_destination(), TestSearchDomains, read_rows() (+1 more)

### Community 15 - "core.py"
Cohesion: 0.12
Nodes (25): _contains_phrase(), _domain_keywords(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot(), _load_product_keywords(), _load_rows_or_empty() (+17 more)

### Community 16 - "admin-route.ts"
Cohesion: 0.11
Nodes (19): EventsSearchSchema, GET, GET, PUT, RouteParams, StepOrderSchema, DELETE, RouteParams (+11 more)

### Community 17 - "coupon.service.ts"
Cohesion: 0.09
Nodes (21): DELETE, GET, PUT, RouteParams, GET, POST, CouponSearchParams, CouponWithCourse (+13 more)

### Community 18 - "validations/index.ts"
Cohesion: 0.11
Nodes (18): DELETE, GET, PUT, RouteParams, GET, POST, CategoryWithCounts, createCategory() (+10 more)

### Community 19 - "canonical.ts"
Cohesion: 0.12
Nodes (21): CoursesIndexingDecision, DEFAULT_SORT, DEFAULT_SORT_ORDER, FACET_KEYS, isSortVariant(), MEANINGFUL_KEYS, resolveCoursesIndexing(), ResolveInput (+13 more)

### Community 20 - "_select_palette_for_mode"
Cohesion: 0.12
Nodes (12): _contrast_ratio(), _derive_dark_palette(), _palette_is_dark(), WCAG relative luminance of a #RRGGBB string, or None if unparseable., True when a colors.csv row's Background is a dark surface., WCAG contrast ratio for two hex colors, or None if either is invalid., Keep product brand tokens while deriving accessible dark surfaces., Pick the highest-ranked palette matching the resolved mode.      Only the dark (+4 more)

### Community 21 - "platform.service.ts"
Cohesion: 0.11
Nodes (18): DELETE, GET, PUT, RouteParams, GET, POST, createPlatform(), deletePlatform() (+10 more)

### Community 22 - "DesignSystemGenerator"
Cohesion: 0.13
Nodes (9): DesignSystemGenerator, Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., TestReasoningMatch, The exact reproduction from issue #428. (+1 more)

### Community 23 - "generate-seo-assets.mjs"
Cohesion: 0.16
Nodes (15): BRAND, Canvas, chunk(), crc32(), drawBookGlyph(), encodeIco(), encodePng(), favicon() (+7 more)

### Community 24 - "utils.ts"
Cohesion: 0.16
Nodes (8): buildBrandedLink(), escapeMarkdown(), formatCourseMessage(), formatDiscount(), calculateDiscountPercentage(), CURRENCY_LOCALES, formatPriceSimple(), isCouponExpired()

### Community 25 - "BM25"
Cohesion: 0.15
Nodes (8): BM25, BM25 ranking algorithm for text search, Lowercase, normalize synonyms, split, remove punctuation, filter stopwords, Build BM25 index from documents, Suggest complete public identities so a retry can bypass score thresholds., _suggest_identities(), TestDiagnosticsContracts, TestTokenizer

### Community 26 - "Community Marketing"
Cohesion: 0.11
Nodes (17): Before You Start, Build around a shared identity, not just a product, Building a Brand Ambassador / Advocate Program, Community Health Metrics, Community-Led Support (Deflection + Retention), Community Marketing, Community Models & Scaling Phases, Community Strategy Principles (+9 more)

### Community 27 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.11
Nodes (17): Before Delivering App UI, Example Workflow, If a search returns 0 results, Output Formats, Query Contract, Rule Categories by Priority, Running the search tool, Step 1: Analyze User Requirements (+9 more)

### Community 28 - "Global Constraints"
Cohesion: 0.12
Nodes (16): Global Constraints, SearchCourse Consolidation Implementation Plan, Self-Review Notes, Task 10: Port the cron/telegram jobs into the app, Task 11: Add GitHub Actions cron workflows, Task 12: Add light testing (Vitest unit + Playwright smoke), Task 13: Verify the whole build + final review, Task 1: Scaffold the consolidated project (+8 more)

### Community 29 - "Global Constraints"
Cohesion: 0.12
Nodes (15): Global Constraints, SearchCourse Dark-Tech Redesign Implementation Plan, Self-Review Notes, Task 10: Home page, Task 11: About, LegalPage, error and loading states, Task 12: Final verification sweep, Task 1: Theme tokens, fonts, dark-first, Task 2: Header and Footer (+7 more)

### Community 30 - "SearchCourse Frontend Redesign — Design Spec"
Cohesion: 0.12
Nodes (15): 1. Typography, 2. Color Palette, 3. Spacing and Layout, 4. Component Tokens, 5. Motion and Transitions, 6. Accessibility, 7. Loading and Error States, Badges (+7 more)

### Community 31 - "SearchCourse Rebuild — Design Doc"
Cohesion: 0.13
Nodes (14): Architecture, Data Flow, Data Model, Deliverables, Error Handling, Features, Goals, Non-goals (YAGNI) (+6 more)

### Community 32 - "detect_domain"
Cohesion: 0.23
Nodes (3): detect_domain(), Auto-detect the most relevant domain from query.      Matches are weighted by, TestDomainDetection

### Community 33 - "cleanup.ts"
Cohesion: 0.24
Nodes (10): GET(), main(), runCleanup(), isStaleScrapedCoupon(), StaleScrapedCouponTerm, staleScrapedCouponWhere(), CLEANUP, cutoffHoursAgo() (+2 more)

### Community 34 - "telegram.ts"
Cohesion: 0.23
Nodes (9): getTelegramErrorMessage(), main(), runBroadcast(), sendTelegramMessage(), sleep(), toNumber(), BroadcastCouponGuardInput, shouldBroadcastCoupon() (+1 more)

### Community 35 - "Pre-Delivery Checklist (canonical — the only one)"
Cohesion: 0.15
Nodes (12): Accessibility, Common Rules for Professional UI + Pre-Delivery Checklist, Icons & Visual Elements, Interaction, Interaction (App), Layout, Layout & Spacing, Light/Dark Mode (+4 more)

### Community 36 - "Quick Reference"
Cohesion: 0.15
Nodes (12): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+4 more)

### Community 37 - ".generate"
Cohesion: 0.19
Nodes (6): _filter_anti_patterns_for_mode(), Drop "avoid dark mode" advice once dark mode is the resolved answer., Execute searches across multiple domains., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/densi, TestAntiPatternGating

### Community 38 - "prisma.ts"
Cohesion: 0.22
Nodes (4): GET(), GET(), isCronAuthorized(), globalForPrisma

### Community 39 - "click.service.ts"
Cohesion: 0.17
Nodes (6): ClickAnalyticsParams, ClickAnalyticsSchema, ClickCreateInput, ClickCreateSchema, ClickSource, ClickSourceEnum

### Community 40 - "_resolve_color_mode"
Cohesion: 0.21
Nodes (7): _query_wants_dark(), True when a styles.csv row describes itself as dark-first., True when the query explicitly asks for a dark theme., Resolve the mode the rest of the output has to agree with., _resolve_color_mode(), _style_is_dark_primary(), TestModeResolution

### Community 41 - "services/index.ts"
Cohesion: 0.23
Nodes (8): PUT, RouteParams, GET(), RouteContext, getCourseBySlug(), updateCourseSyllabus(), CourseSyllabusUpdateSchema, mockGetCourseBySlug

### Community 42 - "Global Constraints"
Cohesion: 0.18
Nodes (10): Global Constraints, SearchCourse Frontend Redesign — Implementation Plan, Task 1: Design Foundation — Typography & Color Tokens, Task 2: Component Tokens & ScrollReveal Component, Task 3: Public Page Layouts & Spacing, Task 4: Course & Roadmap Component Upgrades, Task 5: Admin Pages — Skeleton Loaders & Polish, Task 6: Global Accessibility Fixes (+2 more)

### Community 43 - "settings.service.ts"
Cohesion: 0.27
Nodes (9): GET, PUT, SettingsSchema, getAboutPageStats(), getHomepageStats(), getMissionContent(), getSiteSettings(), SiteSettingsUpdateInput (+1 more)

### Community 44 - "rate-limit.ts"
Cohesion: 0.24
Nodes (10): RATE_LIMIT, caches, defaultConfig, getCache(), rateLimit(), rateLimitClick(), RateLimitConfig, rateLimiters (+2 more)

### Community 45 - "parse_decision_rules"
Cohesion: 0.27
Nodes (6): apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), Return deterministic mutations and an audit trail; never execute data., Parse the canonical condition -> action-array representation., _validate_action()

### Community 46 - "TestTextLayoutDataContracts"
Cohesion: 0.22
Nodes (3): read_rows(), TestTextLayoutDataContracts, TestTextLayoutRetrieval

### Community 47 - "The 5 Community Models"
Cohesion: 0.22
Nodes (8): 1. Support-Driven, 2. Product-Development, 3. Education / Enablement, 4. Founder-Led, Community Models & Scaling Phases, Flagship Benchmark: Notion's Ambassador Program, Scaling-Phase Role Shift, The 5 Community Models

### Community 48 - "_normalize"
Cohesion: 0.25
Nodes (9): _exact_match_diagnostic(), _legacy_successor_guidance(), _normalize(), Apply longest-first synonym substitution at token boundaries., Whether a stack query explicitly targets an older framework generation., Choose one coherent applicability generation for stack retrieval., Prefer the explicit successor row for a brand-new app on legacy-only stacks., _stack_query_requests_legacy() (+1 more)

### Community 49 - "AI Writing Detection"
Cohesion: 0.25
Nodes (8): Academic-Specific AI Tells, AI Writing Detection, Contents, Filler Words and Empty Intensifiers, How to Self-Check, Overused Adjectives, Overused Transitions and Connectors, Overused Verbs

### Community 50 - "constants.ts"
Cohesion: 0.32
Nodes (5): BROADCAST, DASHBOARD, TIME, ClickAnalytics, DashboardStats

### Community 51 - "AGENTS.md"
Cohesion: 0.29
Nodes (6): Architecture, Commands, Gotchas, graphify, Overview, Setup

### Community 52 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Self-Review, Task 1: Redirect `/go/{slug}` to the course detail page with `?src=tg`, Task 2: Course detail page carries `?src=tg` on the affiliate CTA, Task 3: Final verification, Telegram → Website → Udemy Redirect Flow Implementation Plan

### Community 53 - "Content Quality Across Locales"
Cohesion: 0.29
Nodes (7): Auto-Translated Content (2025 Stance), Content Quality Across Locales, Crawl Budget, Helpful Content System Impact, Locale-Specific Signals, Partial Translation, Thin Locale Pages

### Community 54 - "URL Structure"
Cohesion: 0.29
Nodes (7): Content Negotiation / IP Redirects, Default Language, Framework Locale Modes, Search Console Geotargeting, Strategies Compared, Trailing Slash Consistency, URL Structure

### Community 55 - "Hreflang"
Cohesion: 0.29
Nodes (7): Google vs Bing, Hreflang, Hreflang at Scale (20+ locales), Language & Region Codes, Placement Methods, Reciprocal Requirement, x-default

### Community 56 - "test_skill_script_paths.py"
Cohesion: 0.38
Nodes (5): Every script invocation in the shipped skill markdown resolves from the skill di, Return (target, None) for a skill-relative path, or (None, reason)., resolve(), shipped_invocations(), SkillScriptPathsTest

### Community 57 - "_row_identities"
Cohesion: 0.33
Nodes (6): _exact_row_identity(), Return non-empty public identities from ordinary and alias fields., Resolve an explicit style identity without opening generic variant ranking., Return one row whose stable public identity exactly matches the query., _row_identities(), _style_identity()

### Community 59 - "Phrases That Signal AI Writing"
Cohesion: 0.40
Nodes (5): Concluding Phrases to Avoid, Opening Phrases to Avoid, Phrases That Signal AI Writing, Structural Patterns to Avoid, Transitional Phrases to Avoid

### Community 60 - "Canonicalization & i18n"
Cohesion: 0.40
Nodes (5): Canonical Overrides Hreflang, Canonicalization & i18n, Near-Duplicate Regional Variants, Pagination Across Locales, Self-Referencing Canonicals

### Community 61 - "International Sitemaps"
Cohesion: 0.40
Nodes (5): International Sitemaps, Next.js Caveat, Size Limits, Structure, Submission

### Community 62 - "outcomes/route.ts"
Cohesion: 0.40
Nodes (4): PUT, RouteParams, updateCourseLearningOutcomes(), CourseOutcomeUpdateSchema

### Community 63 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 65 - "Em Dashes: The Primary AI Tell"
Cohesion: 0.50
Nodes (4): Em Dashes: The Primary AI Tell, Guidelines, What To Do Instead, Why Em Dashes Signal AI Writing

### Community 66 - "SearchCourse"
Cohesion: 0.50
Nodes (3): Getting started, Scripts, SearchCourse

## Knowledge Gaps
- **440 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `reactCompilerFalsePositives`, `securityHeaders`, `nextConfig` (+435 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DesignSystemGenerator` connect `DesignSystemGenerator` to `detect_domain`, `Path`, `.generate`, `design_system.py`, `_resolve_color_mode`, `read_rows`, `search`, `_select_palette_for_mode`, `BM25`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `search()` connect `search` to `detect_domain`, `validate_data.py`, `.generate`, `design_system.py`, `search_stack`, `TestTextLayoutDataContracts`, `core.py`, `_normalize`, `_row_identities`, `BM25`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 30 inferred relationships involving `DesignSystemGenerator` (e.g. with `TestBm25CoreBehavior` and `TestDiagnosticsContracts`) actually correct?**
  _`DesignSystemGenerator` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `search()` (e.g. with `.generate()` and `._multi_domain_search()`) actually correct?**
  _`search()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `search_stack()` (e.g. with `.test_diagnostics_opt_in_is_additive_for_stack_search()` and `.test_every_stack_file_exists_and_is_searchable()`) actually correct?**
  _`search_stack()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `BM25` (e.g. with `TestBm25CoreBehavior` and `.test_empty_documents_produce_no_scores_or_vocab()`) actually correct?**
  _`BM25` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `Path` (e.g. with `.test_catalog_cross_check_uses_explicit_schema_without_font_file_urls()` and `.test_catalog_rejects_bool_rank_duplicate_axis_and_unreviewed_addition()`) actually correct?**
  _`Path` has 20 INFERRED edges - model-reasoned connections that need verification._