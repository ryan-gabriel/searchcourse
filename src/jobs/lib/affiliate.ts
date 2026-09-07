/**
 * Pure helpers for building affiliate / coupon URLs.
 * Intentionally free of Prisma and env-heavy imports so it can be unit-tested.
 */

/**
 * Parse a price string like "$9.99" or "9.99" into a number.
 * Returns 0 for missing/unparseable input.
 */
export function parsePrice(price: string | null | undefined): number {
    if (!price) return 0;
    const cleaned = price.replace(/[^0-9.]/g, '');
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

/**
 * Extract the clean course URL and the coupon code from a Udemy coupon URL.
 * e.g. "https://www.udemy.com/course/xyz/?couponCode=CODE"
 *   -> { directUrl: "https://www.udemy.com/course/xyz/", couponCode: "CODE" }
 * If parsing fails, falls back to treating the raw string as the direct URL.
 */
export function extractCoupon(couponUrl: string): { directUrl: string; couponCode: string | null } {
    try {
        const url = new URL(couponUrl);
        const couponCode = url.searchParams.get('couponCode');
        url.searchParams.delete('couponCode');
        return { directUrl: url.toString(), couponCode };
    } catch {
        return { directUrl: couponUrl, couponCode: null };
    }
}

/**
 * Build an Impact deep link from the configured tracking base.
 * Coupon code is embedded inside the encoded target URL so tracking survives.
 * Returns null when there is no valid tracking base configured.
 */
export function buildAffiliateUrl(
    directUrl: string,
    couponCode?: string | null,
    base: string = process.env.IMPACT_AFFILIATE_BASE || '',
): string | null {
    if (!base) return null;

    try {
        const parsed = new URL(base);
        if (!parsed.pathname.includes('/c/')) return null;
    } catch {
        return null;
    }

    const couponQuery = couponCode
        ? `?couponCode=${encodeURIComponent(couponCode)}`
        : '';
    const encodedTarget = encodeURIComponent(directUrl + couponQuery);
    return `${base}?u=${encodedTarget}`;
}

/**
 * Format a duration in hours into the schema string, e.g. 6 -> "6h".
 */
export function formatDuration(hours: number | null | undefined): string | null {
    if (hours === null || hours === undefined || typeof hours !== 'number') return null;
    if (!Number.isFinite(hours)) return null;
    return `${hours}h`;
}

/**
 * Parse a feed expiry value into a Date. Returns null for missing or
 * unparseable input so callers never write an invalid Date to the database.
 */
export function parseExpiry(value: string | null | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * A coupon is considered valid while its expiry is in the future.
 * A null expiry (no expiration advertised) is treated as valid.
 */
export function isCouponValid(expiresAt: Date | null, now: Date = new Date()): boolean {
    if (expiresAt === null) return true;
    return expiresAt.getTime() > now.getTime();
}