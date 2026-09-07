import { describe, it, expect } from "vitest";
import { shouldBroadcastCoupon } from "@/lib/broadcastGuard";

const NOW = new Date("2026-09-07T00:00:00.000Z");
const HOUR = 3600_000;
const DAY = 24 * HOUR;

function daysFromNow(days: number): Date {
    return new Date(NOW.getTime() + days * DAY);
}

function hoursFromNow(hours: number): Date {
    return new Date(NOW.getTime() + hours * HOUR);
}

describe("shouldBroadcastCoupon (expiry guard, default 12h)", () => {
    it("accepts a far-future coupon", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: daysFromNow(5), verifiedAt: NOW, now: NOW })
        ).toBe(true);
    });

    it("rejects a coupon expiring within 12h", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: hoursFromNow(11), verifiedAt: NOW, now: NOW })
        ).toBe(false);
    });

    it("rejects at the exact 12h boundary", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: hoursFromNow(12), verifiedAt: NOW, now: NOW })
        ).toBe(false);
    });

    it("accepts a coupon expiring just beyond 12h", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: hoursFromNow(13), verifiedAt: NOW, now: NOW })
        ).toBe(true);
    });

    it("rejects an already-expired coupon", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: hoursFromNow(-1), verifiedAt: NOW, now: NOW })
        ).toBe(false);
    });

    it("honors a custom minExpiryHours", () => {
        expect(
            shouldBroadcastCoupon({
                expiresAt: hoursFromNow(8),
                verifiedAt: NOW,
                minExpiryHours: 6,
                now: NOW,
            })
        ).toBe(true);
    });

    it("accepts a coupon with no expiry", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: null, verifiedAt: NOW, now: NOW })
        ).toBe(true);
    });
});

describe("shouldBroadcastCoupon (freshness guard, default 24h)", () => {
    it("rejects a coupon whose feed snapshot is older than 24h", () => {
        expect(
            shouldBroadcastCoupon({
                expiresAt: daysFromNow(5),
                verifiedAt: hoursFromNow(-25),
                now: NOW,
            })
        ).toBe(false);
    });

    it("accepts at the exact 24h boundary", () => {
        expect(
            shouldBroadcastCoupon({
                expiresAt: daysFromNow(5),
                verifiedAt: hoursFromNow(-24),
                now: NOW,
            })
        ).toBe(true);
    });

    it("accepts a fresh snapshot even when expiry is null", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: null, verifiedAt: hoursFromNow(-2), now: NOW })
        ).toBe(true);
    });

    it("rejects a null-expiry coupon with a stale snapshot", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: null, verifiedAt: hoursFromNow(-30), now: NOW })
        ).toBe(false);
    });

    it("accepts a coupon with unknown freshness", () => {
        expect(
            shouldBroadcastCoupon({ expiresAt: daysFromNow(5), verifiedAt: null, now: NOW })
        ).toBe(true);
    });

    it("honors a custom maxVerifiedAgeHours", () => {
        expect(
            shouldBroadcastCoupon({
                expiresAt: daysFromNow(5),
                verifiedAt: hoursFromNow(-30),
                maxVerifiedAgeHours: 48,
                now: NOW,
            })
        ).toBe(true);
    });
});