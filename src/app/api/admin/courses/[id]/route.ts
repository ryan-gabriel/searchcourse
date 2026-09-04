/**
 * Single Course API Route
 * 
 * GET - Get course by ID
 * PUT - Update course
 * DELETE - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, updateCourse, deleteCourse } from '@/services';
import { CourseUpdateSchema } from '@/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const course = await getCourseById(id);

        if (!course) {
            return NextResponse.json(
                { message: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { message: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = CourseUpdateSchema.parse({ ...body, id });

        const course = await updateCourse(data);
        return NextResponse.json(course);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            console.error('Validation error:', error);
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error updating course:', error);
        return NextResponse.json(
            { message: 'Failed to update course' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await deleteCourse(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { message: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
