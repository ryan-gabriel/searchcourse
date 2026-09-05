/**
 * Roadmap Steps Reorder API Route
 * 
 * PUT - Reorder steps in a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { reorderRoadmapSteps } from '@/services';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        const { id: roadmapId } = await params;
        const body = await request.json();
        const { stepOrder } = StepOrderSchema.parse(body);

        await reorderRoadmapSteps(roadmapId, stepOrder);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Invalid step order data' },
                { status: 400 }
            );
        }
        console.error('Error reordering steps:', error);
        return NextResponse.json(
            { message: 'Failed to reorder steps' },
            { status: 500 }
        );
    }
}
