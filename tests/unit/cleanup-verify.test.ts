import { describe, it, expect } from "vitest";
import { applyVerdict, nextBlockedStreak } from "@/jobs/lib/applyVerdict";

describe("applyVerdict", () => {
    it("refreshes verifiedAt on VALID", () => {
        const before = new Date("2026-01-01T00:00:00.000Z");
        const result = applyVerdict("VALID", { now: before });
        expect(result?.verifiedAt).toEqual(before);
        expect(result?.isActive).toBeUndefined();
    });

    it("deactivates on INVALID", () => {
        const result = applyVerdict("INVALID");
        expect(result).toEqual({ isActive: false });
    });

    it("returns null on UNDETERMINED so the row is untouched", () => {
        expect(applyVerdict("UNDETERMINED")).toBeNull();
    });
});

describe("nextBlockedStreak", () => {
    it("increments on a blocked verdict", () => {
        expect(nextBlockedStreak(0, true)).toBe(1);
        expect(nextBlockedStreak(2, true)).toBe(3);
    });

    it("resets to 0 on a non-blocked verdict", () => {
        expect(nextBlockedStreak(0, false)).toBe(0);
        expect(nextBlockedStreak(5, false)).toBe(0);
    });
});