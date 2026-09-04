/**
 * Single Platform API Route
 * 
 * GET - Get platform by ID
 * PUT - Update platform
 * DELETE - Delete platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlatformById, updatePlatform, deletePlatform } from '@/services';
import { PlatformUpdateSchema } from '@/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const platform = await getPlatformById(id);

        if (!platform) {
            return NextResponse.json(
                { message: 'Platform not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        return NextResponse.json(
            { message: 'Failed to fetch platform' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = PlatformUpdateSchema.parse({ ...body, id });

        const platform = await updatePlatform(data);
        return NextResponse.json(platform);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error updating platform:', error);
        return NextResponse.json(
            { message: 'Failed to update platform' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await deletePlatform(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting platform:', error);
        return NextResponse.json(
            { message: 'Failed to delete platform' },
            { status: 500 }
        );
    }
}
