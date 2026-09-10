const UDEMY_COURSE_URL =
    /https?:\/\/(?:www\.)?udemy\.com\/course\/[^"')\s<>]+/i;

/**
 * Decode common HTML entities in scraped text.
 */
export function decodeEntities(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0*39;|&#x0*27;/gi, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, code: string) =>
            String.fromCharCode(parseInt(code, 10))
        )
        .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
            String.fromCharCode(parseInt(code, 16))
        );
}

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

/**
 * Extract the full course description from a couponami.com post page.
 *
 * Prefers the article body: the paragraphs following a Description
 * heading (`<p><strong>Description</strong></p>` or `<h2>Description</h2>`).
 * Falls back to the `<meta name="description">` content when no heading
 * is present. Returns null when neither is found.
 */
export function extractCouponamiDescription(
    html: string | null | undefined
): string | null {
    if (!html) return null;

    const marker = html.match(
        /<p>\s*<strong>\s*Description\s*<\/strong>\s*<\/p>|<h[12][^>]*>\s*Description\s*<\/h[12]>/i
    );
    if (marker && marker.index !== undefined) {
        // Walk the tags after the heading: collect <p> text, silently skip
        // container/formatting tags, and stop at the first structural tag
        // (lists, ads, scripts, links, sub-headings, ...).
        const ignored = new Set([
            'div',
            'section',
            'article',
            'span',
            'strong',
            'em',
            'b',
            'i',
            'u',
            'small',
            'br',
            'hr',
            'img',
            'wbr',
            'li',
        ]);
        const paragraphs: string[] = [];
        const rest = html.slice(marker.index + marker[0].length);
        const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        let match: RegExpExecArray | null;
        let stopped = false;
        while (!stopped && (match = tagPattern.exec(rest)) !== null) {
            const tag = match[1].toLowerCase();
            const isClose = match[0].startsWith('</');
            if (tag === 'p' && !isClose) {
                const closeIdx = rest.indexOf('</p>', tagPattern.lastIndex);
                if (closeIdx === -1) break;
                const text = decodeEntities(
                    rest
                        .slice(tagPattern.lastIndex, closeIdx)
                        .replace(/<[^>]+>/g, '')
                        .replace(/\s+/g, ' ')
                        .trim()
                );
                if (text.length > 0) paragraphs.push(text);
                tagPattern.lastIndex = closeIdx + 4;
            } else if (!isClose && !ignored.has(tag)) {
                stopped = true;
            }
        }
        if (paragraphs.length > 0) return paragraphs.join('\n\n');
    }

    const meta = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']\s*\/?>/i
    );
    if (meta) {
        const text = decodeEntities(meta[1].replace(/\s+/g, ' ').trim());
        if (text.length > 0) return text;
    }
    return null;
}