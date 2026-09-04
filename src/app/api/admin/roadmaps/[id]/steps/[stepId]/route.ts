/**
 * Single Roadmap Step API Route
 * 
 * DELETE - Remove a step from a roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeRoadmapStep } from '@/services';

interface RouteParams {
    params: Promise<{ id: string; stepId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { stepId } = await params;
        await removeRoadmapStep(stepId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing roadmap step:', error);
        return NextResponse.json(
            { message: 'Failed to remove step' },
            { status: 500 }
        );
    }
}
