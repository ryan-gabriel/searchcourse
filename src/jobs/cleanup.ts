/**
 * Expired Coupon Cleanup Script
 *
 * Deletes coupons that have expired more than 24 hours ago.
 * Deactivates courses with no remaining active coupons.
 *
 * Environment Variables Required:
 * - DATABASE_URL
 */

import { prisma } from "@/lib/prisma";
import { runVerification } from "./verify";

async function main() {
    console.log('🧹 Starting expired coupon cleanup...');
    const startTime = Date.now();

    try {
        // 0. Live-check active coupons against Udemy BEFORE the time-based pass,
        //    so coupons that died early (exhausted before their listed end date)
        //    are deactivated before they reach the broadcast pipeline.
        const verification = await runVerification();
        console.log(
            `🔍 Verified ${verification.checked} coupons: ${verification.valid} valid, ${verification.invalid} invalid (deactivated), ${verification.undetermined} undetermined`,
        );

        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        // 1. Delete expired coupons (expired > 24 hours ago)
        const deleted = await prisma.coupon.deleteMany({
            where: {
                expiresAt: {
                    lt: cutoff,
                },
            },
        });

        console.log(`🗑️  Deleted ${deleted.count} expired coupons`);

        // 2. Deactivate stale inactive coupons
        const deactivated = await prisma.coupon.updateMany({
            where: {
                isActive: true,
                expiresAt: {
                    lt: new Date(), // already expired but not yet 24h old
                },
            },
            data: {
                isActive: false,
            },
        });

        console.log(`🔕 Deactivated ${deactivated.count} recently-expired coupons`);

        // 3. Optionally deactivate courses with no active coupons
        //    (only for API-synced courses, identified by externalId)
        const orphanedCourses = await prisma.course.findMany({
            where: {
                externalId: { not: null },
                isActive: true,
                coupons: {
                    none: {
                        isActive: true,
                    },
                },
            },
            select: { id: true, title: true },
        });

        if (orphanedCourses.length > 0) {
            await prisma.course.updateMany({
                where: {
                    id: { in: orphanedCourses.map((c: { id: string; title: string }) => c.id) },
                },
                data: {
                    isActive: false,
                },
            });

            console.log(`📦 Deactivated ${orphanedCourses.length} courses with no active coupons:`);
            orphanedCourses.forEach((c: { id: string; title: string }) =>
                console.log(`   - ${c.title.substring(0, 60)}`)
            );
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Cleanup complete in ${elapsed}s`);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
