/**
 * Click Service
 *
 * Analytics and tracking for affiliate click events, plus the
 * redirect-target resolution used by the /api/out/[id] endpoint.
 */

import { prisma } from '@/lib/prisma';
import { paginate } from '@/lib/pagination';
import type { ClickCreateInput, EventsSearchParams } from '@/validations';

// ============================================
// REDIRECT URL HELPERS
// ============================================

/**
 * True for Impact/affiliate tracking domains (trk.*, imp.i*, impact.com).
 * These links route through the affiliate network, so the course URL must not
 * be rewritten after generation - attribution is bound to the original target.
 */
export function isAffiliateUrl(url: string): boolean {
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
 * Defense-in-depth: only allow http(s) URLs whose hostname is a known course
 * platform or our affiliate network. Blocks javascript:/data: schemes and
 * arbitrary phishing domains even if a course record is tampered with at the
 * DB layer.
 */
export function isAllowedRedirectTarget(url: string): boolean {
    let hostname: string;
    try {
        const u = new URL(url);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
        hostname = u.hostname.toLowerCase();
    } catch {
        return false;
    }

    if (isAffiliateUrl(url)) {
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

/**
 * Resolve the final redirect URL for a course-out click. Prefers the
 * affiliate URL, falls back to the direct URL, and appends the coupon code
 * only for plain Udemy direct URLs (affiliate links embed the coupon in the
 * encoded target and must not be rewritten).
 */
export function buildCourseRedirectUrl(
    course: { affiliateUrl: string | null; directUrl: string },
    couponCode: string | null | undefined
): string {
    let redirectUrl = course.affiliateUrl || course.directUrl;

    if (couponCode && redirectUrl.includes('udemy.com') && !isAffiliateUrl(redirectUrl)) {
        const url = new URL(redirectUrl);
        url.searchParams.set('couponCode', couponCode);
        redirectUrl = url.toString();
    }

    return redirectUrl;
}

/**
 * Record a click event
 */
export async function recordClick(data: ClickCreateInput) {
    return prisma.clickEvent.create({ data });
}

/**
 * List click events with pagination (admin analytics)
 */
export async function listClickEvents({ page, limit }: EventsSearchParams) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        prisma.clickEvent.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        }),
        prisma.clickEvent.count(),
    ]);

    return paginate(events, page, limit, total);
}