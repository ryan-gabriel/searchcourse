/**
 * Playwright-based browser probe for Udemy coupon pages.
 *
 * Loads a coupon URL in a real browser, lazy-scrolls to render the buy-box,
 * and captures the DOM signals that the pure classification layer in
 * `verifyCoupon.ts` turns into a verdict.
 *
 * One browser + page are reused across coupons so the bot-protection
 * challenge is passed once; the class is instantiated via `openUdemyProbe`.
 */

import { chromium } from "@playwright/test";
import type { ProbeSnapshot } from "./verifyCoupon";

interface BuyBoxSelectors {
    buyBox: string;
    couponBanner: string;
    prices: string;
}

export interface UdemyProbeOptions {
    timeoutMs?: number;
    pollIntervalMs?: number;
    selectors?: Partial<BuyBoxSelectors>;
}

const DEFAULT_SELECTORS: BuyBoxSelectors = {
    buyBox: [
        '[data-purpose="buy-box"]',
        '[data-purpose="price-text-container"]',
        '[data-purpose="course-price-text"]',
    ].join(","),
    couponBanner: '[data-purpose="coupon-banner"]',
    prices: [
        '[data-purpose="price"]',
        '[data-purpose="discount-price"]',
    ].join(","),
};

interface DomRead {
    title: string;
    textLen: number;
    blockedish: boolean;
    hasBuyBox: boolean;
    bannerText: string | null;
    prices: string[];
    bodySnippet: string;
}

function readDom(selectors: BuyBoxSelectors): DomRead {
    const clean = (el: Element | null | undefined): string =>
        el ? el.textContent?.replace(/\s+/g, " ").trim() ?? "" : "";

    const buyBox = document.querySelector(selectors.buyBox);
    const banner = document.querySelector(selectors.couponBanner);
    const prices = Array.from(document.querySelectorAll(selectors.prices))
        .map(clean)
        .filter(Boolean);

    const bodySnippet = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 3000);
    const textLen = bodySnippet.length;

    const blockedish =
        /just a moment|attention required|access denied|access denied|checking your browser/i.test(
            document.title + " " + bodySnippet.slice(0, 300),
        ) || textLen < 50;

    return {
        title: document.title,
        textLen,
        blockedish,
        hasBuyBox: !!buyBox,
        bannerText: banner ? clean(banner) || null : null,
        prices,
        bodySnippet: bodySnippet ? bodySnippet : "",
    };
}

async function lazyScroll(page: import("@playwright/test").Page): Promise<void> {
    const hasBox = await page
        .locator(
            '[data-purpose="buy-box"],[data-purpose="price-text-container"],[data-purpose="course-price-text"]',
        )
        .count()
        .catch(() => 0);
    if (hasBox) return;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
}

async function launchBrowser(): Promise<import("@playwright/test").Browser> {
    const channel = process.env.VERIFY_BROWSER_CHANNEL || "chrome";
    const headless = process.env.VERIFY_HEADLESS !== "false";
    if (channel !== "none") {
        try {
            return await chromium.launch({ headless, channel });
        } catch {
            // Fall through to the bundled Playwright Chromium (e.g. CI).
        }
    }
    return chromium.launch({ headless });
}

export async function openUdemyProbe(
    opts: UdemyProbeOptions = {},
): Promise<{ fetchState: (url: string) => Promise<ProbeSnapshot>; close: () => Promise<void> }> {
    const timeoutMs = opts.timeoutMs ?? Number(process.env.VERIFY_TIMEOUT_MS || 25000);
    const pollIntervalMs = opts.pollIntervalMs ?? 2000;
    const selectors = { ...DEFAULT_SELECTORS, ...opts.selectors };

    const browser = await launchBrowser();
    const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
        locale: "en-US",
    });

    async function fetchState(url: string): Promise<ProbeSnapshot> {
        const deadline = Date.now() + timeoutMs;
        let blocked = false;
        let last: DomRead | null = null;

        try {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
            await lazyScroll(page);

            while (Date.now() < deadline) {
                last = await page.evaluate((s) => readDom(s), selectors);
                if (last.blockedish) {
                    blocked = true;
                    break;
                }
                if (last.hasBuyBox) {
return toSnapshot(last as DomRead, blocked);
                }
                await page.waitForTimeout(pollIntervalMs);
                await lazyScroll(page);
            }
        } catch {
            blocked = true;
        }

        if (!last) {
            try {
                last = await page.evaluate((s) => readDom(s), selectors);
            } catch {
                return { loaded: false, blocked: true, prices: [], bannerText: null, bodySnippet: "" };
            }
        }

        return toSnapshot(last, blocked);
    }

    function toSnapshot(dom: DomRead, blocked: boolean): ProbeSnapshot {
        return {
            loaded: dom.hasBuyBox || dom.prices.length > 0 || !!dom.bannerText,
            blocked: blocked || dom.blockedish,
            prices: dom.prices,
            bannerText: dom.bannerText,
            bodySnippet: dom.bodySnippet,
        };
    }

    return {
        fetchState,
        close: async () => {
            await page.close().catch(() => {});
            await browser.close().catch(() => {});
        },
    };
}