'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, Column, StatCard } from '@/components/admin';

interface ClickEvent {
    id: string;
    source: string;
    ipHash: string | null;
    referer: string | null;
    createdAt: string;
    course: {
        id: string;
        title: string;
        slug: string;
    } | null;
}

interface TopCourse {
    courseId: string;
    title: string;
    clicks: number;
}

interface AnalyticsData {
    totalClicks: number;
    todayClicks: number;
    weekClicks: number;
    topCourses: TopCourse[];
}

interface PaginatedResponse {
    data: ClickEvent[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function AnalyticsPage() {
    const [events, setEvents] = useState<ClickEvent[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [dateRange, setDateRange] = useState('7d');

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/analytics?range=${dateRange}`);
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    }, [dateRange]);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
            const res = await fetch(`/api/admin/analytics/events?${params}`);
            const data: PaginatedResponse = await res.json();
            setEvents(data.data);
            setPagination((prev) => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const columns: Column<ClickEvent>[] = [
        {
            header: 'Course', accessorKey: 'course',
            cell: (event) => <p className="font-medium truncate max-w-xs">{event.course?.title || 'Unknown'}</p>,
        },
        {
            header: 'Source', accessorKey: 'source',
            cell: (event) => (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-foreground opacity-70">{event.source}</span>
            ),
        },
        {
            header: 'Referrer', accessorKey: 'referer',
            cell: (event) => {
                if (!event.referer) return <span className="text-foreground opacity-40">Direct</span>;
                try {
                    const url = new URL(event.referer);
                    return <span className="text-sm">{url.hostname}</span>;
                } catch {
                    return <span className="text-sm truncate max-w-[150px]">{event.referer}</span>;
                }
            },
        },
        {
            header: 'IP Hash', accessorKey: 'ipHash',
            cell: (event) => <span className="font-mono text-xs text-foreground opacity-50">{event.ipHash ? event.ipHash.substring(0, 8) + '...' : 'Unknown'}</span>,
        },
        {
            header: 'Time', accessorKey: 'createdAt',
            cell: (event) => <span className="text-sm text-foreground opacity-50">{formatTimeAgo(event.createdAt)}</span>,
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="text-foreground opacity-60">Track clicks and user engagement</p>
                </div>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="1d">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All time</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Clicks" value={analytics?.totalClicks ?? 0} subtitle="All time"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>} />
                <StatCard title="Today" value={analytics?.todayClicks ?? 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    trend={analytics && analytics.todayClicks > 0 ? { value: analytics.todayClicks, isPositive: true } : undefined} />
                <StatCard title="This Week" value={analytics?.weekClicks ?? 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            </div>

            {analytics?.topCourses && analytics.topCourses.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Top Courses</h2>
                    <div className="space-y-3">
                        {analytics.topCourses.map((course, index) => (
                            <div key={course.courseId} className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded-full bg-accent opacity-20 flex items-center justify-center text-foreground font-bold text-xs">{index + 1}</div>
                                <div className="flex-1 min-w-0"><p className="font-medium truncate">{course.title}</p></div>
                                <div className="text-right">
                                    <p className="font-bold text-accent">{course.clicks}</p>
                                    <p className="text-xs text-foreground opacity-50">clicks</p>
                                </div>
                                <div className="w-32 h-2 bg-surface-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-accent rounded-full" style={{ width: `${(course.clicks / analytics.topCourses[0].clicks) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Events</h2>
                {isLoading ? (
                    <div className="text-center py-12 text-foreground opacity-50">Loading events...</div>
                ) : (
                    <DataTable columns={columns} data={events} keyField="id" />
                )}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-foreground opacity-60">Page {pagination.page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page <= 1} className="btn btn-secondary disabled:opacity-50">Previous</button>
                            <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="btn btn-secondary disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
