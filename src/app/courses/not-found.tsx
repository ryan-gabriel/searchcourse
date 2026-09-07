/**
 * Courses List Empty State
 */

import Link from 'next/link';

export default function CoursesNotFound() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
            <span className="text-sm font-bold text-accent uppercase tracking-wide mb-4">No courses found</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">We could not find what you were looking for</h1>
            <p className="text-muted max-w-md mb-8">
                Try a different search, or start with one of our curated learning roadmaps.
            </p>
            <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:opacity-85 transition-opacity"
            >
                Back to Home
            </Link>
        </div>
    );
}
