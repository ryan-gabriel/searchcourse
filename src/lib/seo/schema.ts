/**
 * Pure builders for JSON-LD structured data (schema.org).
 * Kept dependency-free and side-effect free so they are unit-testable.
 */

export type JsonLd = Record<string, unknown>;

/**
 * Serialize a JSON-LD structure for safe inline embedding in <script>.
 *
 * `JSON.stringify` does not escape `<`, `>`, `&`, or single quotes, so
 * scraped/untrusted strings (course titles, descriptions) could smuggle a
 * `</script>` out of the block and execute as HTML. Escaping the dangerous
 * characters to `\uXXXX` keeps the payload valid JSON for parsers while
 * making it inert to the HTML parser.
 */
export function safeJsonLd(data: JsonLd | JsonLd[]): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027');
}

interface CourseSchemaInput {
    name: string;
    description: string;
    url: string;
    image?: string;
    providerName: string;
    providerUrl?: string;
    instructorName?: string;
    rating?: number;
    reviewCount?: number;
    price: number;
    currency: string;
    lastVerifiedAt?: Date;
}

export function buildCourseSchema({
    name,
    description,
    url,
    image,
    providerName,
    providerUrl,
    instructorName,
    rating,
    reviewCount,
    price,
    currency,
    lastVerifiedAt,
}: CourseSchemaInput): JsonLd {
    const isFree = price === 0;

    const schema: JsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        url,
        ...(image ? { image: { '@type': 'ImageObject', url: image } } : {}),
        provider: {
            '@type': 'Organization',
            name: providerName,
            ...(providerUrl ? { sameAs: providerUrl } : {}),
        },
        ...(instructorName
            ? { instructor: { '@type': 'Person', name: instructorName } }
            : {}),
        offers: {
            '@type': 'Offer',
            category: isFree ? 'Free' : 'Paid',
            price: isFree ? '0' : price.toFixed(2),
            priceCurrency: currency,
            availability: 'https://schema.org/OnlineOnly',
            url,
            ...(lastVerifiedAt
                ? { priceValidUntil: lastVerifiedAt.toISOString().slice(0, 10) }
                : {}),
        },
    };

    if (typeof rating === 'number' && typeof reviewCount === 'number' && reviewCount > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            ratingCount: reviewCount,
        };
    }

    return schema;
}

interface BreadcrumbItem {
    name: string;
    url?: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(item.url ? { item: item.url } : {}),
        })),
    };
}

export function buildWebSiteSchema(baseUrl: string): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SearchCourse',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/courses?query={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

interface ItemListElement {
    name: string;
    url: string;
}

export function buildItemListSchema(items: ItemListElement[]): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: item.url,
        })),
    };
}

export function buildOrganizationSchema(baseUrl: string): JsonLd {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SearchCourse',
        url: baseUrl,
        logo: `${baseUrl}/icon-512.png`,
    };
}