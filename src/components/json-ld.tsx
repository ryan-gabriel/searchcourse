import type { JsonLd } from '@/lib/seo/schema';
import { safeJsonLd } from '@/lib/seo/schema';

/**
 * Server-rendered JSON-LD <script> block.
 *
 * The only place `dangerouslySetInnerHTML` is allowed for JSON-LD: content is
 * run through safeJsonLd, which escapes characters that would otherwise let a
 * scraped string break out of the script context (see safeJsonLd in
 * src/lib/seo/schema.ts). Do not inline JSON.stringify here directly.
 */
export function JsonLd({ data }: { data: JsonLd | JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}