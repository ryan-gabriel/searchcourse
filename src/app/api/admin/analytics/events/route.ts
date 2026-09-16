/**
 * Analytics Events API Route
 * 
 * GET - List click events with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { listClickEvents } from '@/services/click.service';
import { EventsSearchSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const { page, limit } = EventsSearchSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
    });

    const result = await listClickEvents({ page, limit });
    return NextResponse.json(result);
}, 'Failed to fetch events');
