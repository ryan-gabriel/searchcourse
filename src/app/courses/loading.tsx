/**
 * Courses List Loading State
 */

import { CourseGridSkeleton } from '@/components/ui/Skeleton';

export default function CoursesLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="space-y-6 mb-10">
                <div className="h-10 w-56 bg-surface-muted rounded-lg animate-pulse" />
                <div className="h-5 w-72 bg-surface-muted rounded-full animate-pulse" />
            </div>
            <CourseGridSkeleton count={12} />
        </div>
    );
}
