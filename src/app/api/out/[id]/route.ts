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

/**
 * True for Impact/affiliate tracking domains (trk.*, imp.i*, impact.com).
 * These links route through the affiliate network, so the course URL must not
 * be rewritten after generation - attribution is bound to the original target.
 */
function isAffiliateUrl(url: string): boolean {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return (
            hostname.startsWith('trk.') ||
            hostname.startsWith('imp.') ||
            hostname === 'impact.com' ||
            hostname.endsWith('.impact.com')
        );
    } catch {
        return false;
    }
}

/**
 * Defense-in-depth: only redirect to http(s) https:// URLs whose hostname is a
 * known course platform or our affiliate network. Blocks javascript:/data:
 * schemes and arbitrary phishing domains even if a course record is tampered
 * with at the DB layer.
 */
function isAllowedRedirectTarget(url: string): boolean {
    let hostname: string;
    try {
        const u = new URL(url);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
        hostname = u.hostname.toLowerCase();
    } catch {
        return false;
    }

    // Affiliate tracking networks
    if (
        hostname.startsWith('trk.') ||
        hostname.startsWith('imp.') ||
        hostname === 'impact.com' ||
        hostname.endsWith('.impact.com')
    ) {
        return true;
    }

    // Known course platforms
    const allowedHosts = [
        'udemy.com',
        'www.udemy.com',
        'coursera.org',
        'www.coursera.org',
        'skillshare.com',
        'www.skillshare.com',
        'linkedin.com',
        'www.linkedin.com',
        'udacity.com',
        'www.udacity.com',
        'pluralsight.com',
        'www.pluralsight.com',
        'datacamp.com',
        'www.datacamp.com',
        'codecademy.com',
        'www.codecademy.com',
        'educative.io',
        'www.educative.io',
    ];
    return allowedHosts.includes(hostname);
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

    // Append coupon code only for plain Udemy direct URLs.
    // Affiliate URLs (trk.udemy.com / imp.*) already embed the coupon inside
    // the encoded target; mutating them would break Impact attribution.
    const couponCode = course.coupons[0]?.code;
    if (couponCode && redirectUrl.includes('udemy.com') && !isAffiliateUrl(redirectUrl)) {
        // Udemy-specific coupon URL format
        const url = new URL(redirectUrl);
        url.searchParams.set('couponCode', couponCode);
        redirectUrl = url.toString();
    }

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
