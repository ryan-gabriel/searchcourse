import { describe, expect, it } from 'vitest';
import { buildCourseSchema, buildBreadcrumbSchema, buildWebSiteSchema, buildItemListSchema, buildOrganizationSchema } from '@/lib/seo/schema';
import { resolveCoursesIndexing } from '@/lib/seo/canonical';
import { buildEditorialNote } from '@/lib/seo/editorial';

const BASE = 'https://searchcourse.vercel.app';

describe('resolveCoursesIndexing', () => {
    it('returns a clean, indexable canonical for the base listing', () => {
        expect(resolveCoursesIndexing({ baseUrl: BASE, params: {} })).toEqual({
            canonicalUrl: `${BASE}/courses`,
            noindex: false,
        });
    });

    it('keeps pagination indexable with a self-referencing canonical', () => {
        expect(
            resolveCoursesIndexing({ baseUrl: BASE, params: { page: '2' } })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?page=2`,
            noindex: false,
        });
    });

    it('drops an explicit page=1 to the clean URL', () => {
        expect(
            resolveCoursesIndexing({ baseUrl: BASE, params: { page: '1' } })
        ).toEqual({
            canonicalUrl: `${BASE}/courses`,
            noindex: false,
        });
    });

    it('keeps a single category filter indexable', () => {
        expect(
            resolveCoursesIndexing({
                baseUrl: BASE,
                params: { category: 'web-development' },
            })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?category=web-development`,
            noindex: false,
        });
    });

    it('keeps a single platform filter indexable', () => {
        expect(
            resolveCoursesIndexing({ baseUrl: BASE, params: { platform: 'udemy' } })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?platform=udemy`,
            noindex: false,
        });
    });

    it('keeps a category + pagination indexable and canonicalized in a stable order', () => {
        expect(
            resolveCoursesIndexing({
                baseUrl: BASE,
                params: { page: '3', category: 'data-science' },
            })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?category=data-science&page=3`,
            noindex: false,
        });
    });

    it('noindexes site search results and canonicals to the clean URL', () => {
        expect(
            resolveCoursesIndexing({ baseUrl: BASE, params: { query: 'react' } })
        ).toEqual({
            canonicalUrl: `${BASE}/courses`,
            noindex: true,
        });
    });

    it('noindexes facet-only variants (rating/coupon/featured)', () => {
        for (const facet of ['minRating=4.5', 'hasDiscount=true', 'isFeatured=true']) {
            const params = Object.fromEntries(
                facet.split('&').map((pair) => pair.split('='))
            );
            expect(
                resolveCoursesIndexing({ baseUrl: BASE, params })
            ).toMatchObject({ noindex: true, canonicalUrl: `${BASE}/courses` });
        }
    });

    it('noindexes multi-facet combos but canonicalizes nearest meaningful URL', () => {
        expect(
            resolveCoursesIndexing({
                baseUrl: BASE,
                params: { category: 'cloud-devops', platform: 'udemy', hasDiscount: 'true' },
            })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?category=cloud-devops&platform=udemy`,
            noindex: true,
        });
    });

    it('noindexes sort variants, stripping sort params from the canonical', () => {
        expect(
            resolveCoursesIndexing({
                baseUrl: BASE,
                params: { category: 'web-development', sortBy: 'rating', sortOrder: 'desc' },
            })
        ).toEqual({
            canonicalUrl: `${BASE}/courses?category=web-development`,
            noindex: true,
        });
    });

    it('treats the default date sort as a clean URL', () => {
        expect(
            resolveCoursesIndexing({
                baseUrl: BASE,
                params: { sortBy: 'date', sortOrder: 'desc' },
            })
        ).toEqual({ canonicalUrl: `${BASE}/courses`, noindex: false });
    });
});

describe('buildCourseSchema', () => {
    it('builds a minimal valid Course with Offer', () => {
        const schema = buildCourseSchema({
            name: 'React Patterns',
            description: 'Learn advanced React.',
            url: `${BASE}/courses/react-patterns`,
            providerName: 'Udemy',
            price: 12.99,
            currency: 'USD',
        });
        expect(schema['@type']).toBe('Course');
        expect(schema.name).toBe('React Patterns');
        expect(schema.offers).toMatchObject({
            '@type': 'Offer',
            category: 'Paid',
            price: '12.99',
            priceCurrency: 'USD',
        });
    });

    it('marks free courses as category Free', () => {
        const schema = buildCourseSchema({
            name: 'Free Course',
            description: 'A free course.',
            url: `${BASE}/courses/free`,
            providerName: 'Udemy',
            price: 0,
            currency: 'USD',
        });
        expect(schema.offers).toMatchObject({ category: 'Free', price: '0' });
    });

    it('includes AggregateRating only when rating data exists', () => {
        const withRating = buildCourseSchema({
            name: 'Rated',
            description: 'desc',
            url: `${BASE}/courses/rated`,
            providerName: 'Udemy',
            price: 10,
            currency: 'USD',
            rating: 4.5,
            reviewCount: 1200,
        });
        expect(withRating.aggregateRating).toEqual({
            '@type': 'AggregateRating',
            ratingValue: 4.5,
            ratingCount: 1200,
        });

        const without = buildCourseSchema({
            name: 'Unrated',
            description: 'desc',
            url: `${BASE}/courses/unrated`,
            providerName: 'Udemy',
            price: 10,
            currency: 'USD',
        });
        expect(without.aggregateRating).toBeUndefined();
    });

    it('includes instructor when provided', () => {
        const schema = buildCourseSchema({
            name: 'X',
            description: 'd',
            url: `${BASE}/courses/x`,
            providerName: 'Udemy',
            price: 1,
            currency: 'USD',
            instructorName: 'Ada Lovelace',
        });
        expect(schema.instructor).toEqual({ '@type': 'Person', name: 'Ada Lovelace' });
    });
});

describe('buildBreadcrumbSchema', () => {
    it('assigns sequential positions and last item has no url', () => {
        const schema = buildBreadcrumbSchema([
            { name: 'Courses', url: `${BASE}/courses` },
            { name: 'React Patterns' },
        ]);
        expect(schema['@type']).toBe('BreadcrumbList');
        expect(schema.itemListElement).toEqual([
            { '@type': 'ListItem', position: 1, name: 'Courses', item: `${BASE}/courses` },
            { '@type': 'ListItem', position: 2, name: 'React Patterns' },
        ]);
    });
});

describe('buildWebSiteSchema', () => {
    it('builds WebSite with SearchAction targeting the courses listing', () => {
        const schema = buildWebSiteSchema(BASE);
        expect(schema['@type']).toBe('WebSite');
        expect(schema.url).toBe(BASE);
        expect(schema.potentialAction).toEqual({
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE}/courses?query={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        });
    });
});

describe('buildItemListSchema', () => {
    it('builds an ItemList with numbered elements', () => {
        const schema = buildItemListSchema([
            { name: 'A', url: `${BASE}/courses/a` },
            { name: 'B', url: `${BASE}/courses/b` },
        ]);
        const elements = schema.itemListElement as {
            '@type': string;
            position: number;
            name: string;
            url: string;
        }[];
        expect(schema['@type']).toBe('ItemList');
        expect(elements).toHaveLength(2);
        expect(elements[0]).toEqual({
            '@type': 'ListItem',
            position: 1,
            name: 'A',
            url: `${BASE}/courses/a`,
        });
    });
});

describe('buildOrganizationSchema', () => {
    it('builds an Organization with logo', () => {
        const schema = buildOrganizationSchema(BASE);
        expect(schema['@type']).toBe('Organization');
        expect(schema.logo).toBe(`${BASE}/icon-512.png`);
    });
});

describe('buildEditorialNote', () => {
    it('includes course identity, instructor, rating, and verified discount info', () => {
        const note = buildEditorialNote({
            title: 'React Patterns',
            instructorName: 'Ada Lovelace',
            rating: 4.5,
            reviewCount: 1200,
            platformName: 'Udemy',
            discountPercent: 90,
            finalPrice: 12.99,
            verifiedDate: new Date('2026-09-08T00:00:00Z'),
        });
        expect(note).toContain('React Patterns');
        expect(note).toContain('Ada Lovelace');
        expect(note).toContain('4.5');
        expect(note).toContain('90%');
        expect(note).toContain('September 8, 2026');
    });

    it('produces a sensible note with minimal data', () => {
        const note = buildEditorialNote({
            title: 'Minimal Course',
            platformName: 'Coursera',
        });
        expect(note).toContain('Minimal Course');
        expect(note).not.toContain('undefined');
        expect(note).not.toContain('null');
    });
});