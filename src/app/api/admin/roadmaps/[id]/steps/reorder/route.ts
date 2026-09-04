/**
 * Roadmap Steps Reorder API Route
 * 
 * PUT - Reorder steps in a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { reorderRoadmapSteps } from '@/services';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: roadmapId } = await params;
        const { stepOrder } = await request.json();

        if (!Array.isArray(stepOrder)) {
            return NextResponse.json(
                { message: 'Invalid step order data' },
                { status: 400 }
            );
        }

        await reorderRoadmapSteps(roadmapId, stepOrder);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering steps:', error);
        return NextResponse.json(
            { message: 'Failed to reorder steps' },
            { status: 500 }
        );
    }
}
