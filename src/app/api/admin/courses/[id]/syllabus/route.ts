/**
 * Course Syllabus API
 * 
 * PUT - Replace all syllabus sections and items for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseSyllabus } from '@/services';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';

const UpdateSchema = z.object({
    sections: z.array(z.object({
        title: z.string().min(1).max(500),
        duration: z.string().max(100).optional(),
        sortOrder: z.number().int(),
        items: z.array(z.object({
            title: z.string().min(1).max(500),
            sortOrder: z.number().int(),
        })).max(500),
    })).max(500),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

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
