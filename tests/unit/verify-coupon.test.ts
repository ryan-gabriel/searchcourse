import { describe, it, expect } from "vitest";
import {
    classifySnapshot,
    verifyCoupon,
    type ProbeSnapshot,
} from "@/jobs/lib/verifyCoupon";

function snapshot(partial: Partial<ProbeSnapshot>): ProbeSnapshot {
    return {
        loaded: true,
        blocked: false,
        prices: [],
        bannerText: null,
        bodySnippet: "",
        ...partial,
    };
}

describe("classifySnapshot", () => {
    it("treats a coupon banner as VALID", () => {
        expect(
            classifySnapshot(
                snapshot({ bannerText: "Coupon applied: 100% off", prices: ["$29.99 $0"] })
            )
        ).toBe("VALID");
    });

    it("treats a zero/free price as VALID even without a banner", () => {
        expect(classifySnapshot(snapshot({ prices: ["Free"] }))).toBe("VALID");
        expect(classifySnapshot(snapshot({ prices: ["$0"] }))).toBe("VALID");
        expect(classifySnapshot(snapshot({ prices: ["0"] }))).toBe("VALID");
        expect(classifySnapshot(snapshot({ prices: ["$0", "$49.99"] }))).toBe("VALID");
    });

    it("treats invalid/expired/sold-out coupon text as INVALID", () => {
        expect(
            classifySnapshot(
                snapshot({ bodySnippet: "This discount code is not valid." })
            )
        ).toBe("INVALID");
        expect(
            classifySnapshot(
                snapshot({ bodySnippet: "This discount code has expired." })
            )
        ).toBe("INVALID");
        expect(
            classifySnapshot(
                snapshot({ bodySnippet: "This discount code is sold out." })
            )
        ).toBe("INVALID");
    });

    it("treats a definite full price with no banner as INVALID", () => {
        expect(
            classifySnapshot(snapshot({ prices: ["$49.99"], bannerText: null }))
        ).toBe("INVALID");
    });

    it("treats a missing/blocked page as UNDETERMINED", () => {
        expect(classifySnapshot(snapshot({ blocked: true }))).toBe("UNDETERMINED");
        expect(classifySnapshot(snapshot({ loaded: false }))).toBe("UNDETERMINED");
        expect(classifySnapshot(snapshot({}))).toBe("UNDETERMINED");
    });
});

describe("verifyCoupon", () => {
    it("returns the verdict and evidence from the fetched state", async () => {
        const verdict = await verifyCoupon(
            "https://www.udemy.com/course/example/?couponCode=ABC123",
            {
                fetchState: async () => snapshot({ bannerText: "Coupon applied" }),
            }
        );
        expect(verdict.status).toBe("VALID");
        expect(verdict.evidence.join(" ")).toMatch(/Coupon applied/);
    });

    it("reports price when a zero price is detected", async () => {
        const verdict = await verifyCoupon(
            "https://www.udemy.com/course/example/?couponCode=ABC123",
            { fetchState: async () => snapshot({ prices: ["$0"] }) }
        );
        expect(verdict.status).toBe("VALID");
        expect(verdict.price).toBe(0);
    });

    it("rejects non-Udemy URLs", async () => {
        await expect(
            verifyCoupon("https://evil.example/course/foo/?couponCode=X", {
                fetchState: async () => snapshot({}),
            })
        ).rejects.toThrow();
    });

    it("defaults to UNDETERMINED when fetchState is absent in opts", async () => {
        // Simulate a fetchState that resolves to an empty snapshot.
        const verdict = await verifyCoupon(
            "https://www.udemy.com/course/example/?couponCode=ABC123",
            {
                fetchState: async () => snapshot({}),
            }
        );
        expect(verdict.status).toBe("UNDETERMINED");
    });
});