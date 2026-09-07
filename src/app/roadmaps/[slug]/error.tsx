/**
 * Roadmap Detail Error Boundary
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function RoadmapDetailError({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
            <span className="text-sm font-bold text-accent uppercase tracking-wide mb-4">Roadmap unavailable</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">Could not load this learning path</h1>
            <p className="text-muted max-w-md mb-8">
                This roadmap may have been removed. Try again or browse all roadmaps.
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:opacity-85 transition-opacity"
                >
                    Try Again
                </button>
                <Link
                    href="/roadmaps"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-muted transition-colors"
                >
                    All Roadmaps
                </Link>
            </div>
        </div>
    );
}
