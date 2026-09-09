/**
 * Cron-triggered Scrape Job Endpoint
 *
 * Runs the coupon scraper (discudemy/tutorialbar) when triggered by an
 * external cron (e.g. cron-job.org). Protected by CRON_SECRET passed as ?key=.
 *
 * GET /api/jobs/scrape?key=YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { runScrape } from '@/jobs/scrape-coupons';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    if (!isCronAuthorized(key)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runScrape();
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('Scrape job failed:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
