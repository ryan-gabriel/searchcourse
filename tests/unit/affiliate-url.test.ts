import { describe, it, expect } from "vitest";
import {
    parsePrice,
    extractCoupon,
    buildAffiliateUrl,
    formatDuration,
} from "@/jobs/lib/affiliate";

const TRK_BASE = "https://trk.udemy.com/c/6990444/3193860/39854";

describe("parsePrice", () => {
    it("parses a dollar-prefixed price", () => {
        expect(parsePrice("$9.99")).toBe(9.99);
    });

    it("parses a plain numeric string", () => {
        expect(parsePrice("9.99")).toBe(9.99);
    });

    it("returns 0 for empty/missing input", () => {
        expect(parsePrice(undefined)).toBe(0);
        expect(parsePrice(null)).toBe(0);
        expect(parsePrice("")).toBe(0);
    });

    it("returns 0 for unparseable input", () => {
        expect(parsePrice("free")).toBe(0);
    });
});

describe("extractCoupon", () => {
    it("splits couponCode out of the Udemy URL", () => {
        const { directUrl, couponCode } = extractCoupon(
            "https://www.udemy.com/course/php-web/?couponCode=CODE"
        );
        expect(directUrl).toBe("https://www.udemy.com/course/php-web/");
        expect(couponCode).toBe("CODE");
    });

    it("preserves other query params but drops couponCode", () => {
        const { directUrl } = extractCoupon(
            "https://www.udemy.com/course/php-web/?ref=abc&couponCode=CODE"
        );
        expect(directUrl).toBe("https://www.udemy.com/course/php-web/?ref=abc");
    });

    it("returns null couponCode when the URL has none", () => {
        const { directUrl, couponCode } = extractCoupon(
            "https://www.udemy.com/course/php-web/"
        );
        expect(directUrl).toBe("https://www.udemy.com/course/php-web/");
        expect(couponCode).toBeNull();
    });

    it("falls back to the raw string on unparseable input", () => {
        const { directUrl, couponCode } = extractCoupon("not-a-url");
        expect(directUrl).toBe("not-a-url");
        expect(couponCode).toBeNull();
    });
});

describe("buildAffiliateUrl", () => {
    it("builds a tracking deep link with the coupon embedded", () => {
        const url = buildAffiliateUrl(
            "https://www.udemy.com/course/php-web/",
            "CODE",
            TRK_BASE
        );
        expect(url?.startsWith(`${TRK_BASE}?u=`)).toBe(true);

        const encodedTarget = decodeURIComponent(url!.split("u=")[1]);
        expect(encodedTarget).toBe(
            "https://www.udemy.com/course/php-web/?couponCode=CODE"
        );
    });

    it("builds a link without coupon when none is provided", () => {
        const url = buildAffiliateUrl(
            "https://www.udemy.com/course/php-web/",
            null,
            TRK_BASE
        );
        expect(decodeURIComponent(url!.split("u=")[1])).toBe(
            "https://www.udemy.com/course/php-web/"
        );
    });

    it("returns null when no base is configured", () => {
        expect(buildAffiliateUrl("https://www.udemy.com/course/php-web/", "CODE", "")).toBeNull();
    });

    it("returns null when the base is not a /c/ deep link", () => {
        expect(
            buildAffiliateUrl("https://www.udemy.com/course/php-web/", "CODE", "https://impact.example.com/click")
        ).toBeNull();
    });

    it("returns null when the base is not a valid URL", () => {
        expect(buildAffiliateUrl("https://www.udemy.com/course/php-web/", "CODE", "not-a-url")).toBeNull();
    });
});

describe("formatDuration", () => {
    it("formats whole hours", () => {
        expect(formatDuration(6)).toBe("6h");
    });

    it("returns null for missing/invalid input", () => {
        expect(formatDuration(null)).toBeNull();
        expect(formatDuration(undefined)).toBeNull();
        expect(formatDuration(NaN)).toBeNull();
    });
});