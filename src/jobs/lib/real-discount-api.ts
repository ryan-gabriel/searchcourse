/**
 * Parser for the real.discount course feed API
 * (`https://cdn.real.discount/api/courses`).
 *
 * The API serves a paginated JSON catalog of course deals across many
 * stores. Udemy rows carry the full coupon URL (`?couponCode=...`),
 * prices, and description HTML. Sponsored/ad rows (`type: "ad"`,
 * `store: "Sponsored"`) are interleaved and must be dropped.
 *
 * Kept free of HTTP/Prisma imports so the mapping can be unit-tested.
 */
import type { UdemyFeedItem } from './pipeline';
import { decodeEntities, extractCourseSlug } from './scrape-utils';

export interface RealDiscountCourse {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    price?: unknown;
    sale_price?: unknown;
    sale_start?: unknown;
    lectures?: unknown;
    views?: unknown;
    rating?: unknown;
    image?: unknown;
    url?: unknown;
    store?: unknown;
    type?: unknown;
    slug?: unknown;
    category?: unknown;
    subcategory?: unknown;
    language?: unknown;
}

function cleanString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : null;
}

function toFiniteNumber(value: unknown): number | null {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(num) ? num : null;
}

/**
 * Strip tags from description HTML and collapse whitespace.
 * Returns null when nothing but whitespace survives.
 */
export function stripDescriptionHtml(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const text = decodeEntities(value.replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > 0 ? text : null;
}

/**
 * "2026-10-29 06:09:33" (no timezone, treated as UTC) -> ISO string.
 * Returns null for missing or unparseable input.
 */
export function normalizeSaleStart(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const iso = value.trim().replace(' ', 'T');
    const date = new Date(/^\d{4}-\d{2}-\d{2}T/.test(iso) ? `${iso}Z` : iso);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildCouponUrl(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl);
        const isUdemyCourse =
            /(^|\.)udemy\.com$/i.test(url.hostname) &&
            /^\/course\/[^/]+/i.test(url.pathname);
        if (!isUdemyCourse) return null;
        if (!url.searchParams.get('couponCode')) return null;
        return url.toString();
    } catch {
        return null;
    }
}

export function mapRealDiscountCourse(
    course: RealDiscountCourse
): UdemyFeedItem | null {
    const store = cleanString(course.store);
    const type = cleanString(course.type);
    if (!store || store.toLowerCase() !== 'udemy') return null;
    if (type && type !== 'external') return null;

    const rawUrl = cleanString(course.url);
    const coupon = rawUrl ? buildCouponUrl(rawUrl) : null;
    if (!coupon) return null;

    const externalId = extractCourseSlug(coupon);
    const title = cleanString(course.name);
    if (!externalId || !title) return null;

    const price = toFiniteNumber(course.price);
    const salePrice = toFiniteNumber(course.sale_price);
    // Without an advertised sale price we cannot tell whether the deal is
    // still 100% off — skip rather than mislabel the row as free.
    if (salePrice === null) return null;
    const isFree = salePrice === 0;
    const discountPercent =
        price !== null && salePrice !== null && price > 0 && salePrice < price
            ? Math.round((1 - salePrice / price) * 100)
            : null;

    const rating = toFiniteNumber(course.rating);
    const savedtime = normalizeSaleStart(course.sale_start);

    const item: UdemyFeedItem = {
        id: externalId,
        title,
        coupon,
        coupon_price: String(salePrice),
        discount_percent: isFree ? 100 : (discountPercent ?? undefined),
        platform: 'Udemy',
        savedtime: savedtime ?? new Date().toISOString(),
        source: 'scraped:real-discount',
    };

    if (price !== null && price > 0) item.org_price = String(price);

    const pic = cleanString(course.image);
    if (pic) item.pic = pic;

    const category = cleanString(course.category);
    if (category) item.category = category;

    const language = cleanString(course.language);
    if (language) item.language = language.toLowerCase();

    const descText = stripDescriptionHtml(course.description);
    if (descText) item.desc_text = descText;

    if (rating !== null && rating > 0) item.rating = rating;

    return item;
}

export function parseRealDiscountFeed(payload: unknown): UdemyFeedItem[] {
    const items = (payload as { items?: unknown })?.items;
    if (!Array.isArray(items)) return [];

    const mapped: UdemyFeedItem[] = [];
    const seen = new Set<string>();
    for (const entry of items) {
        if (!entry || typeof entry !== 'object') continue;
        const item = mapRealDiscountCourse(entry as RealDiscountCourse);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        mapped.push(item);
    }
    return mapped;
}
