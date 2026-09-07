/**
 * Admin Error Boundary
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function AdminError({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="p-6 lg:p-8 flex flex-col items-center text-center">
            <span className="text-sm font-bold text-accent uppercase tracking-wide mb-4">Admin error</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted max-w-md mb-8">
                Try again, or return to the dashboard.
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:opacity-85 transition-opacity"
                >
                    Try Again
                </button>
                <Link
                    href="/admin"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-muted transition-colors"
                >
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
