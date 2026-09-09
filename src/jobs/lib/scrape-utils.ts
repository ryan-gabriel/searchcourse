const UDEMY_COURSE_URL =
    /https?:\/\/(?:www\.)?udemy\.com\/course\/[^"')\s<>]+/i;

export function findUdemyCouponUrl(
    html: string | null | undefined
): string | null {
    if (!html) return null;
    const match = html.match(UDEMY_COURSE_URL);
    return match ? match[0] : null;
}

export function extractCourseSlug(
    couponUrl: string | null | undefined
): string | null {
    if (!couponUrl) return null;
    try {
        const url = new URL(couponUrl);
        const match = url.pathname.match(/^\/course\/([^/]+)\/?$/);
        if (!match) return null;
        const slug = match[1];
        return slug ? decodeURIComponent(slug) : null;
    } catch {
        return null;
    }
}

export interface DeriveCouponParams {
    originalPrice: number;
    couponPrice: number | null;
    discountPercent: number | null;
}

export interface DerivedCoupon {
    discountValue: number;
    finalPrice: number;
    isFree: boolean;
}

function clampPercent(value: number | null | undefined): number | null {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return null;
    }
    return Math.min(100, Math.max(0, value));
}

export function deriveCoupon({
    originalPrice,
    couponPrice,
    discountPercent,
}: DeriveCouponParams): DerivedCoupon {
    const percent = clampPercent(discountPercent);
    const price =
        couponPrice !== null &&
        couponPrice !== undefined &&
        Number.isFinite(couponPrice) &&
        couponPrice >= 0
            ? couponPrice
            : null;

    if (price === 0 || percent === 100) {
        return { discountValue: 100, finalPrice: 0, isFree: true };
    }

    if (price !== null && price > 0) {
        if (percent !== null && percent > 0) {
            return { discountValue: percent, finalPrice: price, isFree: false };
        }
        if (originalPrice > price) {
            return {
                discountValue: Math.round((1 - price / originalPrice) * 100),
                finalPrice: price,
                isFree: false,
            };
        }
        return { discountValue: 0, finalPrice: price, isFree: false };
    }

    if (percent !== null && percent > 0 && originalPrice > 0) {
        const finalPrice = Math.max(
            0,
            Math.round((originalPrice * (100 - percent)) / 100)
        );
        return { discountValue: percent, finalPrice, isFree: finalPrice === 0 };
    }

    return { discountValue: 100, finalPrice: 0, isFree: true };
}