import { describe, it, expect } from "vitest";
import {
    normalizeRating,
    normalizeCount,
    normalizeObjectives,
    buildEnrichmentData,
} from "@/jobs/lib/enrichment";
import type { UdemyFeedItem } from "@/jobs/lib/pipeline";

function baseItem(overrides: Partial<UdemyFeedItem> = {}): UdemyFeedItem {
    return {
        id: "some-course",
        title: "Some Course",
        coupon: "https://www.udemy.com/course/some-course/?couponCode=CODE",
        ...overrides,
    };
}

describe("normalizeRating", () => {
    it("keeps a valid rating as-is", () => {
        expect(normalizeRating(4.7)).toBe(4.7);
    });

    it("rounds to one decimal place", () => {
        expect(normalizeRating(4.66)).toBe(4.7);
    });

    it("clamps out-of-range ratings to 0-5", () => {
        expect(normalizeRating(7)).toBe(5);
        expect(normalizeRating(-1)).toBe(0);
    });

    it("returns null for missing or non-numeric input", () => {
        expect(normalizeRating(null)).toBeNull();
        expect(normalizeRating(undefined)).toBeNull();
        expect(normalizeRating("good")).toBeNull();
        expect(normalizeRating(NaN)).toBeNull();
    });
});

describe("normalizeCount", () => {
    it("truncates to an integer", () => {
        expect(normalizeCount(1029)).toBe(1029);
        expect(normalizeCount(4.9)).toBe(4);
    });

    it("returns null for missing, negative, or non-numeric input", () => {
        expect(normalizeCount(null)).toBeNull();
        expect(normalizeCount(undefined)).toBeNull();
        expect(normalizeCount(-5)).toBeNull();
        expect(normalizeCount("many")).toBeNull();
    });
});

describe("normalizeObjectives", () => {
    it("trims entries and drops empties", () => {
        expect(normalizeObjectives(["  Learn X  ", "", "  ", "Learn Y"])).toEqual([
            "Learn X",
            "Learn Y",
        ]);
    });

    it("returns an empty array for missing or non-array input", () => {
        expect(normalizeObjectives(undefined)).toEqual([]);
        expect(normalizeObjectives(null)).toEqual([]);
        expect(normalizeObjectives("Learn X")).toEqual([]);
    });
});

describe("buildEnrichmentData", () => {
    it("maps enriched fields from a feed item", () => {
        const data = buildEnrichmentData(
            baseItem({
                instructor_name: "  Jane Doe  ",
                headline: "Learn everything",
                desc_text: "Full description here.",
                rating: 4.66,
                rating_count: 147,
                students_count: 1029,
                duration: "17h 4m 13s",
            })
        );

        expect(data).toEqual({
            instructorName: "Jane Doe",
            headline: "Learn everything",
            description: "Full description here.",
            rating: 4.7,
            reviewCount: 147,
            studentCount: 1029,
            duration: "17h 4m",
        });
    });

    it("omits absent fields so updates never null out existing data", () => {
        expect(buildEnrichmentData(baseItem())).toEqual({});
    });

    it("omits blank strings and invalid numbers", () => {
        const data = buildEnrichmentData(
            baseItem({
                instructor_name: "   ",
                rating: "great" as unknown as number,
                students_count: -3,
            })
        );

        expect(data).toEqual({});
        expect("instructorName" in data).toBe(false);
        expect("rating" in data).toBe(false);
        expect("studentCount" in data).toBe(false);
    });
});
