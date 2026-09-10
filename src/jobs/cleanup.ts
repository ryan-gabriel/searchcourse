/**
 * Expired Coupon Cleanup Script
 *
 * Deletes coupons that have expired more than 24 hours ago.
 * Deactivates courses with no remaining active coupons.
 *
 * Environment Variables Required:
 * - DATABASE_URL
 */

import { pathToFileURL } from 'url';
import { CLEANUP, TIME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { staleScrapedCouponWhere } from './lib/cleanup-utils';

export async function runCleanup() {
    console.log('🧹 Starting expired coupon cleanup...');
    const startTime = Date.now();

    const cutoff = new Date(Date.now() - CLEANUP.EXPIRED_COUPON_RETENTION_HOURS * TIME.ONE_HOUR_MS);

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

    // 2b. Deactivate scraped coupons that advertise no expiry but were not
    //     re-verified within the staleness window. Scraped coupons always
    //     store a null expiry, so check #1/#2 never touch them — without
    //     this they would stay "active" (and broadcastable) forever while
    //     the real Udemy coupon dies on the 1,000-redemption cap.
    const staleCutoff = new Date(Date.now() - CLEANUP.STALE_COUPON_MAX_AGE_HOURS * TIME.ONE_HOUR_MS);
    const deactivatedStale = await prisma.coupon.updateMany({
        where: {
            isActive: true,
            expiresAt: null,
            verifiedAt: {
                lt: staleCutoff,
            },
        },
        data: {
            isActive: false,
        },
    });

    console.log(`🕰️  Deactivated ${deactivatedStale.count} stale no-expiry coupons (unverified > ${CLEANUP.STALE_COUPON_MAX_AGE_HOURS}h)`);

    // 2c. Hard-delete scraped coupons that were never re-verified. Scoped to
    //     the `scraped:` prefix so manually-curated admin/partner coupons
    //     (free-text source, legitimately null-expiry + old verifiedAt) are
    //     never touched. Deactivation (#2b) already hid them at 48h; this
    //     removes the rows at 72h so the DB doesn't grow indefinitely.
    const deleteCutoff = new Date(Date.now() - CLEANUP.STALE_COUPON_DELETE_AFTER_HOURS * TIME.ONE_HOUR_MS);
    const deletedStale = await prisma.coupon.deleteMany({
        where: staleScrapedCouponWhere(deleteCutoff),
    });

    console.log(`🗑️  Deleted ${deletedStale.count} stale scraped coupons (unverified > ${CLEANUP.STALE_COUPON_DELETE_AFTER_HOURS}h)`);

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

    let deactivatedCourses = 0;
    if (orphanedCourses.length > 0) {
        deactivatedCourses = orphanedCourses.length;
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
    return { deleted: deleted.count, deactivated: deactivated.count, deactivatedStale: deactivatedStale.count, deletedStale: deletedStale.count, deactivatedCourses, elapsed };
}

async function main() {
    try {
        await runCleanup();
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}
