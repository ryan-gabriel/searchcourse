import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
    parseTutorialbarPost,
    mergePostDetails,
    type TutorialbarPostDetails,
} from "@/jobs/lib/tutorialbar-post";
import type { UdemyFeedItem } from "@/jobs/lib/pipeline";

const SLUG =
    "claude-certified-associate-foundations-ccao-f-practice-exam";

let fixtureHtml: string;

beforeAll(() => {
    fixtureHtml = readFileSync(
        join(__dirname, "..", "fixtures", "tutorialbar-post.html"),
        "utf-8"
    );
});

describe("parseTutorialbarPost", () => {
    it("extracts scalar course fields from the embedded payload", () => {
        const result = parseTutorialbarPost(fixtureHtml, SLUG);

        expect(result).not.toBeNull();
        expect(result!.slug).toBe(SLUG);
        expect(result!.title).toBe(
            "Claude Certified Associate Foundations (CCAO-F) Exams 2026"
        );
        expect(result!.instructorName).toBe(
            "Narayan Banka, Appcentic - AI SaaS Growth Lab"
        );
        expect(result!.rating).toBe(4.7);
        expect(result!.ratingCount).toBe(100);
        expect(result!.studentsCount).toBe(1000);
        expect(result!.language).toBe("English");
        expect(result!.category).toBe("IT & Software");
        expect(result!.imageUrl).toBe(
            "https://img-c.udemycdn.com/course/480x270/7323655_fb5d_2.jpg"
        );
        expect(result!.couponCode).toBe("CANDY100");
        expect(result!.couponUrl).toBe(
            "https://www.udemy.com/course/claude-certified-associate-foundations-ccao-f-practice-exam/?couponCode=CANDY100"
        );
    });

    it("extracts the headline and full description", () => {
        const result = parseTutorialbarPost(fixtureHtml, SLUG);

        expect(result).not.toBeNull();
        expect(result!.headline).toContain(
            "6  Full-Length Practice Exams, 360 Realistic Questions"
        );
        expect(result!.headline).not.toContain("&amp;");
        expect(result!.description).toContain(
            "Prepare for the Claude Certified Associate"
        );
    });

    it("extracts the what-you-will-learn objectives array", () => {
        const result = parseTutorialbarPost(fixtureHtml, SLUG);

        expect(result).not.toBeNull();
        expect(result!.objectives.length).toBeGreaterThan(2);
        expect(result!.objectives[0]).toContain(
            "Master all seven official CCAO-F exam domains"
        );
    });

    it("returns null when the slug is not in the page", () => {
        expect(
            parseTutorialbarPost(fixtureHtml, "some-course-that-does-not-exist")
        ).toBeNull();
    });

    it("returns null for empty HTML", () => {
        expect(parseTutorialbarPost("", SLUG)).toBeNull();
        expect(parseTutorialbarPost(null as unknown as string, SLUG)).toBeNull();
    });

    it("falls back to JSON-LD data when the embedded payload is missing", () => {        const html = `<!doctype html><html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://tutorialbar.com/"},{"@type":"ListItem","position":2,"name":"Fallback Course","item":"https://tutorialbar.com/course/fallback-course"}]}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Course","name":"Fallback Course","description":"Fallback description text.","provider":{"@type":"Organization","name":"Udemy"},"instructor":{"@type":"Person","name":"Jane Doe"},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"aggregateRating":{"@type":"AggregateRating","ratingValue":4.5,"ratingCount":42},"hasCourseInstance":{"@type":"CourseInstance","courseMode":"online","inLanguage":"English"}}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Fallback Course","image":"https://img-c.udemycdn.com/course/480x270/1_2.jpg"}</script>
</head><body></body></html>`;

        const result = parseTutorialbarPost(html, "fallback-course");

        expect(result).not.toBeNull();
        expect(result!.title).toBe("Fallback Course");
        expect(result!.description).toBe("Fallback description text.");
        expect(result!.instructorName).toBe("Jane Doe");
        expect(result!.rating).toBe(4.5);
        expect(result!.ratingCount).toBe(42);
        expect(result!.language).toBe("English");
        expect(result!.imageUrl).toBe(
            "https://img-c.udemycdn.com/course/480x270/1_2.jpg"
        );
        expect(result!.objectives).toEqual([]);
    });
});

describe("mergePostDetails", () => {
    const item: UdemyFeedItem = {
        id: "some-course",
        title: "Some Course",
        coupon: "https://www.udemy.com/course/some-course/?couponCode=CODE",
        org_price: "49.99",
        language: "english",
        category: "IT & Software",
    };

    const details: TutorialbarPostDetails = {
        slug: "some-course",
        title: "Some Course",
        headline: "Learn everything",
        description: "Full description here.",
        instructorName: "Jane Doe",
        rating: 4.7,
        ratingCount: 100,
        studentsCount: 1000,
        language: "English",
        duration: "17h 4m 13s",
        category: "IT & Software",
        imageUrl: "https://img-c.udemycdn.com/course/480x270/1_2.jpg",
        couponCode: "CODE",
        couponUrl:
            "https://www.udemy.com/course/some-course/?couponCode=CODE",
        objectives: ["Learn X", "Learn Y"],
    };

    it("fills enrichment fields from post details", () => {
        const merged = mergePostDetails(item, details);

        expect(merged.instructor_name).toBe("Jane Doe");
        expect(merged.headline).toBe("Learn everything");
        expect(merged.desc_text).toBe("Full description here.");
        expect(merged.rating).toBe(4.7);
        expect(merged.rating_count).toBe(100);
        expect(merged.students_count).toBe(1000);
        expect(merged.duration).toBe("17h 4m 13s");
        expect(merged.objectives).toEqual(["Learn X", "Learn Y"]);
    });

    it("keeps listing values for fields the scraper already provides", () => {
        const merged = mergePostDetails(item, details);

        expect(merged.title).toBe("Some Course");
        expect(merged.coupon).toBe(item.coupon);
        expect(merged.org_price).toBe("49.99");
        expect(merged.language).toBe("english");
        expect(merged.category).toBe("IT & Software");
    });

    it("returns the item unchanged when details are null", () => {
        expect(mergePostDetails(item, null)).toEqual(item);
    });
});
