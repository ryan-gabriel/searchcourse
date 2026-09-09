/**
 * Udemy Course Sync Script
 *
 * 1. Fetches the coupon feed page by page (10 items/page)
 * 2. For each course, upserts it into the database using externalId (item.id) for dedup
 * 3. Creates/refreshes the associated Coupon (100% off -> finalPrice $0 by default,
 *    or the actual discounted price when the feed provides coupon_price)
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
 * - RAPIDAPI_MAX_PAGES (page cap per run; defaults to 1 -> 10 courses, 1 req)
 * - IMPACT_AFFILIATE_BASE (optional; your Impact deep-link prefix, e.g. https://trk.udemy.com/c/...)
 */

import axios from 'axios';
import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";
import {
    getOrCreateUdemyPlatform,
    syncItem,
    type UdemyFeedItem,
} from './lib/pipeline';

// ============================================
// CONFIG
// ============================================

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || '';
const RAPIDAPI_PATH = process.env.RAPIDAPI_PATH || '/';
const RAPIDAPI_MAX_PAGES = parseInt(process.env.RAPIDAPI_MAX_PAGES || '1', 10);
const FEED_PAGE_SIZE = 10;

if (!RAPIDAPI_KEY) {
    throw new Error('❌ RAPIDAPI_KEY environment variable is required');
}

// Allowlist the RapidAPI feed host to prevent SSRF / API-key exfiltration if the
// environment is ever compromised. Hosts must be *.p.rapidapi.com (or the
// concrete rapidapi.com API endpoints).
if (!RAPIDAPI_HOST) {
    throw new Error('❌ RAPIDAPI_HOST environment variable is required');
}
const RAPIDAPI_HOST_ALLOWED = /^(?:[a-z0-9-]+\.)*p\.rapidapi\.com$/i;
if (!RAPIDAPI_HOST_ALLOWED.test(RAPIDAPI_HOST)) {
    throw new Error(`❌ RAPIDAPI_HOST "${RAPIDAPI_HOST}" is not an allowed RapidAPI host`);
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
// MAIN
// ============================================

export async function runSync() {
    console.log('🚀 Starting Udemy course sync...');
    const startTime = Date.now();

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
    return { syncedCount, elapsed };
}

async function main() {
    try {
        await runSync();
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