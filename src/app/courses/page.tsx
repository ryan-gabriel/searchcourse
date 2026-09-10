import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { SortDropdown } from './SortDropdown';
import { CourseGridSkeleton } from '@/components/ui/Skeleton';
import { CourseCard } from '@/components/course';
import { searchCourses, getAllPlatforms, getAllCategories } from '@/services';
import { CourseSearchSchema } from '@/validations';
import { resolveCoursesIndexing } from '@/lib/seo/canonical';
import { buildItemListSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

const searchCoursesCached = unstable_cache(
    async (params: Parameters<typeof searchCourses>[0]) => searchCourses(params),
    ['courses-listing'],
    { revalidate: 60 }
);

interface CoursesPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(
    value: string | string[] | undefined
): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

export async function generateMetadata({
    searchParams,
}: CoursesPageProps): Promise<Metadata> {
    const params = await searchParams;

    const normalized: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(params)) {
        normalized[key] = firstParam(value);
    }

    const decision = resolveCoursesIndexing({
        baseUrl: '',
        params: normalized,
    });
    const canonical = decision.canonicalUrl || '/courses';

    const { category, platform, query } = normalized;

    const [categories, platforms] = await Promise.all([
        getAllCategories().catch((): Category[] => []),
        getAllPlatforms().catch((): Platform[] => []),
    ] as const);

    const categoryName = categories.find((c) => c.slug === category)?.name;
    const platformName = platforms.find((p) => p.slug === platform)?.name;

    let title: string;
    let description: string;

    if (categoryName) {
        title = `Best ${categoryName} Courses & Deals`;
        description = `Browse the best ${categoryName} courses with verified discounts. Compare top-rated ${categoryName} classes from Udemy, Coursera, and more.`;
    } else if (platformName) {
        title = `${platformName} Courses with Verified Discounts`;
        description = `Discover ${platformName} courses with verified discounts and coupons. Save money on top-rated ${platformName} classes.`;
    } else if (query) {
        title = `Search results for "${query}"`;
        description = `Find online courses matching "${query}" with verified deals and discounts on SearchCourse.`;
    } else {
        title = 'Browse Courses';
        description =
            'Discover thousands of online courses with verified discounts. Filter by platform, category, and price to find your perfect course.';
    }

    return {
        title,
        description,
        alternates: { canonical },
        robots: decision.noindex
            ? { index: false, follow: true }
            : { index: true, follow: true },
        openGraph: {
            title: `${title} | SearchCourse`,
            description,
            url: canonical,
        },
    };
}

interface Platform {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    _count?: { courses: number };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconName: string | null;
    sortOrder: number;
    _count?: { courses: number };
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

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const params = await searchParams;

    const rawParams: Record<string, unknown> = {};
    const currentFilters: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(params)) {
        const val = Array.isArray(value) ? value[0] : value;
        rawParams[key] = val;
        currentFilters[key] = val;
    }

    const parseResult = CourseSearchSchema.safeParse(rawParams);
    const validParams = parseResult.success
        ? parseResult.data
        : {
              page: 1,
              limit: 12,
              sortBy: 'date' as const,
              sortOrder: 'desc' as const,
          };

    const [coursesResult, platforms, categories] = (await Promise.all([
        searchCoursesCached(validParams),
        getAllPlatforms().catch((): Platform[] => []),
        getAllCategories().catch((): Category[] => []),
    ])) as [Awaited<ReturnType<typeof searchCourses>>, Platform[], Category[]];

    const activeFilters: { label: string; clearUrl: string }[] = [];

    if (validParams.platform) {
        const platformMatch = platforms.find((p) => p.slug === validParams.platform);
        activeFilters.push({
            label: `Platform: ${platformMatch?.name || validParams.platform}`,
            clearUrl: buildFilterUrl(currentFilters, {
                platform: undefined,
                page: '1',
            }),
        });
    }

    if (validParams.category) {
        const categoryMatch = categories.find(
            (c) => c.slug === validParams.category
        );
        activeFilters.push({
            label: `Category: ${categoryMatch?.name || validParams.category}`,
            clearUrl: buildFilterUrl(currentFilters, {
                category: undefined,
                page: '1',
            }),
        });
    }

    if (validParams.minRating) {
        activeFilters.push({
            label: `${validParams.minRating}+ Stars`,
            clearUrl: buildFilterUrl(currentFilters, {
                minRating: undefined,
                page: '1',
            }),
        });
    }

    if (validParams.hasDiscount) {
        activeFilters.push({
            label: 'Has Discount',
            clearUrl: buildFilterUrl(currentFilters, {
                hasDiscount: undefined,
                page: '1',
            }),
        });
    }

    if (validParams.query) {
        activeFilters.push({
            label: `Search: "${validParams.query}"`,
            clearUrl: buildFilterUrl(currentFilters, {
                query: undefined,
                page: '1',
            }),
        });
    }

    const sortOptions = [
        { value: 'date-desc', label: 'Newest First' },
        { value: 'date-asc', label: 'Oldest First' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'rating-desc', label: 'Highest Rated' },
        { value: 'discount-desc', label: 'Best Discounts' },
    ];

    const currentSort = `${validParams.sortBy || 'date'}-${validParams.sortOrder || 'desc'}`;

    return (
        <div className="min-h-screen bg-background">
            {coursesResult.data.length > 0 && (
                <JsonLd
                    data={buildItemListSchema(
                        coursesResult.data.map((course) => ({
                            name: course.title,
                            url: `/courses/${course.slug}`,
                        }))
                    )}
                />
            )}
            <div className="bg-surface border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Browse All Courses
                    </h1>
                    <p className="text-foreground/60">
                        Explore curated courses in tech, design, and business with verified
                        discounts.
                    </p>
                </div>
            </div>

            <div className="max-w-[1980px] w-full mx-auto px-4 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-foreground" />
                                <h2 className="font-semibold text-foreground">Filters</h2>
                                {activeFilters.length > 0 && (
                                    <Link
                                        href="/courses"
                                        className="ml-auto text-sm text-foreground hover:underline"
                                    >
                                        Clear all
                                    </Link>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-border">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Category
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={buildFilterUrl(currentFilters, {
                                                category:
                                                    validParams.category === cat.slug
                                                        ? undefined
                                                        : cat.slug,
                                                page: '1',
                                            })}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                                validParams.category === cat.slug
                                                    ? 'bg-surface-muted text-foreground font-medium'
                                                    : 'text-foreground/60 hover:bg-surface-muted'
                                            }`}
                                        >
                                            {cat.name}
                                            <span className="ml-2 text-xs text-foreground/40">
                                                ({cat._count?.courses ?? 0})
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-border">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Platform
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {platforms.map((plat) => (
                                        <Link
                                            key={plat.id}
                                            href={buildFilterUrl(currentFilters, {
                                                platform:
                                                    validParams.platform === plat.slug
                                                        ? undefined
                                                        : plat.slug,
                                                page: '1',
                                            })}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                                validParams.platform === plat.slug
                                                    ? 'bg-surface-muted text-foreground font-medium'
                                                    : 'text-foreground/60 hover:bg-surface-muted'
                                            }`}
                                        >
                                            {plat.name}
                                            <span className="ml-2 text-xs text-foreground/40">
                                                ({plat._count?.courses ?? 0})
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-border">
                                <h3 className="text-sm font-medium text-foreground mb-3">
                                    Minimum Rating
                                </h3>
                                <div className="space-y-2">
                                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                        <Link
                                            key={rating}
                                            href={buildFilterUrl(currentFilters, {
                                                minRating:
                                                    validParams.minRating === rating
                                                        ? undefined
                                                        : String(rating),
                                                page: '1',
                                            })}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                validParams.minRating === rating
                                                    ? 'bg-surface-muted text-foreground font-medium'
                                                    : 'text-foreground/60 hover:bg-surface-muted'
                                            }`}
                                        >
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.floor(rating)
                                                                ? 'fill-rating text-rating'
                                                                : 'fill-border text-border'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span>{rating}+ &amp; up</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-border">
                                <Link
                                    href={buildFilterUrl(currentFilters, {
                                        hasDiscount: validParams.hasDiscount
                                            ? undefined
                                            : 'true',
                                        page: '1',
                                    })}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${
                                        validParams.hasDiscount
                                            ? 'bg-surface-muted text-price font-medium'
                                            : 'text-foreground/60 hover:bg-surface-muted'
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            validParams.hasDiscount
                                                ? 'bg-price border-price'
                                                : 'border-foreground/30'
                                        }`}
                                    >
                                        {validParams.hasDiscount && (
                                            <svg
                                                className="w-3 h-3 text-background"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    On Sale Only
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <p className="text-foreground/60">
                                <span className="font-semibold text-foreground">
                                    {coursesResult.pagination.total.toLocaleString()}
                                </span>{' '}
                                courses found
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted">Sort by:</span>
                                <SortDropdown
                                    currentSort={currentSort}
                                    options={sortOptions}
                                    currentFilters={currentFilters}
                                />
                            </div>
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                {activeFilters.map((filter, index) => (
                                    <Link
                                        key={index}
                                        href={filter.clearUrl}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-muted text-foreground text-sm rounded-full hover:bg-border transition-colors"
                                    >
                                        {filter.label}
                                        <X className="w-3.5 h-3.5" />
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Suspense fallback={<CourseGridSkeleton count={12} />}>
                            {coursesResult.data.length > 0 ? (
                                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                                    {coursesResult.data.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No courses found
                                    </h3>
                                    <p className="text-muted mb-6">
                                        Try adjusting your filters or search terms.
                                    </p>
                                    <Link
                                        href="/courses"
                                        className="btn btn-primary px-4 py-2 text-sm rounded-lg"
                                    >
                                        Clear all filters
                                    </Link>
                                </div>
                            )}
                        </Suspense>

                        {coursesResult.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                {validParams.page > 1 && (
                                    <Link
                                        href={buildFilterUrl(currentFilters, {
                                            page: String(validParams.page - 1),
                                        })}
                                        className="px-4 py-2 bg-surface border border-border text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}

                                <span className="px-4 py-2 text-foreground/60">
                                    Page {coursesResult.pagination.page} of{' '}
                                    {coursesResult.pagination.totalPages}
                                </span>

                                {coursesResult.pagination.hasNext && (
                                    <Link
                                        href={buildFilterUrl(currentFilters, {
                                            page: String(validParams.page + 1),
                                        })}
                                        className="px-4 py-2 bg-surface border border-border text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
