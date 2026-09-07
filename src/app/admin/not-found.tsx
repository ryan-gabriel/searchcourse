/**
 * Admin 404 Page
 */

import Link from 'next/link';

export default function AdminNotFound() {
    return (
        <div className="p-6 lg:p-8 flex flex-col items-center text-center">
            <span className="text-7xl font-bold text-accent mb-6">404</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted max-w-md mb-8">
                The admin page you are looking for does not exist.
            </p>
            <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:opacity-85 transition-opacity"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
