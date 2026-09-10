/**
 * Pure helpers for the cleanup job's stale-coupon deletion.
 * Intentionally free of Prisma and env-heavy imports so it can be unit-tested.
 */

export interface StaleScrapedCouponTerm {
    source: string | null;
    expiresAt: Date | null;
    verifiedAt: Date | null;
}

/**
 * Row-level predicate for hard-deleting stale scraped coupons.
 *
 * Mirrors {@link staleScrapedCouponWhere} (the Prisma bulk-delete clause) one
 * row at a time: only `scraped:`-sourced coupons with a null expiry whose last
 * verification predates `cutoff` are deletable. Manually-curated coupons
 * (e.g. source "Manual", "Partner") never qualify, at any age.
 */
export function isStaleScrapedCoupon(
    term: StaleScrapedCouponTerm,
    cutoff: Date
): boolean {
    if (!term.source || !term.source.startsWith('scraped:')) return false;
    if (term.expiresAt !== null) return false;
    if (term.verifiedAt === null) return false;
    return term.verifiedAt.getTime() < cutoff.getTime();
}

/**
 * Prisma `where` clause for hard-deleting stale scraped coupons in bulk.
 * Must stay in sync with {@link isStaleScrapedCoupon}.
 */
export function staleScrapedCouponWhere(cutoff: Date) {
    return {
        source: { startsWith: 'scraped:' },
        expiresAt: null,
        verifiedAt: { lt: cutoff },
    };
}