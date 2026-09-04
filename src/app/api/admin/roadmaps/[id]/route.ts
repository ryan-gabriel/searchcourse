/**
 * Single Roadmap API Route
 * 
 * GET - Get roadmap by ID with steps
 * PUT - Update roadmap
 * DELETE - Delete roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRoadmapById, updateRoadmap, deleteRoadmap } from '@/services';
import { RoadmapUpdateSchema } from '@/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const roadmap = await getRoadmapById(id);

        if (!roadmap) {
            return NextResponse.json(
                { message: 'Roadmap not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(roadmap);
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        return NextResponse.json(
            { message: 'Failed to fetch roadmap' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = RoadmapUpdateSchema.parse({ ...body, id });

        const roadmap = await updateRoadmap(data);
        return NextResponse.json(roadmap);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error updating roadmap:', error);
        return NextResponse.json(
            { message: 'Failed to update roadmap' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await deleteRoadmap(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting roadmap:', error);
        return NextResponse.json(
            { message: 'Failed to delete roadmap' },
            { status: 500 }
        );
    }
}
