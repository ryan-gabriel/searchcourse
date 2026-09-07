/**
 * Roadmaps Listing Loading State
 */

import { Skeleton } from '@/components/ui/Skeleton';

export default function RoadmapsLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="text-center space-y-4 mb-12">
                <Skeleton className="h-10 w-72 mx-auto" />
                <Skeleton className="h-5 w-96 max-w-full mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface-elevated rounded-2xl border border-border p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-14 w-14 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-20 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
