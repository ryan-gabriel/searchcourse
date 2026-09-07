/**
 * Global Error Boundary
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
            <span className="text-sm font-bold text-accent uppercase tracking-wide mb-4">Something went wrong</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">We hit a snag loading this page</h1>
            <p className="text-muted max-w-md mb-8">
                Try again, or head back to the homepage to continue exploring courses and roadmaps.
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={reset}
                    autoFocus
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:opacity-85 transition-opacity"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-muted transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
