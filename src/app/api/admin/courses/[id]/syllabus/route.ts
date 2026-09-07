/**
 * Course Syllabus API
 * 
 * PUT - Replace all syllabus sections and items for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseSyllabus } from '@/services';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-route';

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

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const { sections } = UpdateSchema.parse(body);

    // Map frontend structure to service expectation if needed, but schema matches
    const result = await updateCourseSyllabus(id, sections);
    return NextResponse.json(result);
}, 'Failed to update syllabus');
