# DESIGN.md — SearchCourse

Direction: "The Deal Sheet". A verified price list for online learning. Coupon/receipt/stamp language.

Design Read: consumer deal-hunting marketplace for adult learners, market-poster language.
Dial: **ENERGY 2 / RHYTHM 3 / MOTION 2**.

## Palette (2 core + 1 accent)

| Token | Value | Reason |
|---|---|---|
| `--color-ink` | `#1a1713` | Warm near-black; ink-on-paper reads like a printed price list |
| `--color-paper` | `#f6f4ee` | Warm off-white paper; calmer than pure white, supports long browsing |
| `--color-deal` (accent) | `#0e6b3d` | Green is reserved exclusively for money moments (price, savings, verified stamps). "Green = checked and cheap" is the brand gesture |
| `--color-destructive` | `#a62a1e` | Errors only, never decoration |

Rule: the deal green never appears on generic buttons or headings. If an element is not about money or verification, it is ink/paper.

## Typography

| Role | Face | Reason |
|---|---|---|
| Display (h1/h2/hero) | Fraunces 600–700 | Characterful bookish serif that says "learning"; not the default serif set |
| Body/UI | Work Sans 400–600 | Humanist, friendly, highly legible at small sizes for deal metadata |
| Prices & stamps | Work Sans `tabular-nums` | Tabular figures keep prices aligned like a real price list |

No monospace aesthetic, no wide-tracked uppercase labels.

## Motif: coupon ticket

Repeated brand gesture: perforated dashed edge + punched notches on deal cards,
ticket-shaped Telegram CTA, stamped "verified <date>" chips (dashed border, tabular date).
Coupons are the product's subject; the motif makes the design belong to SearchCourse.

## Theme

Light only. The product is a browsable deals sheet for a general audience; there is no
brand reason for a dark default (R-21).

## Motion (MOTION 2)

- Load-in: hero staggers (headline, sub, CTAs, photo) once on mount.
- Scroll: sections reveal once (opacity + 14px rise, 450ms ease-out), staggered per card.
- Landing only: slow ticker of live deals; pauses on hover/focus; static under reduced motion.
- Hover: cards lift 2px with shadow; thumbnails scale 1.03.
- All motion respects `prefers-reduced-motion` (global kill in globals.css).

## Layout rhythm (RHYTHM 3)

Landing sections alternate composition: ink poster hero → deals ticker → asymmetric
featured grid (1 large + 2 small) → ticket cards → numbered editorial list for roadmaps
→ ticket CTA. Stats appear once, inside the hero, from real data only.

## Icon policy

Icons only where they carry meaning (star rating, check outcomes, clock duration, send
for Telegram). No decorative arrows on every button, no sparkle/star/robot glyphs.
