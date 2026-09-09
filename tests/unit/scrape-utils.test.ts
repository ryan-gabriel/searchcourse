import { describe, it, expect } from "vitest";
import {
    findUdemyCouponUrl,
    extractCourseSlug,
    deriveCoupon,
} from "@/jobs/lib/scrape-utils";

describe("findUdemyCouponUrl", () => {
    it("extracts a Udemy course URL with couponCode from HTML", () => {
        const html =
            '<a class="coupon" href="https://www.udemy.com/course/php-web/?couponCode=CODE">Get Coupon</a>';
        expect(findUdemyCouponUrl(html)).toBe(
            "https://www.udemy.com/course/php-web/?couponCode=CODE"
        );
    });

    it("extracts a Udemy course URL without couponCode", () => {
        const html =
            '<a href="https://www.udemy.com/course/php-web/">Course</a>';
        expect(findUdemyCouponUrl(html)).toBe(
            "https://www.udemy.com/course/php-web/"
        );
    });

    it("returns the first match when multiple links exist", () => {
        const html =
            '<a href="https://www.udemy.com/course/one/?couponCode=A">a</a>' +
            '<a href="https://www.udemy.com/course/two/?couponCode=B">b</a>';
        expect(findUdemyCouponUrl(html)).toBe(
            "https://www.udemy.com/course/one/?couponCode=A"
        );
    });

    it("returns null when no Udemy course URL is present", () => {
        expect(findUdemyCouponUrl("<p>no links here</p>")).toBeNull();
        expect(findUdemyCouponUrl(null)).toBeNull();
        expect(findUdemyCouponUrl(undefined)).toBeNull();
    });

    it("does not match non-course Udemy pages", () => {
        const html = '<a href="https://www.udemy.com/">Home</a>';
        expect(findUdemyCouponUrl(html)).toBeNull();
    });
});

describe("extractCourseSlug", () => {
    it("parses the slug from a Udemy course URL", () => {
        expect(
            extractCourseSlug(
                "https://www.udemy.com/course/php-web/?couponCode=CODE"
            )
        ).toBe("php-web");
    });

    it("parses the slug from a bare course URL", () => {
        expect(
            extractCourseSlug("https://www.udemy.com/course/php-web/")
        ).toBe("php-web");
    });

    it("decodes URL-encoded slugs", () => {
        expect(
            extractCourseSlug(
                "https://www.udemy.com/course/react%20patterns/?couponCode=C"
            )
        ).toBe("react patterns");
    });

    it("returns null for non-course URLs", () => {
        expect(extractCourseSlug("https://www.udemy.com/")).toBeNull();
        expect(extractCourseSlug("https://www.udemy.com/course/")).toBeNull();
        expect(extractCourseSlug("not-a-url")).toBeNull();
        expect(extractCourseSlug(null)).toBeNull();
    });
});

describe("deriveCoupon", () => {
    it("treats a $0 coupon price as free (100% off)", () => {
        expect(
            deriveCoupon({ originalPrice: 99.99, couponPrice: 0, discountPercent: null })
        ).toEqual({ discountValue: 100, finalPrice: 0, isFree: true });
    });

    it("treats an explicit 100% discount as free", () => {
        expect(
            deriveCoupon({ originalPrice: 49.99, couponPrice: null, discountPercent: 100 })
        ).toEqual({ discountValue: 100, finalPrice: 0, isFree: true });
    });

    it("derives the discount percent from original vs coupon price", () => {
        expect(
            deriveCoupon({
                originalPrice: 99.99,
                couponPrice: 9.99,
                discountPercent: null,
            })
        ).toEqual({ discountValue: 90, finalPrice: 9.99, isFree: false });
    });

    it("prefers the explicit percent but keeps the coupon price", () => {
        expect(
            deriveCoupon({
                originalPrice: 199.99,
                couponPrice: 12.99,
                discountPercent: 94,
            })
        ).toEqual({ discountValue: 94, finalPrice: 12.99, isFree: false });
    });

    it("computes the final price from a percent when no coupon price is given", () => {
        expect(
            deriveCoupon({
                originalPrice: 99.99,
                couponPrice: null,
                discountPercent: 90,
            })
        ).toEqual({ discountValue: 90, finalPrice: 10, isFree: false });
    });

    it("defaults to free when nothing is known about the discount", () => {
        expect(
            deriveCoupon({ originalPrice: 0, couponPrice: null, discountPercent: null })
        ).toEqual({ discountValue: 100, finalPrice: 0, isFree: true });
    });

    it("treats a coupon price equal to or above the original as no discount", () => {
        expect(
            deriveCoupon({
                originalPrice: 19.99,
                couponPrice: 19.99,
                discountPercent: null,
            })
        ).toEqual({ discountValue: 0, finalPrice: 19.99, isFree: false });
    });

    it("treats a 100% discount with a lingering coupon price as free", () => {
        expect(
            deriveCoupon({
                originalPrice: 99.99,
                couponPrice: 9.99,
                discountPercent: 100,
            })
        ).toEqual({ discountValue: 100, finalPrice: 0, isFree: true });
    });
});