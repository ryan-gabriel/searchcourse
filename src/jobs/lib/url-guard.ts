/**
 * URL guard for scraper HTTP fetches (SSRF mitigation).
 *
 * Scrapers read <a href> values and Location: redirect headers from
 * untrusted coupon-aggregator pages. Without guardrails, a malicious post
 * could point the production server at internal hosts (169.254.169.254,
 * RFC1918 ranges, local services). This module allowlists the scrape
 * sources and rejects private/link-local/loopback IP literals.
 */

const ALLOWED_FETCH_HOSTS = [
    'discudemy.com',
    'couponami.com',
    'tutorialbar.com',
];

// RFC1918, loopback, link-local, CGNAT, documentation, and multicast ranges
// as IP literals. Hostname allowlisting already blocks arbitrary hosts, but
// this defends against literal-IP bypasses if a future allowlist entry grows.
const BLOCKED_IP_LITERAL =
    /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|192\.0\.0\.|192\.0\.2\.|198\.18\.|198\.19\.|198\.51\.100\.|203\.0\.113\.|224\.|240\.|255\.)/;

function endsWithHost(hostname: string, domain: string): boolean {
    return (
        hostname === domain ||
        hostname.endsWith(`.${domain}`)
    );
}

export function isSafeFetchUrl(value: string): boolean {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return false;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    const host = url.hostname.toLowerCase();
    if (!ALLOWED_FETCH_HOSTS.some((domain) => endsWithHost(host, domain))) {
        return false;
    }
    if (BLOCKED_IP_LITERAL.test(host)) return false;

    return true;
}