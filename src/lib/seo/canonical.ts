/**
 * Indexation policy for the /courses listing.
 *
 * Canonical strategy (Google-aligned for a faceted/navigational listing):
 * - The base listing and single "navigational" filters (category/platform)
 *   and their pagination stay indexable with a self-referencing canonical.
 * - Site search (?query=), sort variants, and multi-facet combinations are
 *   noindexed (noindex, follow) and canonicalized to the nearest clean URL so
 *   Google does not crawl duplicated filter combinations.
 */

export const DEFAULT_SORT = 'date' as const;
export const DEFAULT_SORT_ORDER = 'desc' as const;

const MEANINGFUL_KEYS = ['category', 'platform'] as const;
const SORT_KEYS = ['sortBy', 'sortOrder'] as const;
const FACET_KEYS = ['query', 'minRating', 'hasDiscount', 'isFeatured', 'limit'] as const;

export interface CoursesIndexingDecision {
    /** Absolute canonical URL for the current filter state. */
    canonicalUrl: string;
    /** Emit <meta name="robots" content="noindex,follow"> when true. */
    noindex: boolean;
}

interface ResolveInput {
    baseUrl: string;
    params: Record<string, string | undefined>;
}

export function resolveCoursesIndexing({
    baseUrl,
    params,
}: ResolveInput): CoursesIndexingDecision {
    const meaningful = MEANINGFUL_KEYS.filter((key) => {
        const value = params[key];
        return typeof value === 'string' && value.length > 0;
    });

    const hasFacets = FACET_KEYS.some((key) => {
        const value = params[key];
        return typeof value === 'string' && value.length > 0;
    });

    const hasNonDefaultSort = SORT_KEYS.some((key) => {
        const value = params[key];
        return typeof value === 'string' && value.length > 0;
    }) && isSortVariant(params);

    const multiMeaningful = meaningful.length > 1;

    const noindex = hasFacets || hasNonDefaultSort || multiMeaningful;

    const pageRaw = params.page;
    const pageNum = Number(pageRaw);
    const validPage = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;

    const canonicalParams = new URLSearchParams();
    for (const key of meaningful) {
        const value = params[key];
        if (typeof value === 'string' && value.length > 0) {
            canonicalParams.set(key, value);
        }
    }
    if (validPage > 1) {
        canonicalParams.set('page', String(validPage));
    }
    canonicalParams.sort();

    const queryString = canonicalParams.toString();
    return {
        canonicalUrl: queryString ? `${baseUrl}/courses?${queryString}` : `${baseUrl}/courses`,
        noindex,
    };
}

function isSortVariant(params: Record<string, string | undefined>): boolean {
    const sortBy = params.sortBy;
    const sortOrder = params.sortOrder;

    if (typeof sortBy === 'string' && sortBy.length > 0 && sortBy !== DEFAULT_SORT) {
        return true;
    }
    if (
        typeof sortOrder === 'string' &&
        sortOrder.length > 0 &&
        !(sortBy === DEFAULT_SORT && sortOrder === DEFAULT_SORT_ORDER)
    ) {
        return true;
    }
    return false;
}