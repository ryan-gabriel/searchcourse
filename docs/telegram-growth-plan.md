# SearchCourse — Telegram Growth Plan

Goal: grow `@searchcourses` subscribers and drive qualified traffic to course deals.

## Current plumbing

- `TELEGRAM_URL` in `src/lib/site.ts` (env `NEXT_PUBLIC_TELEGRAM_URL`).
- `TelegramCTA` component with `inline` and default variants, used in the root layout, course detail sidebar, and homepage.
- Attribution: `/go/[slug]` and `/api/out/[id]` accept `?src=tg`, and course pages pass `src` through to the affiliate redirect.
- Outbound job: `src/jobs/telegram.ts` / `/api/jobs/telegram`.

## Funnel stages and actions

| Stage | Action | Owner surface |
|---|---|---|
| Aware | Post each new verified deal with price + savings + direct link (`?src=tg`) | Telegram channel |
| Interested | Pin a weekly "best deals roundup" message | Telegram channel |
| Capture | Add a Telegram CTA to every course page (already present) | `TelegramCTA` |
| Retain | Post a daily deal digest at a fixed time | `telegram.ts` job |
| Measure | Track `src=tg` clicks vs `src=web` in admin analytics | `click.service.ts` |

## Channel tactics

1. **Deal cadence** — 2-3 posts/day max. Each post: thumbnail, title, was/now price, savings %, one-line why, affiliate link with `?src=tg`.
2. **Pinned index** — a pinned message linking to `/categories` and `/platforms` landing pages so subscribers browse the site, not just the feed.
3. **Lead magnet** — offer a "Free Udemy coupon tracker" or weekly digest signup in exchange for joining; keep it a genuine utility, not a bribe.
4. **Cross-pollination** — footer Telegram link (done), plus a "get deals first on Telegram" line on the `/courses` listing header.
5. **Referral loop** — periodic "know someone learning X? forward this" prompts on high-value free courses.
6. **Non-spam hygiene** — no more than one affiliate-heavy post per day; alternate with genuinely free courses and roadmap highlights.

## Metrics to watch

- Subscriber growth per week (channel stats).
- Click-through rate on `?src=tg` links (admin analytics).
- `src=tg` vs `src=web` conversion to affiliate outbound.
- Unsubscribe/block rate after posts.

## Guardrails

- Every deal post must be a verified active coupon; do not post expired deals — it burns trust fastest.
- Disclose affiliate relationship (already in course page copy; mirror it in pinned message).
- Do not buy subscribers or use engagement pods.