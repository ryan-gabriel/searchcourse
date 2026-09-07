import { withAdmin } from '@/lib/admin-route';
import { NextRequest, NextResponse } from 'next/server';
import { searchPlatforms, createPlatform } from '@/services';
import { PlatformSearchSchema, PlatformCreateSchema } from '@/validations';

export const GET = withAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = PlatformSearchSchema.parse({
    query: searchParams.get('query') || undefined,
    isActive: searchParams.get('isActive') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });
  const result = await searchPlatforms(params);
  return NextResponse.json(result);
}, 'Failed to fetch platforms');

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const data = PlatformCreateSchema.parse(body);
  const platform = await createPlatform(data);
  return NextResponse.json(platform, { status: 201 });
}, 'Failed to create platform');
