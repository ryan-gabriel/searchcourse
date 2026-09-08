/**
 * JsonLd - renders schema.org JSON-LD structured data inline.
 * Must be used in a Server Component.
 */

import type { JsonLd } from '@/lib/seo/schema';

export function JsonLd({ data }: { data: JsonLd }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}