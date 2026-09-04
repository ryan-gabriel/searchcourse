'use client';

import { Filter, X } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@prisma/client';

interface RoadmapFiltersProps {
    searchParams: {
        q?: string;
        level?: string;
        category?: string;
    };
    categories: Category[];
}

export function RoadmapFilters({ searchParams, categories }: RoadmapFiltersProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.form?.requestSubmit();
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </h3>

                <form className="space-y-6">
                    {/* Preserve search query if exists */}
                    {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}

                    {/* Level Filter */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wider">Level</label>
                        <select
                            name="level"
                            defaultValue={searchParams.level || ''}
                            className="w-full p-2 bg-surface border border-border rounded-lg text-sm"
                            onChange={handleChange}
                        >
                            <option value="">All Levels</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wider">Category</label>
                        <select
                            name="category"
                            defaultValue={searchParams.category || ''}
                            className="w-full p-2 bg-surface border border-border rounded-lg text-sm"
                            onChange={handleChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(searchParams.level || searchParams.category) && (
                        <Link href="/roadmaps" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/70 font-medium">
                            <X className="w-3 h-3" /> Clear Filters
                        </Link>
                    )}
                </form>
            </div>
        </aside>
    );
}
