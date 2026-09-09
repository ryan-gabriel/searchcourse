/**
 * Cron-triggered Cleanup Job Endpoint
 *
 * Runs the expired-coupon cleanup when triggered by an external cron
 * (e.g. cron-job.org). Protected by CRON_SECRET passed as ?key=.
 *
 * GET /api/jobs/cleanup?key=YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { runCleanup } from '@/jobs/cleanup';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    if (!isCronAuthorized(key)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runCleanup();
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('Cleanup job failed:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
