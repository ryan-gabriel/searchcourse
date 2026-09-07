/**
 * Skeleton Loading Component
 *
 * Animated placeholder for loading states.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-surface-muted',
                className
            )}
        />
    );
}

export function CourseCardSkeleton() {
    return (
        <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border">
            {/* Thumbnail */}
            <Skeleton className="h-44 w-full rounded-none" />

            <div className="p-5 space-y-4">
                {/* Platform badge */}
                <Skeleton className="h-5 w-16 rounded-full" />

                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>

                {/* Instructor */}
                <Skeleton className="h-4 w-1/2" />

                {/* Rating and Stats */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function CourseGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function RoadmapCardSkeleton() {
    return (
        <div className="bg-surface-elevated rounded-2xl p-6 border border-border">
            <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex items-center justify-between mt-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        </div>
    );
}

export function AdminStatSkeleton() {
    return (
        <div className="bg-surface-elevated rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-surface-elevated rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}
