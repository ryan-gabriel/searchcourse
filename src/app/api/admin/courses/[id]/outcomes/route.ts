/**
 * Course Learning Outcomes API
 * 
 * PUT - Replace all learning outcomes for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseLearningOutcomes } from '@/services';
import { z } from 'zod';

const UpdateSchema = z.object({
    outcomes: z.array(z.object({
        text: z.string().min(1),
        sortOrder: z.number().int(),
    })),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { outcomes } = UpdateSchema.parse(body);

        const result = await updateCourseLearningOutcomes(id, outcomes);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating outcomes:', error);
        return NextResponse.json(
            { message: 'Failed to update outcomes' },
            { status: 500 }
        );
    }
}
