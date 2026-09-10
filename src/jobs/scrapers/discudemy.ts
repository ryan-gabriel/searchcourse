import * as cheerio from 'cheerio';
import type { UdemyFeedItem } from '../lib/pipeline';
import {
    findUdemyCouponUrl,
    extractCourseSlug,
    extractCouponamiDescription,
} from '../lib/scrape-utils';
import { fetchHtml, sleep } from './http';

export interface ScrapeOptions {
    maxPages: number;
    maxPosts: number;
    sleepMs: number;
}

const LISTING_BASE = 'https://www.discudemy.com';
const POST_BASE = 'https://www.couponami.com';
const GO_BASE = 'https://www.couponami.com/go';

export function isDiscudemyCardExpired(cardText: string): boolean {
    return /expired|ended/i.test(cardText);
}

function lastSlug(url: string): string | null {
    try {
        const segments = new URL(url).pathname.split('/').filter(Boolean);
        return segments[segments.length - 1] ?? null;
    } catch {
        return null;
    }
}

function parseMetaPrice(metaHtml: string): number {
    const match = metaHtml.match(/\$\s*([\d.,]+)\s*->\s*\$\s*([\d.,]+)/);
    if (match) {
        const original = parseFloat(match[1].replace(/,/g, ''));
        if (Number.isFinite(original) && original > 0) return original;
    }
    const list = metaHtml.match(/\$\s*([\d.,]+)/);
    if (!list) return 0;
    return parseFloat(list[1].replace(/,/g, ''));
}

async function resolveCouponUrl(
    postUrl: string,
    sleepMs: number
): Promise<{ couponUrl: string | null; postHtml: string | null }> {
    const slug = lastSlug(postUrl);
    if (slug) {
        const goHtml = await fetchHtml(`${GO_BASE}/${encodeURIComponent(slug)}`);
        await sleep(sleepMs);
        const direct = goHtml ? findUdemyCouponUrl(goHtml) : null;
        if (direct) return { couponUrl: direct, postHtml: null };
    }

    const postHtml = await fetchHtml(postUrl);
    await sleep(sleepMs);
    if (!postHtml) return { couponUrl: null, postHtml: null };

    const $post = cheerio.load(postHtml);
    const goHref = $post('a.discBtn[href*="/go/"]').first().attr('href') || null;
    if (goHref) {
        const resolved = /^https?:\/\//.test(goHref) ? goHref : `${POST_BASE}${goHref}`;
        const goHtml = await fetchHtml(resolved);
        await sleep(sleepMs);
        const direct = goHtml ? findUdemyCouponUrl(goHtml) : null;
        if (direct) return { couponUrl: direct, postHtml };
    }

    return { couponUrl: findUdemyCouponUrl(postHtml), postHtml };
}

export async function scrapeDiscudemy(
    options: ScrapeOptions
): Promise<UdemyFeedItem[]> {
    const items: UdemyFeedItem[] = [];
    const seenSlugs = new Set<string>();

    for (let page = 1; page <= options.maxPages; page++) {
        const pageUrl =
            page === 1 ? `${LISTING_BASE}/all` : `${LISTING_BASE}/all/${page}`;
        const html = await fetchHtml(pageUrl);
        if (!html) break;

        const $ = cheerio.load(html);
        const cards: {
            url: string;
            title: string;
            pic: string | null;
            category: string | null;
            language: string | null;
            orgPrice: number;
        }[] = [];

        $('section.card').each((_, el) => {
            const card = $(el);
            if (isDiscudemyCardExpired(card.text())) return;
            const titleEl = card.find('a.card-header').first();
            const title = titleEl.text().trim();
            const href = titleEl.attr('href') || '';
            if (!href || !title) return;

            const img = card.find('img').first();
            const pic =
                img.attr('src') ||
                img.attr('data-src') ||
                img.attr('data-original') ||
                null;

            const language =
                card.find('label.disc-fee').first().text().trim() || null;
            const category =
                card.find('span.catSpan').first().text().trim() || null;

            const meta = card.find('span[style*="float:right"]').first().text();
            const orgPrice = parseMetaPrice(meta);

            cards.push({ url: href, title, pic, category, language, orgPrice });
        });

        if (cards.length === 0) break;

        for (const card of cards) {
            if (items.length >= options.maxPosts) return items;

            const slug = lastSlug(card.url);
            if (!slug || seenSlugs.has(slug)) continue;
            seenSlugs.add(slug);

            const { couponUrl, postHtml: resolvedPostHtml } =
                await resolveCouponUrl(card.url, options.sleepMs);
            const externalId = couponUrl ? extractCourseSlug(couponUrl) : null;
            if (!couponUrl || !externalId) continue;

            // The fast go-link path skips the post page; fetch it lazily so
            // every course still gets a chance at a full description.
            let postHtml = resolvedPostHtml;
            if (!postHtml) {
                try {
                    postHtml = await fetchHtml(card.url);
                    await sleep(options.sleepMs);
                } catch {
                    postHtml = null;
                }
            }

            const descText = postHtml
                ? extractCouponamiDescription(postHtml)
                : null;

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
                desc_text: descText || undefined,
                platform: 'Udemy',
                savedtime: new Date().toISOString(),
                source: 'scraped:discudemy',
            });
        }
    }

    return items;
}