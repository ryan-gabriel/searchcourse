import { withAdmin } from '@/lib/admin-route';
import { NextRequest, NextResponse } from 'next/server';
import { searchCategories, createCategory } from '@/services';
import { CategorySearchSchema, CategoryCreateSchema } from '@/validations';

export const GET = withAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = CategorySearchSchema.parse({
    query: searchParams.get('query') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });
  const result = await searchCategories(params);
  return NextResponse.json(result);
}, 'Failed to fetch categories');

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const data = CategoryCreateSchema.parse(body);
  const category = await createCategory(data);
  return NextResponse.json(category, { status: 201 });
}, 'Failed to create category');
