/**
 * Single Course API Route
 * 
 * GET - Get course by ID
 * PUT - Update course
 * DELETE - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourseContent, updateCourse, deleteCourse } from '@/services';
import { CourseUpdateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const course = await getCourseContent(id);

    if (!course) {
        return NextResponse.json(
            { message: 'Course not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(course);
}, 'Failed to fetch course');

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const data = CourseUpdateSchema.parse({ ...body, id });

    const course = await updateCourse(data);
    return NextResponse.json(course);
}, 'Failed to update course');

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    await deleteCourse(id);
    return NextResponse.json({ success: true });
}, 'Failed to delete course');
