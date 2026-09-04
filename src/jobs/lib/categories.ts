/**
 * Category Mapping Helper
 *
 * Maps Udemy API primary_category to existing database categories.
 * Returns null if no match is found (course will have categoryId = null).
 */

import { prisma } from "@/lib/prisma";

// Cache categories to avoid repeated DB queries
let categoryCache: { id: string; name: string; slug: string }[] | null = null;

export async function getCategoryMap() {
    if (categoryCache) return categoryCache;

    const cats = await prisma.category.findMany({
        select: { id: true, name: true, slug: true },
    });

    categoryCache = cats;
    return cats;
}

/**
 * Attempt to map a Udemy category string to an existing category.
 * Matches by slug or name (case-insensitive substring).
 */
export async function mapCategory(udemyCategory: string | undefined | null): Promise<string | null> {
    if (!udemyCategory) return null;

    const categories = await getCategoryMap();
    const normalised = udemyCategory.toLowerCase().trim();

    // 1. Exact slug match
    const bySlug = categories.find(
        (c: { id: string; name: string; slug: string }) => c.slug === normalised.replace(/\s+/g, '-')
    );
    if (bySlug) return bySlug.id;

    // 2. Name contains match
    const byName = categories.find((c: { id: string; name: string; slug: string }) =>
        c.name.toLowerCase().includes(normalised) ||
        normalised.includes(c.name.toLowerCase())
    );
    if (byName) return byName.id;

    return null;
}
