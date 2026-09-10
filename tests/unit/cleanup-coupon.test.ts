import { describe, it, expect } from "vitest";
import {
    isStaleScrapedCoupon,
    staleScrapedCouponWhere,
} from "@/jobs/lib/cleanup-utils";
import { CLEANUP, TIME } from "@/lib/constants";

const NOW = new Date("2026-09-07T00:00:00.000Z");
const HOUR = TIME.ONE_HOUR_MS;

function hoursAgo(hours: number): Date {
    return new Date(NOW.getTime() - hours * HOUR);
}

describe("isStaleScrapedCoupon (row predicate)", () => {
    it("deletes a scraped coupon unverified for 73h", () => {
        expect(
            isStaleScrapedCoupon(
                { source: "scraped:discudemy", expiresAt: null, verifiedAt: hoursAgo(73) },
                cutoffHoursAgo(72)
            )
        ).toBe(true);
    });

    it("keeps a scraped coupon unverified for 71h", () => {
        expect(
            isStaleScrapedCoupon(
                { source: "scraped:tutorialbar", expiresAt: null, verifiedAt: hoursAgo(71) },
                cutoffHoursAgo(72)
            )
        ).toBe(false);
    });

    it("keeps a coupon with a declared expiry no matter how stale", () => {
        expect(
            isStaleScrapedCoupon(
                { source: "scraped:discudemy", expiresAt: new Date("2030-01-01"), verifiedAt: hoursAgo(200) },
                cutoffHoursAgo(72)
            )
        ).toBe(false);
    });

    it("never deletes a non-scraped coupon, at any age", () => {
        expect(
            isStaleScrapedCoupon(
                { source: "Manual", expiresAt: null, verifiedAt: hoursAgo(300) },
                cutoffHoursAgo(72)
            )
        ).toBe(false);
    });

    it("never deletes a coupon with unknown source or missing verifiedAt", () => {
        expect(
            isStaleScrapedCoupon(
                { source: null, expiresAt: null, verifiedAt: hoursAgo(100) },
                cutoffHoursAgo(72)
            )
        ).toBe(false);
        expect(
            isStaleScrapedCoupon(
                { source: "scraped:discudemy", expiresAt: null, verifiedAt: null },
                cutoffHoursAgo(72)
            )
        ).toBe(false);
    });
});

describe("staleScrapedCouponWhere (bulk delete clause)", () => {
    const cutoff = new Date("2026-09-04T00:00:00.000Z");

    it("scopes to scraped sources with a null expiry and verifiedAt before the cutoff", () => {
        expect(staleScrapedCouponWhere(cutoff)).toEqual({
            source: { startsWith: "scraped:" },
            expiresAt: null,
            verifiedAt: { lt: cutoff },
        });
    });

    it("uses the configured 72h retention as the cutoff", () => {
        expect(CLEANUP.STALE_COUPON_DELETE_AFTER_HOURS).toBe(72);
        const expectedCutoff = new Date(NOW.getTime() - 72 * HOUR);
        expect(staleScrapedCouponWhere(expectedCutoff).verifiedAt.lt).toBe(expectedCutoff);
    });
});

function cutoffHoursAgo(hours: number): Date {
    return hoursAgo(hours);
}