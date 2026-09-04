/**
 * Categories API Route
 * 
 * GET - List categories with pagination
 * POST - Create a new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCategories, createCategory } from '@/services';
import { CategorySearchSchema, CategoryCreateSchema } from '@/validations';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = CategorySearchSchema.parse({
            query: searchParams.get('query') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        });

        const result = await searchCategories(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = CategoryCreateSchema.parse(body);

        const category = await createCategory(data);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error creating category:', error);
        return NextResponse.json(
            { message: 'Failed to create category' },
            { status: 500 }
        );
    }
}
