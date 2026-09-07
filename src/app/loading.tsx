/**
 * Global Loading State
 *
 * Minimal branded pulse shown during top-level navigation.
 */

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="animate-pulse space-y-8">
                <div className="space-y-4">
                    <div className="h-10 w-64 bg-surface-muted rounded-lg" />
                    <div className="h-4 w-96 max-w-full bg-surface-muted rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-surface-elevated rounded-2xl border border-border p-6 space-y-4">
                            <div className="h-40 w-full bg-surface-muted rounded-xl" />
                            <div className="h-5 w-2/3 bg-surface-muted rounded-full" />
                            <div className="h-4 w-1/2 bg-surface-muted rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
