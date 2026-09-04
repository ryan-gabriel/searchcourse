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

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const category = await getCategoryById(id);

        if (!category) {
            return NextResponse.json(
                { message: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { message: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = CategoryUpdateSchema.parse({ ...body, id });

        const category = await updateCategory(data);
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error updating category:', error);
        return NextResponse.json(
            { message: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await deleteCategory(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { message: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
