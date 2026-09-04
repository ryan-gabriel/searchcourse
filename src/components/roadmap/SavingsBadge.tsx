/**
 * Savings Badge Component
 *
 * Dynamic badge showing total savings on a roadmap.
 * Creates FOMO with eye-catching design.
 */

import { Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SavingsBadgeProps {
    savings: number;
    currency?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function SavingsBadge({ savings, currency = 'USD', size = 'md' }: SavingsBadgeProps) {
    if (savings <= 0) return null;

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div
            className={`
                inline-flex items-center gap-2 rounded-full font-bold
                bg-surface-muted text-price
                ${sizeStyles[size]}
            `}
        >
            <Sparkles className={iconSizes[size]} />
            <span>Save {formatPrice(savings, currency)} on this roadmap today</span>
        </div>
    );
}
