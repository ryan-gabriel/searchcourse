'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface SortOption {
    value: string;
    label: string;
}

interface SortDropdownProps {
    currentSort: string;
    options: SortOption[];
    currentFilters: Record<string, string | undefined>;
}

function buildFilterUrl(
    currentParams: Record<string, string | undefined>,
    updates: Record<string, string | undefined>
): string {
    const params = new URLSearchParams();
    const merged = { ...currentParams, ...updates };

    Object.entries(merged).forEach(([key, value]) => {
        if (value && value !== '') {
            params.set(key, value);
        }
    });

    const queryString = params.toString();
    return queryString ? `/courses?${queryString}` : '/courses';
}

export function SortDropdown({ currentSort, options, currentFilters }: SortDropdownProps) {
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        const url = buildFilterUrl(currentFilters, { sortBy, sortOrder, page: '1' });
        router.push(url);
    };

    return (
        <div className="relative">
            <select
                defaultValue={currentSort}
                onChange={handleChange}
                className="appearance-none pl-3 pr-8 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
        </div>
    );
}
