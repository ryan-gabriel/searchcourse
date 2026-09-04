/**
 * Courses API Route
 * 
 * GET - List courses with pagination and filtering
 * POST - Create a new course
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCourses, createCourse } from '@/services';
import { CourseSearchSchema, CourseCreateSchema } from '@/validations';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = CourseSearchSchema.parse({
            query: searchParams.get('query') || undefined,
            platformId: searchParams.get('platformId') || undefined,
            categoryId: searchParams.get('categoryId') || undefined,
            level: searchParams.get('level') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 12,
        });

        const result = await searchCourses(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { message: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = CourseCreateSchema.parse(body);

        const course = await createCourse(data);
        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error creating course:', error);
        return NextResponse.json(
            { message: 'Failed to create course' },
            { status: 500 }
        );
    }
}
