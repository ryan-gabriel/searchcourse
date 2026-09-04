/**
 * Roadmaps API Route
 * 
 * GET - List roadmaps with pagination
 * POST - Create a new roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchRoadmaps, createRoadmap } from '@/services';
import { RoadmapSearchSchema, RoadmapCreateSchema } from '@/validations';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = RoadmapSearchSchema.parse({
            query: searchParams.get('query') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        });

        const result = await searchRoadmaps(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching roadmaps:', error);
        return NextResponse.json(
            { message: 'Failed to fetch roadmaps' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = RoadmapCreateSchema.parse(body);

        const roadmap = await createRoadmap(data);
        return NextResponse.json(roadmap, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error creating roadmap:', error);
        return NextResponse.json(
            { message: 'Failed to create roadmap' },
            { status: 500 }
        );
    }
}
