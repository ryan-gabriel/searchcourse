/**
 * Course Grid Component
 *
 * Responsive grid layout for course cards.
 */

import { CourseCard } from './CourseCard';
import { CourseGridSkeleton } from '@/components/ui/Skeleton';
import type { CourseWithDetails } from '@/services';

interface CourseGridProps {
    courses: CourseWithDetails[];
    isLoading?: boolean;
}

export function CourseGrid({ courses, isLoading }: CourseGridProps) {
    if (isLoading) {
        return <CourseGridSkeleton count={8} />;
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-muted mb-4">
                    <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No courses found
                </h3>
                <p className="text-foreground opacity-50 max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find what you&apos;re looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}
