/**
 * Single Category API Route
 * 
 * GET - Get category by ID
 * PUT - Update category
 * DELETE - Delete category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/services';
import { CategoryUpdateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const category = await getCategoryById(id);

    if (!category) {
        return NextResponse.json(
            { message: 'Category not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(category);
}, 'Failed to fetch category');

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const data = CategoryUpdateSchema.parse({ ...body, id });

    const category = await updateCategory(data);
    return NextResponse.json(category);
}, 'Failed to update category');

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
}, 'Failed to delete category');
