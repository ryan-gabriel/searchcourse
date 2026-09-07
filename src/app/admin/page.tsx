import { StatCard } from '@/components/admin';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface RecentClick {
    id: string;
    source: string;
    createdAt: Date;
    course: {
        title: string;
        slug: string;
    };
}

interface DashboardData {
    courseCount: number;
    platformCount: number;
    categoryCount: number;
    roadmapCount: number;
    activeCouponCount: number;
    totalClicks: number;
    recentClicks: RecentClick[];
}

async function getDashboardData(): Promise<DashboardData> {
    const [
        courseCount,
        platformCount,
        categoryCount,
        roadmapCount,
        activeCouponCount,
        totalClicks,
        recentClicks,
    ] = await Promise.all([
        prisma.course.count({ where: { isActive: true } }),
        prisma.platform.count({ where: { isActive: true } }),
        prisma.category.count(),
        prisma.roadmap.count({ where: { isActive: true } }),
        prisma.coupon.count({
            where: {
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        }),
        prisma.clickEvent.count(),
        prisma.clickEvent.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                course: { select: { title: true, slug: true } },
            },
        }),
    ]);

    return {
        courseCount,
        platformCount,
        categoryCount,
        roadmapCount,
        activeCouponCount,
        totalClicks,
        recentClicks,
    };
}

const icons = {
    courses: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    platforms: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    roadmaps: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    coupons: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
    clicks: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
    ),
    categories: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
};

export default async function AdminDashboard() {
    const stats = await getDashboardData();

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="mt-1 text-foreground opacity-60">
                    Welcome back! Here&apos;s what&apos;s happening with your courses.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Active Courses" value={stats.courseCount} icon={icons.courses} />
                <StatCard title="Platforms" value={stats.platformCount} icon={icons.platforms} />
                <StatCard title="Categories" value={stats.categoryCount} icon={icons.categories} />
                <StatCard title="Roadmaps" value={stats.roadmapCount} icon={icons.roadmaps} />
                <StatCard title="Active Coupons" value={stats.activeCouponCount} icon={icons.coupons} />
                <StatCard title="Total Clicks" value={stats.totalClicks} icon={icons.clicks} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-surface-elevated border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/admin/courses" className="p-4 rounded-xl bg-accent text-accent-ink text-center hover:opacity-90 transition-opacity">
                            <div className="mx-auto w-8 h-8 mb-2">{icons.courses}</div>
                            <span className="text-sm font-medium">Manage Courses</span>
                        </Link>
                        <Link href="/admin/roadmaps" className="p-4 rounded-xl bg-accent text-accent-ink text-center hover:opacity-90 transition-opacity">
                            <div className="mx-auto w-8 h-8 mb-2">{icons.roadmaps}</div>
                            <span className="text-sm font-medium">Manage Roadmaps</span>
                        </Link>
                        <Link href="/admin/coupons" className="p-4 rounded-xl bg-accent text-accent-ink text-center hover:opacity-90 transition-opacity">
                            <div className="mx-auto w-8 h-8 mb-2">{icons.coupons}</div>
                            <span className="text-sm font-medium">Manage Coupons</span>
                        </Link>
                        <Link href="/admin/analytics" className="p-4 rounded-xl bg-accent text-accent-ink text-center hover:opacity-90 transition-opacity">
                            <div className="mx-auto w-8 h-8 mb-2">{icons.clicks}</div>
                            <span className="text-sm font-medium">View Analytics</span>
                        </Link>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-surface-elevated border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Recent Clicks</h2>
                    <div className="space-y-3">
                        {stats.recentClicks.length === 0 ? (
                            <p className="text-sm text-muted">No clicks recorded yet.</p>
                        ) : (
                            stats.recentClicks.map((click) => (
                                <div key={click.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{click.course.title}</p>
                                        <p className="text-xs text-muted">
                                            {click.source} &middot; {new Date(click.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-foreground opacity-70">
                                        {click.source}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
