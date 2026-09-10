/**
 * Parser for tutorialbar.com course post pages (`/course/<slug>`).
 *
 * These pages embed two complementary data sources:
 * 1. JSON-LD `Course` / `Product` / `BreadcrumbList` schemas (stable).
 * 2. The Next.js flight payload (`self.__next_f.push`) holding the full
 *    `course` row from tutorialbar's database: headline, studentsCount,
 *    duration, coupon data, and the "what you'll learn" objectives array.
 *
 * The flight payload wins for fields it carries; JSON-LD fills the gaps
 * and is the fallback when the payload is absent.
 */
import type { UdemyFeedItem } from './pipeline';
import { decodeEntities } from './scrape-utils';

export interface TutorialbarPostDetails {
    slug: string;
    title: string | null;
    headline: string | null;
    description: string | null;
    instructorName: string | null;
    rating: number | null;
    ratingCount: number | null;
    studentsCount: number | null;
    language: string | null;
    duration: string | null;
    category: string | null;
    imageUrl: string | null;
    couponCode: string | null;
    couponUrl: string | null;
    objectives: string[];
}

interface FlightCourse {
    slug?: unknown;
    title?: unknown;
    headline?: unknown;
    description?: unknown;
    descriptionHtml?: unknown;
    objectives?: unknown;
    instructorName?: unknown;
    rating?: unknown;
    ratingCount?: unknown;
    studentsCount?: unknown;
    language?: unknown;
    duration?: unknown;
    category?: unknown;
    imageUrl?: unknown;
    couponCode?: unknown;
    couponUrl?: unknown;
}

interface FlightRow {
    content: string;
}

function cleanString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const cleaned = decodeEntities(value).trim();
    return cleaned.length > 0 ? cleaned : null;
}

function toFiniteNumber(value: unknown): number | null {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(num) ? num : null;
}

function toIntOrNull(value: unknown): number | null {
    const num = toFiniteNumber(value);
    return num === null ? null : Math.trunc(num);
}

function firstString(value: unknown): string | null {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        for (const entry of value) {
            if (typeof entry === 'string' && entry.trim()) return entry;
        }
    }
    return null;
}

function normalize(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function extractJsonLdBlocks(html: string): Record<string, unknown>[] {
    const blocks: Record<string, unknown>[] = [];
    const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
        try {
            const parsed: unknown = JSON.parse(match[1]);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                blocks.push(parsed as Record<string, unknown>);
            }
        } catch {
            // Ignore malformed JSON-LD blocks.
        }
    }
    return blocks;
}

function findJsonLdType(
    blocks: Record<string, unknown>[],
    type: string
): Record<string, unknown> | null {
    for (const block of blocks) {
        if (block['@type'] === type) return block;
    }
    return null;
}

function instructorNameFromJsonLd(course: Record<string, unknown>): string | null {
    const instructor = course['instructor'];
    if (Array.isArray(instructor)) {
        for (const entry of instructor) {
            const name =
                entry && typeof entry === 'object'
                    ? cleanString((entry as Record<string, unknown>)['name'])
                    : null;
            if (name) return name;
        }
        return null;
    }
    if (instructor && typeof instructor === 'object') {
        return cleanString((instructor as Record<string, unknown>)['name']);
    }
    return cleanString(instructor);
}

function breadcrumbMatchesSlug(
    blocks: Record<string, unknown>[],
    slug: string
): boolean {
    const breadcrumb = findJsonLdType(blocks, 'BreadcrumbList');
    if (!breadcrumb) return false;
    const items = breadcrumb['itemListElement'];
    if (!Array.isArray(items) || items.length === 0) return false;
    const last = items[items.length - 1];
    if (!last || typeof last !== 'object') return false;
    const url = (last as Record<string, unknown>)['item'];
    if (typeof url !== 'string') return false;
    try {
        const path = new URL(url, 'https://tutorialbar.com').pathname;
        const segments = path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        return (
            !!lastSegment && decodeURIComponent(lastSegment) === slug
        );
    } catch {
        return false;
    }
}

function decodeFlightPushes(html: string): string[] {
    const payloads: string[] = [];
    const pattern = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
        try {
            payloads.push(JSON.parse(`"${match[1]}"`));
        } catch {
            // Skip undecodable pushes; other pushes may still parse.
        }
    }
    return payloads;
}

function extractBalancedJson(text: string, start: number): string | null {
    if (text[start] !== '{') return null;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === '"') {
                inString = false;
            }
        } else if (ch === '"') {
            inString = true;
        } else if (ch === '{') {
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0) return text.slice(start, i + 1);
        }
    }
    return null;
}

function findFlightCourse(
    flightText: string,
    slug: string
): { course: FlightCourse } | null {
    const marker = '{"course":{';
    let from = 0;
    while (true) {
        const idx = flightText.indexOf(marker, from);
        if (idx === -1) return null;
        const raw = extractBalancedJson(flightText, idx);
        if (raw) {
            try {
                const wrapper = JSON.parse(raw) as { course?: FlightCourse };
                if (
                    wrapper.course &&
                    typeof wrapper.course === 'object' &&
                    wrapper.course.slug === slug
                ) {
                    return { course: wrapper.course };
                }
            } catch {
                // Keep scanning for the next candidate.
            }
        }
        from = idx + marker.length;
    }
}

function splitFlightRows(text: string): FlightRow[] {
    const rows: FlightRow[] = [];
    // Flight chunks are `<id>:T<len>,<text>` (text rows) or `<id>:[...]`
    // (element rows). Split on both so trailing element chunks never glue
    // onto a text row's content; only text rows are collected.
    for (const part of text.split(/(?=\d+:T\d+,|\d+:\[)/)) {
        const match = part.match(/^\d+:T\d+,([\s\S]*)$/);
        if (match) rows.push({ content: match[1].trim() });
    }
    return rows;
}

function tryParseStringArray(content: string): string[] | null {
    if (!content.startsWith('[')) return null;
    try {
        // Flight rows may contain literal control characters (e.g. newlines
        // decoded from `\n` escapes) inside string values, which strict
        // JSON.parse rejects — normalize them to spaces first.
        const sanitized = content.replace(/[\u0000-\u001F]/g, ' ');
        const parsed: unknown = JSON.parse(sanitized);
        if (
            Array.isArray(parsed) &&
            parsed.length >= 2 &&
            parsed.every((entry) => typeof entry === 'string')
        ) {
            return parsed as string[];
        }
    } catch {
        // Not a JSON string array.
    }
    return null;
}

function extractObjectives(
    flightText: string,
    anchorDescription: string | null,
    matchText: string | null
): string[] {
    const rows = splitFlightRows(flightText);

    if (anchorDescription) {
        // The page's Course JSON-LD description identifies the main course,
        // so anchoring on it anywhere in the stream is safe. Stream order is
        // description, then descriptionHtml, then objectives.
        const anchor = normalize(anchorDescription).slice(0, 120);
        const anchorIdx = rows.findIndex((row) =>
            normalize(row.content).startsWith(anchor)
        );
        if (anchorIdx !== -1) {
            // Stream order is description, then descriptionHtml, then
            // objectives — take the first JSON string array after the anchor.
            for (let i = anchorIdx + 1; i < Math.min(rows.length, anchorIdx + 4); i++) {
                const parsed = tryParseStringArray(rows[i].content);
                if (parsed) return parsed.map((entry) => decodeEntities(entry).trim()).filter(Boolean);
            }
            return [];
        }
    }

    // Fallback: pick the string array that best overlaps the course topic.
    const keywords = (matchText || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3);
    let best: string[] = [];
    let bestScore = 0;
    for (const row of rows) {
        const parsed = tryParseStringArray(row.content);
        if (!parsed) continue;
        const haystack = parsed.join(' ').toLowerCase();
        let score = 0;
        for (const word of keywords) {
            if (haystack.includes(word)) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            best = parsed;
        }
    }
    if (bestScore === 0) return [];
    return best.map((entry) => decodeEntities(entry).trim()).filter(Boolean);
}

export function parseTutorialbarPost(
    html: string | null | undefined,
    slug: string
): TutorialbarPostDetails | null {
    if (!html || !slug) return null;

    const blocks = extractJsonLdBlocks(html);
    const courseLd = findJsonLdType(blocks, 'Course');
    const productLd = findJsonLdType(blocks, 'Product');

    const flightText = decodeFlightPushes(html).join('\n');
    const flight = flightText ? findFlightCourse(flightText, slug) : null;

    // The page must be about the requested course: either its embedded
    // course row matches the slug, or the breadcrumb URL ends with it.
    if (!flight && !breadcrumbMatchesSlug(blocks, slug)) return null;

    const instance =
        courseLd && typeof courseLd['hasCourseInstance'] === 'object'
            ? (courseLd['hasCourseInstance'] as Record<string, unknown>)
            : null;
    const aggregate =
        courseLd && typeof courseLd['aggregateRating'] === 'object'
            ? (courseLd['aggregateRating'] as Record<string, unknown>)
            : null;
    const offers =
        courseLd && typeof courseLd['offers'] === 'object'
            ? (courseLd['offers'] as Record<string, unknown>)
            : null;

    const ldDescription = courseLd ? cleanString(courseLd['description']) : null;

    const title =
        (flight ? cleanString(flight.course.title) : null) ??
        (courseLd ? cleanString(courseLd['name']) : null);

    const objectives = flight
        ? extractObjectives(
              flightText,
              ldDescription,
              [flight.course.title, flight.course.category]
                  .filter((v) => typeof v === 'string')
                  .join(' ')
          )
        : [];

    return {
        slug,
        title,
        headline: flight ? cleanString(flight.course.headline) : null,
        description: ldDescription,
        instructorName:
            (flight ? cleanString(flight.course.instructorName) : null) ??
            (courseLd ? instructorNameFromJsonLd(courseLd) : null),
        rating:
            (flight ? toFiniteNumber(flight.course.rating) : null) ??
            (aggregate ? toFiniteNumber(aggregate['ratingValue']) : null),
        ratingCount:
            (flight ? toIntOrNull(flight.course.ratingCount) : null) ??
            (aggregate ? toIntOrNull(aggregate['ratingCount']) : null),
        studentsCount: flight
            ? toIntOrNull(flight.course.studentsCount)
            : null,
        language:
            (flight ? cleanString(flight.course.language) : null) ??
            (instance ? cleanString(firstString(instance['inLanguage'])) : null),
        duration: flight ? cleanString(flight.course.duration) : null,
        category:
            (flight ? cleanString(flight.course.category) : null) ??
            (offers ? cleanString(offers['category']) : null),
        imageUrl:
            (flight ? cleanString(flight.course.imageUrl) : null) ??
            (productLd ? cleanString(firstString(productLd['image'])) : null),
        couponCode: flight ? cleanString(flight.course.couponCode) : null,
        couponUrl: flight ? cleanString(flight.course.couponUrl) : null,
        objectives,
    };
}

/**
 * Merge parsed post-page details into a listing-level feed item.
 * Post values win for enrichment fields; everything the listing
 * already provides (title, coupon, price, category, language) is kept.
 * A null details object leaves the item unchanged.
 */
export function mergePostDetails(
    item: UdemyFeedItem,
    details: TutorialbarPostDetails | null
): UdemyFeedItem {
    if (!details) return item;

    const merged: UdemyFeedItem = { ...item };

    if (details.instructorName) merged.instructor_name = details.instructorName;
    if (details.headline) merged.headline = details.headline;
    if (details.description) merged.desc_text = details.description;
    if (details.rating !== null) merged.rating = details.rating;
    if (details.ratingCount !== null) merged.rating_count = details.ratingCount;
    if (details.studentsCount !== null) merged.students_count = details.studentsCount;
    if (details.duration) merged.duration = details.duration;
    if (details.objectives.length > 0) merged.objectives = details.objectives;

    return merged;
}
