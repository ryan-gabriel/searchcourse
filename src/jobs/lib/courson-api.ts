/**
 * Parser for the courson.xyz coupon feed
 * (`POST https://courson.xyz/load-more-coupons`, body `{filters, offset}`,
 * also embedded as `<script id="initial-coupons-data">` on /coupons).
 *
 * Each row is a cached Udemy course record plus the live instructor coupon:
 * `id_name` (course slug), `coupon_code`, prices, ratings, description
 * HTML, objectives, and category fields. Only `Live` rows with a coupon
 * code are mapped.
 *
 * Kept free of HTTP/Prisma imports so the mapping can be unit-tested.
 */
import type { UdemyFeedItem } from './pipeline';
import { decodeEntities, extractCourseSlug } from './scrape-utils';
import { stripDescriptionHtml } from './real-discount-api';

export interface CoursonCoupon {
    id?: unknown;
    id_name?: unknown;
    title?: unknown;
    headline?: unknown;
    description?: unknown;
    coupon_code?: unknown;
    coupon_discount_percent?: unknown;
    status_label?: unknown;
    campaign_type?: unknown;
    image?: unknown;
    image_hq?: unknown;
    primary_category?: unknown;
    language?: unknown;
    rating?: unknown;
    num_reviews?: unknown;
    num_subscribers?: unknown;
    content_info_short?: unknown;
    instructors?: unknown;
    objectives?: unknown;
    created_date?: unknown;
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
 * courson's `instructors` array holds single-entry objects like
 * [{"James Joab Soren": "https://www.udemy.com/user/..."}].
 */
export function firstInstructorName(value: unknown): string | null {
    if (!Array.isArray(value)) return null;
    for (const entry of value) {
        if (typeof entry === 'string') {
            const name = entry.trim();
            if (name) return name;
            continue;
        }
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            for (const key of Object.keys(entry)) {
                const name = key.trim();
                if (name) return name;
            }
        }
    }
    return null;
}

export function buildCoursonCouponUrl(
    slug: string,
    code: string
): string | null {
    const candidate = `https://www.udemy.com/course/${encodeURIComponent(
        slug
    )}/?couponCode=${encodeURIComponent(code)}`;
    return extractCourseSlug(candidate) ? candidate : null;
}

export function mapCoursonCoupon(
    coupon: CoursonCoupon
): UdemyFeedItem | null {
    const status = cleanString(coupon.status_label);
    if (status && status.toLowerCase() !== 'live') return null;

    // The feed is 100%-off instructor coupons; partial discounts would
    // misprice the course downstream, so skip them.
    const discountPercent = toFiniteNumber(coupon.coupon_discount_percent);
    if (discountPercent !== null && discountPercent < 100) return null;

    const slug = cleanString(coupon.id_name);
    const code = cleanString(coupon.coupon_code);
    const title = cleanString(coupon.title);
    if (!slug || !code || !title) return null;

    const couponUrl = buildCoursonCouponUrl(slug, code);
    const externalId = couponUrl ? extractCourseSlug(couponUrl) : null;
    if (!couponUrl || !externalId) return null;

    const pic = cleanString(coupon.image_hq) || cleanString(coupon.image);
    const created = cleanString(coupon.created_date);
    const createdDate = created ? new Date(created) : null;

    const item: UdemyFeedItem = {
        id: externalId,
        title,
        coupon: couponUrl,
        coupon_price: 0,
        discount_percent: 100,
        platform: 'Udemy',
        savedtime:
            createdDate && !Number.isNaN(createdDate.getTime())
                ? createdDate.toISOString()
                : new Date().toISOString(),
        source: 'scraped:courson',
    };

    if (pic) item.pic = pic;

    const category = cleanString(coupon.primary_category);
    if (category) item.category = category;

    const language = cleanString(coupon.language);
    if (language) item.language = language.toLowerCase();

    const headline = cleanString(coupon.headline);
    if (headline) item.headline = headline;

    const descText = stripDescriptionHtml(coupon.description);
    if (descText) item.desc_text = descText;

    const instructor = firstInstructorName(coupon.instructors);
    if (instructor) item.instructor_name = instructor;

    const duration = cleanString(coupon.content_info_short);
    if (duration) item.duration = duration;

    const rating = toFiniteNumber(coupon.rating);
    if (rating !== null && rating > 0) item.rating = rating;

    const reviews = toFiniteNumber(coupon.num_reviews);
    if (reviews !== null && reviews > 0) item.rating_count = Math.trunc(reviews);

    const students = toFiniteNumber(coupon.num_subscribers);
    if (students !== null && students > 0) {
        item.students_count = Math.trunc(students);
    }

    if (Array.isArray(coupon.objectives) && coupon.objectives.length > 0) {
        item.objectives = coupon.objectives.filter(
            (entry): entry is string => typeof entry === 'string'
        );
    }

    return item;
}

export function parseCoursonFeed(payload: unknown): UdemyFeedItem[] {
    const coupons = (payload as { coupons?: unknown })?.coupons;
    if (!Array.isArray(coupons)) return [];

    const mapped: UdemyFeedItem[] = [];
    const seen = new Set<string>();
    for (const entry of coupons) {
        if (!entry || typeof entry !== 'object') continue;
        const item = mapCoursonCoupon(entry as CoursonCoupon);
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        mapped.push(item);
    }
    return mapped;
}

/**
 * Decode the `<script id="initial-coupons-data">` blob embedded on the
 * /coupons listing page: `[pageOfCoupons, totalCount, ...]` with one
 * nested array per already-rendered page.
 */
export function parseCoursonInitialData(html: string): CoursonCoupon[] {
    const match = html.match(
        /<script id="initial-coupons-data" type="application\/json">([\s\S]*?)<\/script>/i
    );
    if (!match) return [];
    try {
        const parsed: unknown = JSON.parse(
            decodeEntities(match[1]).replace(/[\u0000-\u001F]/g, ' ')
        );
        if (!Array.isArray(parsed)) return [];
        return parsed
            .flat(2)
            .filter(
                (entry): entry is CoursonCoupon =>
                    !!entry && typeof entry === 'object' && !Array.isArray(entry)
            );
    } catch {
        return [];
    }
}
