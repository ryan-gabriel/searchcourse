/**
 * Admin/Analytics Service
 * 
 * Dashboard statistics and analytics data.
 */

import prisma from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
    courses: {
        total: number;
        active: number;
        featured: number;
    };
    platforms: number;
    categories: number;
    roadmaps: {
        total: number;
        active: number;
    };
    coupons: {
        total: number;
        active: number;
        expiringSoon: number;
    };
    clicks: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
}

export interface ClickAnalytics {
    dailyClicks: { date: string; count: number }[];
    topCourses: { courseId: string; title: string; clicks: number }[];
    sourceBreakdown: { source: string; count: number }[];
    countryBreakdown: { country: string; count: number }[];
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [
        totalCourses,
        activeCourses,
        featuredCourses,
        platforms,
        categories,
        totalRoadmaps,
        activeRoadmaps,
        totalCoupons,
        activeCoupons,
        expiringSoonCoupons,
        totalClicks,
        todayClicks,
        weekClicks,
        monthClicks,
    ] = await Promise.all([
        prisma.course.count(),
        prisma.course.count({ where: { isActive: true } }),
        prisma.course.count({ where: { isFeatured: true } }),
        prisma.platform.count({ where: { isActive: true } }),
        prisma.category.count(),
        prisma.roadmap.count(),
        prisma.roadmap.count({ where: { isActive: true } }),
        prisma.coupon.count(),
        prisma.coupon.count({
            where: {
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
        }),
        prisma.coupon.count({
            where: {
                isActive: true,
                expiresAt: { gt: now, lt: threeDaysFromNow },
            },
        }),
        prisma.clickEvent.count(),
        prisma.clickEvent.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.clickEvent.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.clickEvent.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return {
        courses: {
            total: totalCourses,
            active: activeCourses,
            featured: featuredCourses,
        },
        platforms,
        categories,
        roadmaps: {
            total: totalRoadmaps,
            active: activeRoadmaps,
        },
        coupons: {
            total: totalCoupons,
            active: activeCoupons,
            expiringSoon: expiringSoonCoupons,
        },
        clicks: {
            total: totalClicks,
            today: todayClicks,
            thisWeek: weekClicks,
            thisMonth: monthClicks,
        },
    };
}

/**
 * Get click analytics
 */
export async function getClickAnalytics(days: number = 30): Promise<ClickAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get clicks for the period
    const clicks = await prisma.clickEvent.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
            course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Daily clicks aggregation
    const dailyMap = new Map<string, number>();
    clicks.forEach((click) => {
        const date = click.createdAt.toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    const dailyClicks = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Top courses
    const courseMap = new Map<string, { title: string; clicks: number }>();
    clicks.forEach((click) => {
        const existing = courseMap.get(click.courseId);
        if (existing) {
            existing.clicks++;
        } else {
            courseMap.set(click.courseId, { title: click.course.title, clicks: 1 });
        }
    });
    const topCourses = Array.from(courseMap.entries())
        .map(([courseId, data]) => ({ courseId, ...data }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

    // Source breakdown
    const sourceMap = new Map<string, number>();
    clicks.forEach((click) => {
        sourceMap.set(click.source, (sourceMap.get(click.source) || 0) + 1);
    });
    const sourceBreakdown = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }));

    // Country breakdown
    const countryMap = new Map<string, number>();
    clicks.forEach((click) => {
        if (click.country) {
            countryMap.set(click.country, (countryMap.get(click.country) || 0) + 1);
        }
    });
    const countryBreakdown = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        dailyClicks,
        topCourses,
        sourceBreakdown,
        countryBreakdown,
    };
}
