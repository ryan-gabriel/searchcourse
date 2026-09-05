/**
 * Branded Short Redirect
 *
 * Routes branded `/go/{slug}` links (used by Telegram broadcasts) to the
 * tracking redirector, preserving attribution as TELEGRAM source.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourseBySlug } from '@/services';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    const { slug } = await context.params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        return NextResponse.json(
            { message: 'Course not found' },
            { status: 404 }
        );
    }

    return NextResponse.redirect(
        new URL(`/api/out/${course.id}?src=tg`, request.url)
    );
}