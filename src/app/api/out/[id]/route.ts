/**
 * Smart Redirector API
 * 
 * Handles click tracking and affiliate link redirection.
 * - Logs click events for analytics
 * - Redirects to affiliate or direct URL
 * - Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCourseById, recordClick, buildCourseRedirectUrl, isAllowedRedirectTarget } from '@/services';
import { rateLimiters, getRateLimitHeaders, getClientIp } from '@/lib/rate-limit';
import { hashIP } from '@/lib/utils';
import { ClickCreateSchema } from '@/validations';

export const runtime = 'nodejs';

const CourseIdParamSchema = z.string().cuid();

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const { id } = await context.params;

    // Validate the course id up-front so a malformed param never reaches the
    // DB layer.
    const idResult = CourseIdParamSchema.safeParse(id);
    if (!idResult.success) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Rate limiting
    const ip = getClientIp(request.headers);
    const rateLimitResult = rateLimiters.click(ip);

    if (!rateLimitResult.success) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: getRateLimitHeaders(rateLimitResult),
        });
    }

    // Get course
    const course = await getCourseById(id);

    if (!course) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Determine source from query param
    const source = request.nextUrl.searchParams.get('src');
    const clickSource: 'WEB' | 'TELEGRAM' = source === 'tg' ? 'TELEGRAM' : 'WEB';

    // Record click (fire-and-forget for performance)
    const ipHash = await hashIP(ip);
    const country = request.headers.get('cf-ipcountry') || undefined;

    // Headers are attacker-controlled; cap their length to the schema's
    // VarChar(512) columns so a giant User-Agent can't fail the insert and
    // silently break analytics.
    const clickData = ClickCreateSchema.safeParse({
        courseId: id,
        source: clickSource,
        userAgent: request.headers.get('user-agent')?.slice(0, 512) || undefined,
        referer: request.headers.get('referer')?.slice(0, 512) || undefined,
        ipHash,
        country,
    });
    if (clickData.success) {
        recordClick(clickData.data).catch(console.error); // Don't block on analytics
    }

    // Determine redirect URL
    const redirectUrl = buildCourseRedirectUrl(course, course.coupons[0]?.code);

    // Fail closed: never redirect anywhere except known platforms/affiliates.
    if (!isAllowedRedirectTarget(redirectUrl)) {
        console.error(`Blocked redirect to disallowed target for course ${id}: ${redirectUrl}`);
        return NextResponse.redirect(new URL('/', request.url), {
            headers: getRateLimitHeaders(rateLimitResult),
        });
    }

    // Redirect with rate limit headers
    return NextResponse.redirect(redirectUrl, {
        headers: getRateLimitHeaders(rateLimitResult),
    });
}
