/**
 * Stat Card Component
 *
 * Dashboard statistic card with icon and trend indicator.
 */

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    className?: string;
}

export function StatCard({ title, value, icon, trend, subtitle, className = '' }: StatCardProps) {
    return (
        <div
            className={`
                p-6 rounded-2xl
                bg-surface-elevated
                border border-border
                transition-all duration-300
                hover:shadow-lg
                ${className}
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-muted">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            <span
                                className={`
                                    text-sm font-medium
                                    ${trend.isPositive ? 'text-price' : 'text-accent'}
                                `}
                            >
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-foreground opacity-40">vs last month</span>
                        </div>
                    )}
                </div>
                <div
                    className="
                        p-3 rounded-xl
                        bg-accent text-accent-ink
                    "
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
