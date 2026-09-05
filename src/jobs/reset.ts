/**
 * Database Reset Script
 *
 * Deletes all course-owned data so a fresh sync can repopulate from the feed.
 * Keeps reference/curated tables: Category, Platform, Roadmap, SiteSettings.
 *
 * Deletes in dependency order (FK-safe):
 *   CourseSyllabusItem -> CourseSyllabusSection -> CourseLearningOutcome
 *   -> RoadmapStep -> ClickEvent -> Coupon -> Course
 *
 * SAFETY GUARDS (required to run):
 * - Must NOT be NODE_ENV=production (blocked by default).
 * - Must be explicitly confirmed with RESET_CONFIRM=YES.
 *
 * Environment Variables Required:
 * - DATABASE_URL
 */

import { prisma } from "@/lib/prisma";

async function main() {
    // Fail closed: never allow a wipe in production or without explicit confirmation.
    if (process.env.NODE_ENV === "production") {
        console.error("❌ Refusing to reset: NODE_ENV is production.");
        process.exit(1);
    }
    if (process.env.RESET_CONFIRM !== "YES") {
        console.error(
            "❌ Refusing to reset: set RESET_CONFIRM=YES to confirm this destructive operation."
        );
        process.exit(1);
    }

    console.log('🗑️  Starting database reset...');
    const startTime = Date.now();

    try {
        const steps: { label: string; run: () => Promise<{ count: number }> }[] = [
            { label: 'CourseSyllabusItem',   run: () => prisma.courseSyllabusItem.deleteMany() },
            { label: 'CourseSyllabusSection', run: () => prisma.courseSyllabusSection.deleteMany() },
            { label: 'CourseLearningOutcome', run: () => prisma.courseLearningOutcome.deleteMany() },
            { label: 'RoadmapStep',           run: () => prisma.roadmapStep.deleteMany() },
            { label: 'ClickEvent',            run: () => prisma.clickEvent.deleteMany() },
            { label: 'Coupon',                run: () => prisma.coupon.deleteMany() },
            { label: 'Course',                run: () => prisma.course.deleteMany() },
        ];

        let total = 0;
        for (const step of steps) {
            const { count } = await step.run();
            total += count;
            console.log(`  🗑️  ${step.label}: deleted ${count}`);
        }

        const kept = {
            Category: await prisma.category.count(),
            Platform: await prisma.platform.count(),
            Roadmap: await prisma.roadmap.count(),
            SiteSettings: await prisma.siteSettings.count(),
        };

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Reset complete! Deleted ${total} rows in ${elapsed}s`);
        console.log('Kept reference data:', JSON.stringify(kept));
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();