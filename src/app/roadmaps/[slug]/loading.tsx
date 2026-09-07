/**
 * Roadmap Detail Loading State
 */

import { Skeleton } from '@/components/ui/Skeleton';

export default function RoadmapDetailLoading() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="space-y-4 mb-10">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl mb-10" />
            <div className="space-y-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-6">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
