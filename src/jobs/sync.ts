/**
 * Udemy Course Sync Script
 *
 * 1. Fetches the coupon feed page by page (10 items/page)
 * 2. For each course, upserts it into the database using externalId (item.id) for dedup
 * 3. Creates/refreshes the associated Coupon (100% off -> finalPrice $0)
 *
 * Stops when a page returns fewer than 10 items (feed end).
 *
 * Feed shape (JSON array, one page at a time):
 * {
 *   id, sku, pic, title, coupon, org_price, desc_text,
 *   category, language, platform, rating, duration, expiry, savedtime
 * }
 *
 * Environment Variables Required:
 * - DATABASE_URL
 * - RAPIDAPI_KEY
 * - RAPIDAPI_HOST      (feed host, e.g. paid-udemy-course-for-free.p.rapidapi.com)
 * - RAPIDAPI_PATH      (endpoint path; defaults to "/")
 * - RAPIDAPI_MAX_PAGES (page cap per run; defaults to 25 -> 250 courses, ~25 req)
 * - IMPACT_AFFILIATE_BASE (optional; your Impact deep-link prefix, e.g. https://trk.udemy.com/c/...)
 */

import axios from 'axios';
import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug.utils";
import { mapCategory } from './lib/categories';
import { parsePrice, extractCoupon, buildAffiliateUrl, formatDuration } from './lib/affiliate';

// ============================================
// TYPES
// ============================================

interface UdemyFeedItem {
    id: string;               // Course ID (external dedup key)
    sku?: string;
    pic?: string;
    title: string;
    coupon: string;           // Full Udemy URL including couponCode
    org_price?: string;       // e.g. "$9.99"
    desc_text?: string;
    category?: string;
    language?: string;
    platform?: string;
    rating?: number;
    duration?: number;        // Hours
    expiry?: string;
    savedtime?: string;
}

// ============================================
// CONFIG
// ============================================

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || '';
const RAPIDAPI_PATH = process.env.RAPIDAPI_PATH || '/';
const RAPIDAPI_MAX_PAGES = parseInt(process.env.RAPIDAPI_MAX_PAGES || '25', 10);
const FEED_PAGE_SIZE = 10;
const IMPACT_AFFILIATE_BASE = process.env.IMPACT_AFFILIATE_BASE || '';

if (!RAPIDAPI_KEY) {
    console.error('❌ RAPIDAPI_KEY environment variable is required');
    process.exit(1);
}

// Allowlist the RapidAPI feed host to prevent SSRF / API-key exfiltration if the
// environment is ever compromised. Hosts must be *.p.rapidapi.com (or the
// concrete rapidapi.com API endpoints).
if (!RAPIDAPI_HOST) {
    console.error('❌ RAPIDAPI_HOST environment variable is required');
    process.exit(1);
}
const RAPIDAPI_HOST_ALLOWED = /^(?:[a-z0-9-]+\.)*p\.rapidapi\.com$/i;
if (!RAPIDAPI_HOST_ALLOWED.test(RAPIDAPI_HOST)) {
    console.error(`❌ RAPIDAPI_HOST "${RAPIDAPI_HOST}" is not an allowed RapidAPI host`);
    process.exit(1);
}

const apiHeaders: Record<string, string> = {
    'x-rapidapi-key': RAPIDAPI_KEY,
};
if (RAPIDAPI_HOST) {
    apiHeaders['x-rapidapi-host'] = RAPIDAPI_HOST;
}

// ============================================
// API FUNCTIONS
// ============================================

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function feedUrl(page: number): string {
    const path = RAPIDAPI_PATH && RAPIDAPI_PATH !== '/' ? RAPIDAPI_PATH : '';
    const separator = path.includes('?') ? '&' : '?';
    return `https://${RAPIDAPI_HOST}${path}${separator}page=${page}`;
}

async function fetchFeed(page: number): Promise<UdemyFeedItem[]> {
    const { data } = await axios.get(feedUrl(page), { headers: apiHeaders });

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    throw new Error('Feed response was neither an array nor { results: [...] }');
}

// ============================================
// SYNC LOGIC
// ============================================

async function getOrCreateUdemyPlatform(): Promise<string> {
    const existing = await prisma.platform.findFirst({
        where: { slug: 'udemy' },
        select: { id: true },
    });

    if (existing) return existing.id;

    const created = await prisma.platform.create({
        data: {
            name: 'Udemy',
            slug: 'udemy',
            baseUrl: 'https://www.udemy.com',
            isActive: true,
        },
    });

    return created.id;
}

async function syncItem(item: UdemyFeedItem, platformId: string): Promise<boolean> {
    const externalId = String(item.id).trim();
    const title = item.title?.trim();

    if (!externalId || !title) {
        console.warn('  ⚠️ Skipping item with missing id/title:', JSON.stringify(item));
        return false;
    }

    const slug = generateSlug(title);
    const { directUrl, couponCode } = extractCoupon(item.coupon);

    if (!IMPACT_AFFILIATE_BASE) {
        console.warn('  ⚠️ IMPACT_AFFILIATE_BASE is not set - courses will NOT be commissionable');
    }
    const affiliateUrl = buildAffiliateUrl(directUrl, couponCode);

    const baseData = {
        title,
        thumbnailUrl: item.pic || null,
        originalPrice: parsePrice(item.org_price),
        rating: item.rating ?? null,
        instructorName: null,
        description: item.desc_text || null,
        language: item.language || null,
        duration: formatDuration(item.duration),
        directUrl,
        affiliateUrl,
        lastVerifiedAt: new Date(),
    };

    const existing = await prisma.course.findUnique({
        where: { externalId },
        select: { id: true },
    });

    let courseId: string;

    if (existing) {
        await prisma.course.update({
            where: { id: existing.id },
            data: baseData,
        });
        courseId = existing.id;
        console.log(`  ♻️ Updated: ${title.substring(0, 50)}...`);
    } else {
        const categoryId = await mapCategory(item.category);

        const newCourse = await prisma.course.create({
            data: {
                externalId,
                slug: await ensureUniqueSlug(slug),
                headline: null,
                shortDescription: null,
                instructorBio: null,
                currency: 'USD',
                level: 'ALL_LEVELS',
                reviewCount: 0,
                studentCount: 0,
                lectureCount: null,
                isActive: true,
                isFeatured: false,
                isPosted: false,
                platformId,
                categoryId,
                ...baseData,
            },
        });
        courseId = newCourse.id;
        console.log(`  ✅ Created: ${title.substring(0, 50)}...`);
    }

    if (couponCode) {
        const expiresAt = item.expiry ? new Date(item.expiry) : null;

        await prisma.coupon.deleteMany({
            where: { courseId, isActive: true },
        });

        await prisma.coupon.create({
            data: {
                code: couponCode,
                discountType: 'PERCENTAGE',
                discountValue: 100,
                finalPrice: 0,
                expiresAt,
                isActive: true,
                source: 'udemy-api-sync',
                courseId,
            },
        });
    }

    return true;
}

async function ensureUniqueSlug(slug: string): Promise<string> {
    let candidate = slug;
    let counter = 0;

    while (true) {
        const existing = await prisma.course.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });

        if (!existing) return candidate;

        counter++;
        candidate = `${slug}-${counter}`;
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('🚀 Starting Udemy course sync...');
    const startTime = Date.now();

    try {
        const platformId = await getOrCreateUdemyPlatform();
        console.log(`📦 Using platform ID: ${platformId}`);

        console.log(`📥 Syncing feed from ${RAPIDAPI_HOST}...`);

        let syncedCount = 0;
        let page = 0;

        while (page < RAPIDAPI_MAX_PAGES) {
            console.log(`📄 Fetching page ${page}...`);
            const items = await fetchFeed(page);

            if (items.length === 0) {
                console.log('  Page empty - end of feed.');
                break;
            }

            for (const item of items) {
                try {
                    const ok = await syncItem(item, platformId);
                    if (ok) syncedCount++;
                } catch (error) {
                    console.error(`  ❌ Failed to sync: ${item?.title?.substring(0, 50)}`, error);
                }
            }

            if (items.length < FEED_PAGE_SIZE) {
                console.log(`  Partial page (${items.length} items) - end of feed.`);
                break;
            }

            page++;
            if (page % 5 === 0) await sleep(300); // Mild rate-limit courtesy
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Sync complete! ${syncedCount} courses processed in ${elapsed}s`);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}