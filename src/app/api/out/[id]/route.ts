/**
 * Smart Redirector API
 * 
 * Handles click tracking and affiliate link redirection.
 * - Logs click events for analytics
 * - Redirects to affiliate or direct URL
 * - Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, recordClick } from '@/services';
import { rateLimiters, getRateLimitHeaders } from '@/lib/rate-limit';
import { hashIP } from '@/lib/utils';
import { ClickSourceEnum } from '@/validations';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const { id } = await context.params;

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
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
    const clickSource = source === 'tg' ? 'TELEGRAM' : 'WEB';

    // Record click (fire-and-forget for performance)
    const ipHash = await hashIP(ip);
    const country = request.headers.get('cf-ipcountry') || undefined;

    recordClick({
        courseId: id,
        source: ClickSourceEnum.parse(clickSource),
        userAgent: request.headers.get('user-agent') || undefined,
        referer: request.headers.get('referer') || undefined,
        ipHash,
        country,
    }).catch(console.error); // Don't block on analytics

    // Determine redirect URL
    // Use affiliate URL if available, otherwise direct URL
    let redirectUrl = course.affiliateUrl || course.directUrl;

    // Append coupon code if available
    const couponCode = course.coupons[0]?.code;
    if (couponCode && redirectUrl.includes('udemy.com')) {
        // Udemy-specific coupon URL format
        const url = new URL(redirectUrl);
        url.searchParams.set('couponCode', couponCode);
        redirectUrl = url.toString();
    }

    // Redirect with rate limit headers
    return NextResponse.redirect(redirectUrl, {
        headers: getRateLimitHeaders(rateLimitResult),
    });
}
