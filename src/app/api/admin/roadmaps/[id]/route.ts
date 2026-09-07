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
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const roadmap = await getRoadmapById(id);

    if (!roadmap) {
        return NextResponse.json(
            { message: 'Roadmap not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(roadmap);
}, 'Failed to fetch roadmap');

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const data = RoadmapUpdateSchema.parse({ ...body, id });

    const roadmap = await updateRoadmap(data);
    return NextResponse.json(roadmap);
}, 'Failed to update roadmap');

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    await deleteRoadmap(id);
    return NextResponse.json({ success: true });
}, 'Failed to delete roadmap');
