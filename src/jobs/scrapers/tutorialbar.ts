import * as cheerio from 'cheerio';
import type { UdemyFeedItem } from '../lib/pipeline';
import { findUdemyCouponUrl, extractCourseSlug } from '../lib/scrape-utils';
import { fetchHtml, followRedirects } from './http';
import type { ScrapeOptions } from './discudemy';

const LISTING_BASE = 'https://www.tutorialbar.com';

function parsePriceTag(text: string): number {
    const digits = text.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const value = parseFloat(digits);
    return Number.isFinite(value) && value > 0 ? value : 0;
}

export async function scrapeTutorialbar(
    options: ScrapeOptions
): Promise<UdemyFeedItem[]> {
    const items: UdemyFeedItem[] = [];
    const seenSlugs = new Set<string>();

    for (let page = 1; page <= options.maxPages; page++) {
        const pageUrl =
            page === 1
                ? `${LISTING_BASE}/all-courses/`
                : `${LISTING_BASE}/?page=${page}`;
        const html = await fetchHtml(pageUrl);
        if (!html) break;

        const $ = cheerio.load(html);
        const cards: {
            slug: string;
            title: string;
            pic: string | null;
            category: string | null;
            language: string | null;
            orgPrice: number;
        }[] = [];

        $('div.coupon-card').each((_, el) => {
            const card = $(el);
            const href =
                card.find('a[href^="/course/"]').first().attr('href') || '';
            const slug = href.replace(/^\/course\//, '').split(/[/?#]/)[0];
            const img = card.find('img').first();
            const title =
                card.find('h3').first().text().trim() ||
                img.attr('alt')?.trim() ||
                '';
            if (!slug || !title) return;

            const pic =
                img.attr('src') ||
                img.attr('data-src') ||
                img.attr('data-original') ||
                null;

            const category =
                card
                    .find('.badge-verified')
                    .closest('div')
                    .find('span')
                    .first()
                    .text()
                    .trim() || null;

            const language =
                card
                    .find('.flex.items-center.gap-3 span')
                    .last()
                    .text()
                    .trim() || null;

            const orgPrice = parsePriceTag(
                card.find('.price-original').first().text()
            );

            cards.push({ slug, title, pic, category, language, orgPrice });
        });

        if (cards.length === 0) break;

        for (const card of cards) {
            if (items.length >= options.maxPosts) return items;
            if (seenSlugs.has(card.slug)) continue;
            seenSlugs.add(card.slug);

            const goUrl = `${LISTING_BASE}/go/${encodeURIComponent(card.slug)}`;
            const resolved = await followRedirects(goUrl);

            let couponUrl = resolved ? findUdemyCouponUrl(resolved) : null;
            if (!couponUrl && resolved === goUrl) {
                const goHtml = await fetchHtml(goUrl);
                couponUrl = goHtml ? findUdemyCouponUrl(goHtml) : null;
            }

            const externalId = couponUrl ? extractCourseSlug(couponUrl) : null;
            if (!couponUrl || !externalId) continue;

            items.push({
                id: externalId,
                title: card.title || externalId,
                coupon: couponUrl,
                org_price: card.orgPrice > 0 ? String(card.orgPrice) : undefined,
                coupon_price: 0,
                discount_percent: 100,
                pic: card.pic || undefined,
                category: card.category || undefined,
                language: card.language ? card.language.toLowerCase() : undefined,
                platform: 'Udemy',
                savedtime: new Date().toISOString(),
                source: 'scraped:tutorialbar',
            });
        }
    }

    return items;
}