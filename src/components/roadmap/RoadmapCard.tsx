/**
 * Roadmap Card Component
 *
 * Card for displaying roadmap in list view.
 */

import Link from 'next/link';
import { Map, Clock, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapCardProps {
    roadmap: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        iconName: string | null;
        estimatedHours: number | null;
        courseCount: number;
        isFeatured: boolean;
    };
    totalSavings?: number;
}

export function RoadmapCard({ roadmap, totalSavings = 0 }: RoadmapCardProps) {
    return (
        <Link
            href={`/roadmaps/${roadmap.slug}`}
            className={cn(
                'group relative block bg-surface-elevated rounded-2xl overflow-hidden',
                'transition-all duration-300',
                'border border-border',
                'hover:border-accent/40',
                'hover:shadow-lg hover:-translate-y-0.5'
            )}
        >
            {/* Featured Badge */}
            {roadmap.isFeatured && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent text-accent-ink">
                        <Sparkles className="w-3 h-3" />
                        Featured
                    </span>
                </div>
            )}

            {/* Header with accent */}
            <div className="relative h-32 bg-surface-muted p-6 flex items-end">
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Map className="w-7 h-7 text-accent-ink" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-6">
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {roadmap.title}
                </h3>

                {roadmap.description && (
                    <p className="text-sm text-foreground opacity-50 mb-4 line-clamp-2">
                        {roadmap.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-foreground opacity-70">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span>{roadmap.courseCount} Courses</span>
                    </div>
                    {roadmap.estimatedHours && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-accent" />
                            <span>{roadmap.estimatedHours}h</span>
                        </div>
                    )}
                </div>

                {/* Savings Badge */}
                {totalSavings > 0 && (
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-muted text-price">
                            <Sparkles className="w-3 h-3" />
                            Save ${totalSavings.toFixed(0)} today
                        </span>
                    </div>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm font-medium text-accent">
                        View Roadmap
                    </span>
                    <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
