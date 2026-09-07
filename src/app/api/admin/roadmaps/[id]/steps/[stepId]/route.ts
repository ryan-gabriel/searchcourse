/**
 * Single Roadmap Step API Route
 * 
 * DELETE - Remove a step from a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeRoadmapStep } from '@/services';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string; stepId?: string }>;
}

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { stepId } = await ctx!.params;
    await removeRoadmapStep(stepId!);
    return NextResponse.json({ success: true });
}, 'Failed to remove step');
