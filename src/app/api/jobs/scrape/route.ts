/**
 * Cron-triggered Scrape Job Endpoint
 *
 * Runs the coupon scraper (discudemy/tutorialbar) when triggered by an
 * external cron (e.g. cron-job.org). Protected by CRON_SECRET sent in the
 * `x-cron-secret` request header (not the URL, so it stays out of access
 * logs).
 *
 * GET /api/jobs/scrape
 * Header: x-cron-secret: YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { runScrape } from '@/jobs/scrape-coupons';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
    const key = request.headers.get('x-cron-secret');
    if (!isCronAuthorized(key)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Acknowledges the cron trigger immediately while the long-running
    // scrape continues in the background (cron-job.org free waits ~30s,
    // so we must not hold the response open for the full scrape).
    after(async () => {
        try {
            const result = await runScrape();
            console.log('Scrape job (background) complete:', result);
        } catch (error) {
            console.error('Scrape job (background) failed:', error);
        } finally {
            await prisma.$disconnect();
        }
    });

    return NextResponse.json({ ok: true, started: true });
}
