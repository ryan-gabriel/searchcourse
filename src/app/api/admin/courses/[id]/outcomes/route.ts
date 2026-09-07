/**
 * Course Learning Outcomes API
 * 
 * PUT - Replace all learning outcomes for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseLearningOutcomes } from '@/services';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-route';

const UpdateSchema = z.object({
    outcomes: z.array(z.object({
        text: z.string().min(1).max(500),
        sortOrder: z.number().int(),
    })).max(500),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const { outcomes } = UpdateSchema.parse(body);

    const result = await updateCourseLearningOutcomes(id, outcomes);
    return NextResponse.json(result);
}, 'Failed to update outcomes');
