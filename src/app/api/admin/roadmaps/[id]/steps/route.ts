/**
 * Roadmap Steps API Route
 * 
 * POST - Add a step to a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { addRoadmapStep } from '@/services';
import { RoadmapStepCreateSchema } from '@/validations';
import { requireAdmin } from '@/lib/admin-guard';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        const { id: roadmapId } = await params;
        const body = await request.json();
        const data = RoadmapStepCreateSchema.parse({ ...body, roadmapId });

        const step = await addRoadmapStep(data);
        return NextResponse.json(step, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: (error as { issues?: unknown }).issues },
                { status: 400 }
            );
        }
        console.error('Error adding roadmap step:', error);
        return NextResponse.json(
            { message: 'Failed to add step' },
            { status: 500 }
        );
    }
}
