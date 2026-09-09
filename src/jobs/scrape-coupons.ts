/**
 * Free Udemy Coupon Scraper Job
 *
 * Pulls coupons (100% free AND discounted) from public coupon aggregator sites
 * and upserts them through the shared sync pipeline. No API keys or quotas.
 *
 * Environment Variables:
 * - DATABASE_URL
 * - SCRAPE_ENABLED_SOURCES (csv, default "discudemy,tutorialbar")
 * - SCRAPE_MAX_PAGES        (listing pages per source, default 10)
 * - SCRAPE_MAX_POSTS        (max posts processed per source, default 30)
 * - SCRAPE_SLEEP_MS         (delay between requests, default 300)
 * - SCRAPE_DRY_RUN          ("1" logs parsed items without writing to the DB)
 * - IMPACT_AFFILIATE_BASE   (optional; Impact deep-link prefix for commissions)
 */

import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";
import {
    getOrCreateUdemyPlatform,
    syncItem,
    type UdemyFeedItem,
} from './lib/pipeline';
import { scrapeDiscudemy } from './scrapers/discudemy';
import { scrapeTutorialbar } from './scrapers/tutorialbar';

const ENABLED_SOURCES = (process.env.SCRAPE_ENABLED_SOURCES || 'discudemy,tutorialbar')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const MAX_PAGES = parseInt(process.env.SCRAPE_MAX_PAGES || '10', 10);
const MAX_POSTS = parseInt(process.env.SCRAPE_MAX_POSTS || '30', 10);
const SLEEP_MS = parseInt(process.env.SCRAPE_SLEEP_MS || '300', 10);
const DRY_RUN = process.env.SCRAPE_DRY_RUN === '1';

const SCRAPERS: Record<string, (options: {
    maxPages: number;
    maxPosts: number;
    sleepMs: number;
}) => Promise<UdemyFeedItem[]>> = {
    discudemy: scrapeDiscudemy,
    tutorialbar: scrapeTutorialbar,
};

export async function runScrape() {
    console.log('🕷️  Starting free coupon scraper...');
    const startTime = Date.now();

    if (DRY_RUN) {
        console.log('🧪 DRY RUN mode - no rows will be written\n');
    }

    const platformId = DRY_RUN
        ? null
        : await getOrCreateUdemyPlatform();
    if (platformId) console.log(`📦 Using platform ID: ${platformId}`);

    let totalItems = 0;
    let totalSynced = 0;

    for (const source of ENABLED_SOURCES) {
        const scraper = SCRAPERS[source];
        if (!scraper) {
            console.warn(`  ⚠️ Unknown source "${source}" (ignored)`);
            continue;
        }

        console.log(`\n📥 Scraping ${source}...`);
        try {
            const items = await scraper({
                maxPages: MAX_PAGES,
                maxPosts: MAX_POSTS,
                sleepMs: SLEEP_MS,
            });

            console.log(`  Found ${items.length} coupon(s) from ${source}`);
            totalItems += items.length;

            if (DRY_RUN) {
                for (const item of items.slice(0, 15)) {
                    console.log(`    - ${item.title.substring(0, 70)}`);
                    console.log(`      ${item.coupon}`);
                    if (item.coupon_price !== undefined) {
                        console.log(`      coupon price: ${item.coupon_price}`);
                    }
                    if (item.discount_percent !== undefined) {
                        console.log(`      discount: ${item.discount_percent}%`);
                    }
                }
                continue;
            }

            for (const item of items) {
                try {
                    const ok = await syncItem(item, platformId as string);
                    if (ok) totalSynced++;
                } catch (error) {
                    console.error(`  ❌ Failed to sync: ${item?.title?.substring(0, 50)}`, error);
                }
            }
        } catch (error) {
            console.error(`  ❌ Scraper "${source}" failed:`, error);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    if (DRY_RUN) {
        console.log(`\n✅ Dry run complete! ${totalItems} coupon(s) parsed in ${elapsed}s`);
    } else {
        console.log(
            `\n✅ Scrape complete! ${totalSynced}/${totalItems} courses synced in ${elapsed}s`
        );
    }
    return { totalItems, totalSynced, elapsed, dryRun: DRY_RUN };
}

async function main() {
    try {
        await runScrape();
    } catch (error) {
        console.error('❌ Scrape failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}