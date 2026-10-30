/**
 * courson.xyz scraper — pages through the site's coupon feed
 * (`POST /load-more-coupons` with `{filters, offset}`) and maps the
 * embedded Udemy course records into feed items via lib/courson-api.
 */
import type { UdemyFeedItem } from '../lib/pipeline';
import { parseCoursonFeed } from '../lib/courson-api';
import { postJson, sleep } from './http';
import type { ScrapeOptions } from './discudemy';

const API_URL = 'https://courson.xyz/load-more-coupons';
const PAGE_SIZE = 30;

export async function scrapeCourson(
    options: ScrapeOptions
): Promise<UdemyFeedItem[]> {
    const items: UdemyFeedItem[] = [];
    const seenIds = new Set<string>();

    for (let page = 0; page < options.maxPages; page++) {
        const payload = await postJson<unknown>(API_URL, {
            filters: {},
            offset: page * PAGE_SIZE,
        });
        await sleep(options.sleepMs);
        if (!payload) break;

        const pageItems = parseCoursonFeed(payload);
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
