/**
 * Platforms API Route
 * 
 * GET - List platforms with pagination
 * POST - Create a new platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchPlatforms, createPlatform } from '@/services';
import { PlatformSearchSchema, PlatformCreateSchema } from '@/validations';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = PlatformSearchSchema.parse({
            query: searchParams.get('query') || undefined,
            isActive: searchParams.get('isActive') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        });

        const result = await searchPlatforms(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return NextResponse.json(
            { message: 'Failed to fetch platforms' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = PlatformCreateSchema.parse(body);

        const platform = await createPlatform(data);
        return NextResponse.json(platform, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error creating platform:', error);
        return NextResponse.json(
            { message: 'Failed to create platform' },
            { status: 500 }
        );
    }
}
