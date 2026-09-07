/**
 * Analytics API Route
 * 
 * GET - Get analytics overview data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClickAnalytics } from '@/services';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    let days: number | undefined;
    switch (range) {
        case '1d':
            days = 1;
            break;
        case '7d':
            days = 7;
            break;
        case '30d':
            days = 30;
            break;
        default:
            days = undefined; // all time
    }

    const analytics = await getClickAnalytics(days);
    return NextResponse.json(analytics);
}, 'Failed to fetch analytics');
