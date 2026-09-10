/**
 * Pure mapping helpers for scraped course enrichment data.
 *
 * Kept free of Prisma/database imports so the mapping logic can be
 * unit-tested in isolation. The pipeline consumes these when syncing
 * feed items into Course rows and learning outcomes.
 */
import { normalizeDuration } from './affiliate';

const MAX_OBJECTIVES = 50;
const MAX_OBJECTIVE_LENGTH = 500;

/** The subset of a feed item that carries enrichment data. */
export interface EnrichmentSource {
    instructor_name?: unknown;
    headline?: unknown;
    desc_text?: unknown;
    rating?: unknown;
    rating_count?: unknown;
    students_count?: unknown;
    duration?: unknown;
}

export interface CourseEnrichmentData {
    instructorName?: string;
    headline?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    studentCount?: number;
    duration?: string;
}

/**
 * Clamp a scraped rating to the 0-5 range with one decimal place.
 * Returns null when the value is missing or non-numeric.
 */
export function normalizeRating(value: unknown): number | null {
    const num =
        typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    if (!Number.isFinite(num)) return null;
    return Math.round(Math.min(5, Math.max(0, num)) * 10) / 10;
}

/**
 * Normalize a scraped counter (review count, student count) to a
 * non-negative integer. Returns null when absent or invalid.
 */
export function normalizeCount(value: unknown): number | null {
    const num =
        typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    if (!Number.isFinite(num) || num < 0) return null;
    return Math.trunc(num);
}

/**
 * Normalize scraped "what you'll learn" items into clean strings.
 */
export function normalizeObjectives(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim().slice(0, MAX_OBJECTIVE_LENGTH).trim())
        .filter((entry) => entry.length > 0)
        .slice(0, MAX_OBJECTIVES);
}

function cleanOptionalText(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : null;
}

/**
 * Map the enriched fields of a feed item onto Course columns.
 * Only present values are included, so updates never null out
 * data that the current scrape did not provide.
 */
export function buildEnrichmentData(
    item: EnrichmentSource
): CourseEnrichmentData {
    const data: CourseEnrichmentData = {};

    const instructorName = cleanOptionalText(item.instructor_name);
    if (instructorName) data.instructorName = instructorName;

    const headline = cleanOptionalText(item.headline);
    if (headline) data.headline = headline;

    const description = cleanOptionalText(item.desc_text);
    if (description) data.description = description;

    const rating = normalizeRating(item.rating);
    if (rating !== null) data.rating = rating;

    const reviewCount = normalizeCount(item.rating_count);
    if (reviewCount !== null) data.reviewCount = reviewCount;

    const studentCount = normalizeCount(item.students_count);
    if (studentCount !== null) data.studentCount = studentCount;

    const duration =
        typeof item.duration === 'number' || typeof item.duration === 'string'
            ? normalizeDuration(item.duration)
            : null;
    if (duration !== null) data.duration = duration;

    return data;
}
