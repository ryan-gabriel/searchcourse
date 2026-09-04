/**
 * Click Service
 * 
 * Analytics and tracking for affiliate click events.
 */

import prisma from '@/lib/prisma';
import type { ClickCreateInput, ClickSource } from '@/validations';

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Record a click event
 */
export async function recordClick(data: ClickCreateInput) {
    return prisma.clickEvent.create({ data });
}

/**
 * Get click count for a course
 */
export async function getCourseClickCount(courseId: string) {
    return prisma.clickEvent.count({ where: { courseId } });
}

/**
 * Get click statistics by date range
 */
export async function getClickStats(options: {
    startDate?: Date;
    endDate?: Date;
    courseId?: string;
    source?: ClickSource;
}) {
    const { startDate, endDate, courseId, source } = options;

    const where: {
        createdAt?: { gte?: Date; lte?: Date };
        courseId?: string;
        source?: ClickSource;
    } = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    if (courseId) where.courseId = courseId;
    if (source) where.source = source;

    const [total, bySource, byCountry] = await Promise.all([
        prisma.clickEvent.count({ where }),
        prisma.clickEvent.groupBy({
            by: ['source'],
            where,
            _count: true,
        }),
        prisma.clickEvent.groupBy({
            by: ['country'],
            where,
            _count: true,
            orderBy: { _count: { country: 'desc' } },
            take: 10,
        }),
    ]);

    return {
        total,
        bySource: bySource.map((s) => ({
            source: s.source,
            count: s._count,
        })),
        byCountry: byCountry.map((c) => ({
            country: c.country,
            count: c._count,
        })),
    };
}

/**
 * Get top clicked courses
 */
export async function getTopClickedCourses(limit: number = 10) {
    const clicks = await prisma.clickEvent.groupBy({
        by: ['courseId'],
        _count: true,
        orderBy: { _count: { courseId: 'desc' } },
        take: limit,
    });

    if (clicks.length === 0) return [];

    const courseIds = clicks.map((c) => c.courseId);
    const courses = await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
        },
    });

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    return clicks.map((c) => ({
        course: courseMap.get(c.courseId),
        clicks: c._count,
    }));
}

/**
 * Get daily click trends
 */
export async function getDailyClickTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await prisma.clickEvent.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
    });

    // Group by date
    const byDate = new Map<string, number>();
    clicks.forEach((click) => {
        const dateKey = click.createdAt.toISOString().split('T')[0];
        byDate.set(dateKey, (byDate.get(dateKey) || 0) + 1);
    });

    // Fill in missing dates
    const result: { date: string; clicks: number }[] = [];
    const current = new Date(startDate);
    const today = new Date();

    while (current <= today) {
        const dateKey = current.toISOString().split('T')[0];
        result.push({
            date: dateKey,
            clicks: byDate.get(dateKey) || 0,
        });
        current.setDate(current.getDate() + 1);
    }

    return result;
}
