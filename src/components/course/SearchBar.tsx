/**
 * Search Bar Component
 *
 * Debounced search input with filter options.
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

export function SearchBar({
    placeholder = 'Search courses...',
    className,
}: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('query') || '');
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set('query', value);
            } else {
                params.delete('query');
            }
            params.set('page', '1');
            router.push(`/courses?${params.toString()}`);
        }, 300),
        [searchParams, router]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('query');
        params.set('page', '1');
        router.push(`/courses?${params.toString()}`);
    };

    return (
        <div className={cn('relative', className)}>
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-foreground/40 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={cn(
                        'w-full pl-12 pr-20 py-3.5 rounded-xl',
                        'bg-surface',
                        'border border-border',
                        'text-foreground placeholder:text-foreground/40',
                        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
                        'transition-all duration-200'
                    )}
                />
                <div className="absolute right-2 flex items-center gap-1">
                    {query && (
                        <button
                            onClick={handleClear}
                            className="p-2 cursor-pointer text-foreground/40 hover:text-accent transition-colors duration-200"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'p-2 rounded-lg transition-colors duration-200 cursor-pointer',
                            showFilters
                                ? 'bg-surface-muted text-accent'
                                : 'text-foreground/40 hover:text-accent hover:bg-surface-muted'
                        )}
                        aria-label="Toggle filters"
                        aria-expanded={showFilters}
                        aria-controls="filter-panel"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div id="filter-panel" className="absolute top-full left-0 right-0 mt-2 p-4 bg-surface rounded-xl border border-border z-50">
                    <FilterPanel />
                </div>
            )}
        </div>
    );
}

function FilterPanel() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentLevel = searchParams.get('level') || '';
    const currentSort = searchParams.get('sortBy') || 'date';
    const hasDiscount = searchParams.get('hasDiscount') === 'true';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        router.push(`/courses?${params.toString()}`);
    };

    const levels = [
        { value: '', label: 'All Levels' },
        { value: 'BEGINNER', label: 'Beginner' },
        { value: 'INTERMEDIATE', label: 'Intermediate' },
        { value: 'ADVANCED', label: 'Advanced' },
    ];

    const sortOptions = [
        { value: 'date', label: 'Newest' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'price', label: 'Price: Low to High' },
        { value: 'discount', label: 'Biggest Discount' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Filter */}
            <div>
                <label className="block text-sm font-medium text-foreground opacity-70 mb-2">
                    Level
                </label>
                <select
                    value={currentLevel}
                    onChange={(e) => updateFilter('level', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    {levels.map((level) => (
                        <option key={level.value} value={level.value}>
                            {level.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sort By */}
            <div>
                <label className="block text-sm font-medium text-foreground opacity-70 mb-2">
                    Sort By
                </label>
                <select
                    value={currentSort}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Discount Toggle */}
            <div>
                <label className="block text-sm font-medium text-foreground opacity-70 mb-2">
                    Discounts
                </label>
                <button
                    onClick={() => updateFilter('hasDiscount', hasDiscount ? '' : 'true')}
                    className={cn(
                        'w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 cursor-pointer',
                        hasDiscount
                            ? 'bg-surface-muted border-accent text-accent'
                            : 'bg-surface-muted border-border text-foreground/70 hover:text-foreground'
                    )}
                >
                    {hasDiscount ? 'On Sale Only' : 'Show All'}
                </button>
            </div>
        </div>
    );
}
