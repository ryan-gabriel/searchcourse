/**
 * Roadmap Steps Reorder API Route
 * 
 * PUT - Reorder steps in a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { reorderRoadmapSteps } from '@/services';
import { StepOrderSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id: roadmapId } = await ctx!.params;
    const body = await request.json();
    const { stepOrder } = StepOrderSchema.parse(body);

    await reorderRoadmapSteps(roadmapId, stepOrder);
    return NextResponse.json({ success: true });
}, 'Failed to reorder steps');
