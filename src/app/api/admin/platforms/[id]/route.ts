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
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const platform = await getPlatformById(id);

    if (!platform) {
        return NextResponse.json(
            { message: 'Platform not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(platform);
}, 'Failed to fetch platform');

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const data = PlatformUpdateSchema.parse({ ...body, id });

    const platform = await updatePlatform(data);
    return NextResponse.json(platform);
}, 'Failed to update platform');

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    await deletePlatform(id);
    return NextResponse.json({ success: true });
}, 'Failed to delete platform');
