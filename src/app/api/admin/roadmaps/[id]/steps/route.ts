/**
 * Roadmap Steps API Route
 * 
 * POST - Add a step to a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { addRoadmapStep } from '@/services';
import { RoadmapStepCreateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const POST = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id: roadmapId } = await ctx!.params;
    const body = await request.json();
    const data = RoadmapStepCreateSchema.parse({ ...body, roadmapId });

    const step = await addRoadmapStep(data);
    return NextResponse.json(step, { status: 201 });
}, 'Failed to add step');
