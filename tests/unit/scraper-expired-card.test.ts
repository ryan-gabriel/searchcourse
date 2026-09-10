import { describe, it, expect } from "vitest";
import { isTutorialbarCardExpired } from "@/jobs/scrapers/tutorialbar";
import { isDiscudemyCardExpired } from "@/jobs/scrapers/discudemy";

describe("isTutorialbarCardExpired (expired badge skip)", () => {
    it("flags a card with the 'Deal Expired' badge", () => {
        expect(isTutorialbarCardExpired("Python Course $84.99 Free Get Coupon Deal Expired")).toBe(true);
    });

    it("flags a card with 'Deal Ended'", () => {
        expect(isTutorialbarCardExpired("Google Cloud Practice Tests IT & Software Deal Ended")).toBe(true);
    });

    it("accepts a live card", () => {
        expect(isTutorialbarCardExpired("Revenue Operations $84.99 Free Get Coupon")).toBe(false);
    });

    it("accepts a card with unrelated 'Expired' word form (e.g. 'expiration')", () => {
        expect(isTutorialbarCardExpired("Course with expiration date info $84.99 Free Get Coupon")).toBe(false);
    });
});

describe("isDiscudemyCardExpired (expired marker skip)", () => {
    it("flags a card containing 'Expired'", () => {
        expect(isDiscudemyCardExpired("$199->$0 Expired")).toBe(true);
    });

    it("flags a card containing 'Ended'", () => {
        expect(isDiscudemyCardExpired("Today $199->$0 Ended")).toBe(true);
    });

    it("accepts a live card", () => {
        expect(isDiscudemyCardExpired("Today $199->$0 English Business")).toBe(false);
    });
});