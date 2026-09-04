/**
 * Course Syllabus API
 * 
 * PUT - Replace all syllabus sections and items for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseSyllabus } from '@/services';
import { z } from 'zod';

const UpdateSchema = z.object({
    sections: z.array(z.object({
        title: z.string().min(1),
        duration: z.string().optional(),
        sortOrder: z.number().int(),
        items: z.array(z.object({
            title: z.string().min(1),
            sortOrder: z.number().int(),
        })),
    })),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { sections } = UpdateSchema.parse(body);

        // Map frontend structure to service expectation if needed, but schema matches
        const result = await updateCourseSyllabus(id, sections);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating syllabus:', error);
        return NextResponse.json(
            { message: 'Failed to update syllabus' },
            { status: 500 }
        );
    }
}
