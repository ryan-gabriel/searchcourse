/**
 * Roadmaps API Route
 * 
 * GET - List roadmaps with pagination
 * POST - Create a new roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchRoadmaps, createRoadmap } from '@/services';
import { RoadmapSearchSchema, RoadmapCreateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const params = RoadmapSearchSchema.parse({
        query: searchParams.get('query') || undefined,
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
    });

    const result = await searchRoadmaps(params);
    return NextResponse.json(result);
}, 'Failed to fetch roadmaps');

export const POST = withAdmin(async (request: NextRequest) => {
    const body = await request.json();
    const data = RoadmapCreateSchema.parse(body);

    const roadmap = await createRoadmap(data);
    return NextResponse.json(roadmap, { status: 201 });
}, 'Failed to create roadmap');
