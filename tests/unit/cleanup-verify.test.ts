import { describe, it, expect } from "vitest";
import { applyVerdict } from "@/jobs/lib/applyVerdict";

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