/**
 * real.discount scraper — pulls the course-deal feed from the site's
 * public JSON API (`cdn.real.discount/api/courses`, newest sales first).
 * Udemy rows with a `couponCode` URL become feed items via the shared
 * parser in lib/real-discount-api.
 */
import type { UdemyFeedItem } from '../lib/pipeline';
import { parseRealDiscountFeed } from '../lib/real-discount-api';
import { fetchJson, sleep } from './http';
import type { ScrapeOptions } from './discudemy';

const API_URL = 'https://cdn.real.discount/api/courses';
const PAGE_SIZE = 30;

export async function scrapeRealDiscount(
    options: ScrapeOptions
): Promise<UdemyFeedItem[]> {
    const items: UdemyFeedItem[] = [];
    const seenIds = new Set<string>();

    for (let page = 1; page <= options.maxPages; page++) {
        const url = `${API_URL}?page=${page}&limit=${PAGE_SIZE}&sortBy=sale_start&sortOrder=desc`;
        const payload = await fetchJson<unknown>(url);
        await sleep(options.sleepMs);
        if (!payload) break;

        const pageItems = parseRealDiscountFeed(payload);
        if (pageItems.length === 0) break;

        for (const item of pageItems) {
            if (items.length >= options.maxPosts) return items;
            if (seenIds.has(item.id)) continue;
            seenIds.add(item.id);
            items.push(item);
        }
    }

    return items;
}
