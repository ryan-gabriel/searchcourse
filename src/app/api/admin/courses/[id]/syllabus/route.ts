/**
 * Course Syllabus API
 * 
 * PUT - Replace all syllabus sections and items for a course
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCourseSyllabus } from '@/services';
import { withAdmin } from '@/lib/admin-route';
import { CourseSyllabusUpdateSchema } from '@/validations';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const { sections } = CourseSyllabusUpdateSchema.parse(body);

    // Map frontend structure to service expectation if needed, but schema matches
    const result = await updateCourseSyllabus(id, sections);
    return NextResponse.json(result);
}, 'Failed to update syllabus');
