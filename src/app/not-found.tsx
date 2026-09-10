/**
 * Global 404 Page
 */

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
            <span className="font-display text-7xl font-bold text-accent mb-6">404</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted max-w-md mb-8">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:brightness-110 transition-all duration-200"
            >
                Back to Home
            </Link>
        </div>
    );
}
