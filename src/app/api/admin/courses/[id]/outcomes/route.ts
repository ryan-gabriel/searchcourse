/**
 * Course Learning Outcomes API
 * 
 * PUT - Replace all learning outcomes for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseLearningOutcomes } from '@/services';
import { withAdmin } from '@/lib/admin-route';
import { CourseOutcomeUpdateSchema } from '@/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const { outcomes } = CourseOutcomeUpdateSchema.parse(body);

    const result = await updateCourseLearningOutcomes(id, outcomes);
    return NextResponse.json(result);
}, 'Failed to update outcomes');
