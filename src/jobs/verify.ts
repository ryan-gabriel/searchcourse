/**
 * Coupon Verification Script
 *
 * Loads each active coupon's Udemy URL in a real browser and classifies it as
 * VALID / INVALID / UNDETERMINED:
 *   - VALID   -> refresh `verifiedAt` (coupon confirmed working)
 *   - INVALID -> deactivate the coupon (dead coupon)
 *   - UNDETERMINED -> leave untouched (page was blocked / never loaded)
 *
 * A single browser session is reused across coupons so the bot-protection
 * challenge is passed once. `VERIFY_MAX_COUPONS` caps work per run so this
 * fits inside a GitHub Actions job slot (coupons already have a feed-derived
 * `expiresAt`; the remaining rounds catch coupons that died early).
 *
 * Environment Variables:
 * - DATABASE_URL (required)
 * - VERIFY_MAX_COUPONS   (default 50) coupons checked per run, oldest-verified first
 * - VERIFY_TIMEOUT_MS    (default 25000) per-page timeout
 * - VERIFY_RATE_LIMIT_MS (default 500) delay between coupon navigations
 * - VERIFY_BROWSER_CHANNEL (default "chrome", "none" for bundled Chromium on CI)
 */

import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";
import { applyVerdict } from './lib/applyVerdict';
import { openUdemyProbe, type UdemyProbeOptions } from './lib/udemyProbe';
import { verifyCoupon, type CouponStatus, type FetchUdemyStateFn } from './lib/verifyCoupon';

const VERIFY_MAX_COUPONS = parseInt(process.env.VERIFY_MAX_COUPONS || '50', 10);
const VERIFY_RATE_LIMIT_MS = parseInt(process.env.VERIFY_RATE_LIMIT_MS || '500', 10);

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCouponUrl(directUrl: string, code: string | null): string {
    if (!code) return directUrl;
    const separator = directUrl.includes('?') ? '&' : '?';
    return `${directUrl}${separator}couponCode=${encodeURIComponent(code)}`;
}

export interface VerificationResult {
    checked: number;
    valid: number;
    invalid: number;
    undetermined: number;
}

export async function runVerification(
    injectedFetchState?: FetchUdemyStateFn,
): Promise<VerificationResult> {
    const probeOpts: UdemyProbeOptions = {};
    const session = injectedFetchState
        ? null
        : await openUdemyProbe(probeOpts);
    const fetchState = injectedFetchState ?? session!.fetchState;

    const result: VerificationResult = { checked: 0, valid: 0, invalid: 0, undetermined: 0 };

    try {
        const coupons = await prisma.coupon.findMany({
            where: { isActive: true },
            orderBy: { verifiedAt: 'asc' },
            take: VERIFY_MAX_COUPONS,
            select: {
                id: true,
                code: true,
                course: { select: { directUrl: true, title: true } },
            },
        });

        console.log(`🔍 Verifying ${coupons.length} coupon(s)...`);

        for (let i = 0; i < coupons.length; i++) {
            const coupon = coupons[i];
            const url = buildCouponUrl(coupon.course.directUrl, coupon.code);

            let status: CouponStatus = 'UNDETERMINED';
            let evidence: string[] = [];
            try {
                const verdict = await verifyCoupon(url, { fetchState });
                status = verdict.status;
                evidence = verdict.evidence;
            } catch (error) {
                console.error(`  ❌ Error verifying "${coupon.course.title}":`, error);
            }

            const update = applyVerdict(status);
            if (update) {
                await prisma.coupon.update({ where: { id: coupon.id }, data: update });
            }

            result.checked++;
            if (status === 'VALID') result.valid++;
            else if (status === 'INVALID') result.invalid++;
            else result.undetermined++;

            console.log(
                `  [${i + 1}/${coupons.length}] ${status.padEnd(11)} "${coupon.course.title.substring(0, 50)}"${evidence.length ? ` (${evidence.slice(0, 3).join('; ')})` : ''}`,
            );

            if (i < coupons.length - 1) await sleep(VERIFY_RATE_LIMIT_MS);
        }
    } finally {
        if (session) await session.close();
    }

    return result;
}

async function main() {
    console.log('🚀 Starting coupon verification...');
    const startTime = Date.now();

    try {
        const result = await runVerification();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
            `\n✅ Verification complete in ${elapsed}s — checked ${result.checked}, ${result.valid} valid, ${result.invalid} invalid (deactivated), ${result.undetermined} undetermined`,
        );
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}