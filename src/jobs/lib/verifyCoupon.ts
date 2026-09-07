/**
 * Pure verification logic for Udemy coupons.
 * Kept free of Prisma and Playwright so it can be unit-tested. The browser
 * boundary (`FetchUdemyStateFn`) is injectable; classification stays pure.
 */

export type CouponStatus = "VALID" | "INVALID" | "UNDETERMINED";

export interface CouponVerdict {
    status: CouponStatus;
    price: number | null;
    evidence: string[];
    blocked: boolean;
}

export interface ProbeSnapshot {
    loaded: boolean;
    blocked: boolean;
    prices: string[];
    bannerText: string | null;
    bodySnippet: string;
}

export type FetchUdemyStateFn = (url: string) => Promise<ProbeSnapshot>;

const INVALID_SIGNALS = [
    /discount code has expired/i,
    /discount code is not valid/i,
    /discount code is no longer valid/i,
    /discount code is sold out/i,
    /discount code is expired/i,
    /coupon.{0,60}(invalid|expired|no longer available|sold out)/i,
];

function parsePriceToken(token: string): number | null {
    const match = token.match(/([\d.,]+)/);
    if (!match) return null;
    const cleaned = match[1].replace(/,/g, "");
    const value = Number.parseFloat(cleaned);
    return Number.isNaN(value) ? null : value;
}

function isZeroPriceToken(token: string): boolean {
    if (/\bfree\b/i.test(token)) return true;
    const value = parsePriceToken(token);
    return value !== null && value === 0;
}

function isDefinitePriceToken(token: string): boolean {
    return parsePriceToken(token) !== null && !/\bfree\b/i.test(token);
}

/**
 * Turn a captured DOM snapshot into a verdict signal.
 * Returns undefined when there is not enough signal to decide.
 */
export function classifySnapshot(snapshot: ProbeSnapshot): CouponStatus {
    if (snapshot.blocked || !snapshot.loaded) return "UNDETERMINED";

    const banner = snapshot.bannerText ? snapshot.bannerText.trim() : "";
    const text = [banner, ...snapshot.prices, snapshot.bodySnippet]
        .join(" ")
        .trim();

    if (!text) return "UNDETERMINED";

    if (INVALID_SIGNALS.some((re) => re.test(text))) return "INVALID";

    const bannerApplied =
        banner.length > 0 && /applied|off|coupon|discount|free/i.test(banner);
    if (bannerApplied) return "VALID";

    if (snapshot.prices.some((p) => isZeroPriceToken(p))) return "VALID";

    // All extracted prices are nonzero -> the coupon is not applied.
    if (snapshot.prices.length > 0 && snapshot.prices.every((p) => isDefinitePriceToken(p))) {
        return "INVALID";
    }

    return "UNDETERMINED";
}

function buildVerdict(status: CouponStatus, snapshot: ProbeSnapshot): CouponVerdict {
    const evidence: string[] = [];
    if (snapshot.blocked) evidence.push("page blocked by bot protection");
    if (!snapshot.loaded) evidence.push("buy-box never loaded");
    if (snapshot.bannerText) evidence.push(`banner: ${snapshot.bannerText.trim()}`);
    if (snapshot.prices.length) evidence.push(`prices: ${snapshot.prices.join(", ")}`);
    for (const re of INVALID_SIGNALS) {
        const match = snapshot.bodySnippet.match(re);
        if (match) {
            evidence.push(`invalid signal: "${match[0].trim()}"`);
            break;
        }
    }

    const priceTokens = snapshot.prices.filter(isDefinitePriceToken);
    const price =
        snapshot.prices.length > 0 && snapshot.prices.every((p) => isZeroPriceToken(p))
            ? 0
            : priceTokens.length > 0
                ? parsePriceToken(priceTokens[0])
                : null;

    return { status, price, evidence, blocked: snapshot.blocked };
}

export async function verifyCoupon(
    url: string,
    opts: { fetchState?: FetchUdemyStateFn } = {},
): Promise<CouponVerdict> {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid coupon URL: ${url}`);
    }
    if (!/^https?:$/.test(parsed.protocol)) {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }
    if (!parsed.hostname.endsWith("udemy.com") || !parsed.pathname.startsWith("/course/")) {
        throw new Error(`Not a Udemy course URL: ${url}`);
    }

    const { fetchState } = opts;
    if (!fetchState) {
        throw new Error("fetchState is required");
    }

    const snapshot = await fetchState(url);
    const status = classifySnapshot(snapshot);
    return buildVerdict(status, snapshot);
}