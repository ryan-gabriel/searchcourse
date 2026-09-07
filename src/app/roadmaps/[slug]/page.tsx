import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    Clock,
    BookOpen,
    CheckCircle,
    Star,
    ExternalLink,
    ArrowRight,
    Zap,
    Target,
    ChevronRight,
    DollarSign,
} from 'lucide-react';
import { getRoadmapBySlug } from '@/services';
import { formatPrice } from '@/lib/utils';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const roadmap = await getRoadmapBySlug(slug);

    if (!roadmap) {
        return { title: 'Roadmap Not Found' };
    }

    const title = `${roadmap.title} - Learning Roadmap`;
    const description =
        roadmap.description ||
        `Master ${roadmap.title.toLowerCase()} with this ${roadmap.courseCount}-course learning path. Save ${formatPrice(
            roadmap.totalSavings,
            'USD'
        )} with bundled discounts.`;

    return {
        title,
        description,
        keywords: [
            roadmap.title.toLowerCase(),
            'learning roadmap',
            'course path',
            'skill development',
            'online courses',
        ],
        openGraph: {
            title: `${title} | SearchCourse`,
            description,
        },
    };
}

export const dynamic = 'force-dynamic';

const VALUE_PROPS = [
    {
        icon: CheckCircle,
        title: 'Top Rated',
        description: 'Curated from 4.5+ star courses only.',
    },
    {
        icon: Zap,
        title: 'Structured Path',
        description: 'Logical flow, no missing concepts.',
    },
    {
        icon: Target,
        title: 'Best Value',
        description: 'Affiliate discounts applied.',
    },
];

export default async function RoadmapDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const roadmap = await getRoadmapBySlug(slug);

    if (!roadmap) {
        notFound();
    }

    const hasSteps = roadmap.steps.length > 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-surface border-b border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="text-foreground/50 hover:text-foreground"
                        >
                            Home
                        </Link>
                        <ChevronRight className="w-4 h-4 text-foreground/40" />
                        <Link
                            href="/roadmaps"
                            className="text-foreground/50 hover:text-foreground"
                        >
                            Roadmaps
                        </Link>
                        <ChevronRight className="w-4 h-4 text-foreground/40" />
                        <span className="text-foreground font-medium truncate">
                            {roadmap.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2">
                        <div className="mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                                {roadmap.title}
                            </h1>

                            {roadmap.description && (
                                <p className="text-lg text-foreground/60 mb-6">
                                    {roadmap.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-muted text-foreground">
                                    <BookOpen className="w-4 h-4" />
                                    {roadmap.courseCount} Courses
                                </span>
                                {roadmap.estimatedHours && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-muted text-foreground/70">
                                        <Clock className="w-4 h-4" />
                                        ~{roadmap.estimatedHours} Hours
                                    </span>
                                )}
                                {roadmap.totalSavings > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-muted text-price">
                                        <DollarSign className="w-4 h-4" />
                                        Save {formatPrice(roadmap.totalSavings, 'USD')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mb-12">
                            {VALUE_PROPS.map((prop) => (
                                <div
                                    key={prop.title}
                                    className="p-4 rounded-xl border border-border bg-surface"
                                >
                                    <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-surface-muted">
                                        <prop.icon className="w-5 h-5 text-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        {prop.title}
                                    </h3>
                                    <p className="text-sm text-foreground/50">
                                        {prop.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-foreground mb-6">
                                Learning Path
                            </h2>

                            {hasSteps ? (
                                <div className="relative">
                                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-border" />

                                    <div className="space-y-6">
                                        {roadmap.steps.map((step, index) => {
                                            const course = step.course;
                                            const hasDiscount =
                                                course.activeCoupon !== null;
                                            const finalPrice = hasDiscount
                                                ? course.activeCoupon!.finalPrice
                                                : course.originalPrice;

                                            return (
                                                <div
                                                    key={step.id}
                                                    className="relative flex gap-4"
                                                >
                                                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-ink flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>

                                                    <div className="flex-1 bg-surface rounded-xl border border-border p-5">
                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            {course.thumbnailUrl && (
                                                                <div className="sm:w-32 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-surface-muted">
                                                                    <img
                                                                        src={
                                                                            course.thumbnailUrl
                                                                        }
                                                                        alt={course.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                                                                    {course.title}
                                                                </h3>

                                                                {course.instructorName && (
                                                                    <p className="text-sm text-foreground/50 mb-2">
                                                                        by{' '}
                                                                        {course.instructorName}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                                                    <span className="text-foreground/50">
                                                                        {course.platform.name}
                                                                    </span>
                                                                    {course.duration && (
                                                                        <span className="text-foreground/50">
                                                                            {course.duration}
                                                                        </span>
                                                                    )}
                                                                    {course.rating && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                                            <span className="font-medium text-foreground/70">
                                                                                {Number(
                                                                                    course.rating
                                                                                ).toFixed(1)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                                                                <div className="text-right">
                                                                    <div className="font-bold text-foreground">
                                                                        {finalPrice === 0
                                                                            ? 'Free'
                                                                            : formatPrice(
                                                                                  finalPrice,
                                                                                  'USD'
                                                                              )}
                                                                    </div>
                                                                    {hasDiscount && (
                                                                        <div className="text-sm text-foreground/40 line-through">
                                                                            {formatPrice(
                                                                                Number(
                                                                                    course.originalPrice
                                                                                ),
                                                                                'USD'
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Link
                                                                    href={`/courses/${course.slug}`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-foreground hover:text-foreground/70"
                                                                >
                                                                    View
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-surface rounded-2xl border border-border">
                                    <BookOpen className="w-16 h-16 mx-auto text-border mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        Courses Coming Soon
                                    </h3>
                                    <p className="text-foreground/50">
                                        This roadmap is being curated. Check back soon!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <h3 className="font-semibold text-foreground mb-4">
                                        Path Summary
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground/50">
                                                Total Courses
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {roadmap.courseCount}
                                            </span>
                                        </div>
                                        {roadmap.estimatedHours && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-foreground/50">
                                                    Est. Duration
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {roadmap.estimatedHours} Hours
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground/50">
                                                Total Cost
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatPrice(
                                                    roadmap.totalDiscountedPrice,
                                                    'USD'
                                                )}
                                            </span>
                                        </div>
                                        {roadmap.totalSavings > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-foreground/50">
                                                    You Save
                                                </span>
                                                <span className="font-medium text-price">
                                                    {formatPrice(
                                                        roadmap.totalSavings,
                                                        'USD'
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {hasSteps && roadmap.steps[0] && (
                                        <Link
                                            href={`/courses/${roadmap.steps[0].course.slug}`}
                                            className="btn btn-primary w-full py-3 rounded-xl gap-2"
                                        >
                                            Start with Step 1
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>

                                <div className="px-6 pb-6">
                                    <Link
                                        href="/roadmaps"
                                        className="block text-center text-sm text-foreground/50 hover:text-foreground"
                                    >
                                        &larr; Browse all roadmaps
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border z-30">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-foreground/50">
                            {roadmap.courseCount} courses &middot;{' '}
                            {formatPrice(roadmap.totalDiscountedPrice, 'USD')}
                        </p>
                        {roadmap.totalSavings > 0 && (
                            <p className="text-xs text-price">
                                Save {formatPrice(roadmap.totalSavings, 'USD')}
                            </p>
                        )}
                    </div>
                    {hasSteps && roadmap.steps[0] && (
                        <Link
                            href={`/courses/${roadmap.steps[0].course.slug}`}
                            className="btn btn-primary px-5 py-2.5 rounded-xl gap-2"
                        >
                            Start
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
