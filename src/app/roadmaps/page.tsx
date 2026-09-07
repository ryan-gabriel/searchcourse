import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, Map, ArrowRight, Award } from 'lucide-react';
import { searchRoadmaps, getRoadmapBySlug, getAllCategories } from '@/services';
import { RoadmapFilters } from '@/components/roadmap/RoadmapFilters';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatPrice } from '@/lib/utils';
const VALID_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type ValidLevel = (typeof VALID_LEVELS)[number];

interface RoadmapsPageProps {
    searchParams: Promise<{
        q?: string;
        level?: string;
        category?: string;
    }>;
}

export const metadata: Metadata = {
    title: 'Learning Roadmaps - Curated Course Paths',
    description:
        'Follow curated learning paths to master new skills. Save money with bundled course discounts and track your progress.',
    keywords: [
        'learning roadmap',
        'course path',
        'skill development',
        'career roadmap',
        'programming roadmap',
        'web development path',
    ],
    openGraph: {
        title: 'Learning Roadmaps | SearchCourse',
        description:
            'Follow curated learning paths to master new skills with the best course deals.',
    },
};

export const dynamic = 'force-dynamic';

export default async function RoadmapsPage(props: RoadmapsPageProps) {
    const searchParams = await props.searchParams;

    const levelKey = searchParams.level?.toUpperCase();
    const level =
        levelKey && (VALID_LEVELS as readonly string[]).includes(levelKey)
            ? (levelKey as ValidLevel)
            : undefined;

    const filters = {
        q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
        level,
        category:
            typeof searchParams.category === 'string'
                ? searchParams.category
                : undefined,
        isActive: true,
        page: 1,
        limit: 50,
    };

    const [categories, { data: roadmaps }] = await Promise.all([
        getAllCategories().catch(
            () => [] as Awaited<ReturnType<typeof getAllCategories>>
        ),
        searchRoadmaps(filters),
    ]);

    const roadmapsWithSavings = await Promise.all(
        roadmaps.map(
            async (roadmap: {
                id: string;
                slug: string;
                title: string;
                description: string | null;
                iconName: string | null;
                courseCount: number;
                isFeatured: boolean;
                estimatedHours: number | null;
            }) => {
                try {
                    const details = await getRoadmapBySlug(roadmap.slug);
                    return {
                        ...roadmap,
                        totalSavings: details?.totalSavings ?? 0,
                        estimatedHours:
                            details?.estimatedHours ?? roadmap.estimatedHours,
                    };
                } catch {
                    return { ...roadmap, totalSavings: 0 };
                }
            }
        )
    );

    return (
        <div className="min-h-screen bg-background">
            <ScrollReveal>
            <section className="bg-surface border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                Career Roadmaps
                            </h1>
                            <p className="text-lg text-foreground/60">
                                Step-by-step paths to master a new career.
                            </p>
                        </div>

                        <form className="relative max-w-md w-full">
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchParams.q}
                                placeholder="Search roadmaps (e.g. Frontend, DevOps)..."
                                className="w-full pl-4 pr-12 py-3 bg-surface-muted border border-border rounded-xl focus:ring-2 focus:ring-accent text-foreground"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-foreground/40 hover:text-foreground"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            </ScrollReveal>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    <RoadmapFilters
                        searchParams={searchParams}
                        categories={categories}
                    />

                    <div className="flex-1">
                        {roadmapsWithSavings.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {roadmapsWithSavings.map(
                                    (roadmap: {
                                        id: string;
                                        title: string;
                                        slug: string;
                                        description: string | null;
                                        iconName: string | null;
                                        courseCount: number;
                                        estimatedHours: number | null;
                                        isFeatured: boolean;
                                        totalSavings: number;
                                    }) => (
                                        <Link
                                            key={roadmap.id}
                                            href={`/roadmaps/${roadmap.slug}`}
                                            className="group block p-6 bg-surface rounded-2xl border border-border hover:border-foreground/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0">
                                                    <Map className="w-6 h-6 text-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-foreground/70 transition-colors">
                                                        {roadmap.title}
                                                    </h3>
                                                    {roadmap.description && (
                                                        <p className="text-sm text-foreground/50 line-clamp-2">
                                                            {roadmap.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted text-foreground">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {roadmap.courseCount} Courses
                                                </span>
                                                {roadmap.estimatedHours && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted text-foreground/60">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        ~{roadmap.estimatedHours}h
                                                    </span>
                                                )}
                                                {roadmap.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-muted text-foreground/70">
                                                        <Award className="w-3.5 h-3.5" />
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            {roadmap.totalSavings > 0 && (
                                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                                    <span className="text-sm text-foreground/50">
                                                        Bundle Savings
                                                    </span>
                                                    <span className="text-sm font-semibold text-price">
                                                        Save{' '}
                                                        {formatPrice(
                                                            roadmap.totalSavings,
                                                            'USD'
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                                <Map className="w-16 h-16 mx-auto text-border mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No roadmaps found
                                </h3>
                                <p className="text-foreground/50 mb-6">
                                    Try adjusting your filters or search query.
                                </p>
                                <Link href="/roadmaps" className="text-foreground hover:underline">
                                    Clear all filters
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-surface-muted border-t border-border">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Not sure which path to take?
                    </h2>
                    <p className="text-foreground/60 mb-8">
                        Browse our full course catalog and create your own learning journey.
                    </p>
                    <Link
                        href="/courses"
                        className="btn btn-primary px-6 py-3 rounded-xl gap-2"
                    >
                        Browse All Courses
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
