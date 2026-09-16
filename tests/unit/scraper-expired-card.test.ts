import { describe, it, expect } from "vitest";
import { isCardExpired } from "@/jobs/lib/scrape-utils";

describe("isCardExpired", () => {
    it("flags a card with 'Deal Expired'", () => {
        expect(isCardExpired("Python Course $84.99 Free Get Coupon Deal Expired")).toBe(true);
    });

    it("flags a card with 'Deal Ended'", () => {
        expect(isCardExpired("Google Cloud Practice Tests IT & Software Deal Ended")).toBe(true);
    });

    it("flags a card containing just 'Expired'", () => {
        expect(isCardExpired("$199->$0 Expired")).toBe(true);
    });

    it("flags a card containing just 'Ended'", () => {
        expect(isCardExpired("Today $199->$0 Ended")).toBe(true);
    });

    it("accepts a live card", () => {
        expect(isCardExpired("Revenue Operations $84.99 Free Get Coupon")).toBe(false);
        expect(isCardExpired("Today $199->$0 English Business")).toBe(false);
    });

    it("accepts a card with unrelated 'expired' substring like 'expiration'", () => {
        expect(isCardExpired("Course with expiration date info $84.99 Free Get Coupon")).toBe(false);
    });
});
