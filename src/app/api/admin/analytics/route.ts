/**
 * Analytics API Route
 *
 * GET - Get analytics overview data
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsDaysFor } from '@/lib/analytics';
import { getClickAnalytics } from '@/services';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const rawRange = searchParams.get('range') || '7d';

    const analytics = await getClickAnalytics(analyticsDaysFor(rawRange));
    return NextResponse.json(analytics);
}, 'Failed to fetch analytics');