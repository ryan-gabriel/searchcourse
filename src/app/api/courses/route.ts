/**
 * Course Search API
 * 
 * Public API for searching and filtering courses.
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCourses } from '@/services';
import { CourseSearchSchema } from '@/validations';
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit';

// export const runtime = 'edge'; // Disabled due to Prisma/Crypto compatibility

export async function GET(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = rateLimiters.search(ip);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
        );
    }

    // Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = CourseSearchSchema.safeParse(searchParams);

    if (!parseResult.success) {
        return NextResponse.json(
            { error: 'Invalid parameters', details: parseResult.error.flatten() },
            { status: 400 }
        );
    }

    try {
        const result = await searchCourses(parseResult.data);

        return NextResponse.json(result, {
            headers: {
                ...getRateLimitHeaders(rateLimitResult),
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
