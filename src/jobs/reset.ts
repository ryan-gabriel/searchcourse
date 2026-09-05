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
 * Environment Variables Required:
 * - DATABASE_URL
 */

import { prisma } from "@/lib/prisma";

async function main() {
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