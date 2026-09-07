/**
 * Roadmap Steps Reorder API Route
 * 
 * PUT - Reorder steps in a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { reorderRoadmapSteps } from '@/services';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const StepOrderSchema = z.object({
    stepOrder: z.array(
        z.object({
            id: z.string().cuid(),
            orderIndex: z.number().int().min(0),
        })
    ),
});

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id: roadmapId } = await ctx!.params;
    const body = await request.json();
    const { stepOrder } = StepOrderSchema.parse(body);

    await reorderRoadmapSteps(roadmapId, stepOrder);
    return NextResponse.json({ success: true });
}, 'Failed to reorder steps');
