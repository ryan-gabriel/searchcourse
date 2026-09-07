/**
 * Courses API Route
 * 
 * GET - List courses with pagination and filtering
 * POST - Create a new course
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCourses, createCourse } from '@/services';
import { CourseSearchSchema, CourseCreateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const params = CourseSearchSchema.parse({
        query: searchParams.get('query') || undefined,
        platform: searchParams.get('platform') || undefined,
        category: searchParams.get('category') || undefined,
        level: searchParams.get('level') || undefined,
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 12,
    });

    const result = await searchCourses(params);
    return NextResponse.json(result);
}, 'Failed to fetch courses');

export const POST = withAdmin(async (request: NextRequest) => {
    const body = await request.json();
    const data = CourseCreateSchema.parse(body);

    const course = await createCourse(data);
    return NextResponse.json(course, { status: 201 });
}, 'Failed to create course');
