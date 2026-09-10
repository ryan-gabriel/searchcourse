'use client';

/**
 * SearchForm Component
 *
 * A functional search bar that navigates to the courses page with a query parameter.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchFormProps {
    placeholder?: string;
    className?: string;
    buttonText?: string;
}

export function SearchForm({
    placeholder = "What do you want to learn today? (e.g. React, Python)",
    className = "",
    buttonText = "Search",
}: SearchFormProps) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/courses?query=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/courses');
        }
    };

    return (
        <form onSubmit={handleSubmit} role="search" aria-label="Search courses" className={`relative ${className}`}>
            <div className="relative flex items-center overflow-hidden rounded-xl border border-border bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
                <div className="pl-4 text-foreground/40">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-4 py-5 text-lg text-foreground placeholder:text-foreground/40 focus:outline-none"
                />
                <button
                    type="submit"
                    className="hidden sm:flex items-center gap-2 px-6 py-3 bg-accent text-accent-ink font-semibold transition-all duration-200 hover:brightness-110 cursor-pointer"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
}

export default SearchForm;
