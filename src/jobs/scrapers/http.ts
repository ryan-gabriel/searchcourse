import axios from 'axios';
import { isSafeFetchUrl } from '../lib/url-guard';

export const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function fetchHtml(url: string): Promise<string | null> {
    // SSRF guard: refuse to fetch anything outside the allowlisted scrape
    // sources before the HTTP request is made.
    if (!isSafeFetchUrl(url)) return null;
    try {
        const res = await axios.get<string>(url, {
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'text/html,application/xhtml+xml,application/json,*/*',
            },
            timeout: 20000,
            maxRedirects: 5,
        });
        if (res.status !== 200) return null;
        return typeof res.data === 'string' ? res.data : null;
    } catch {
        return null;
    }
}

export async function fetchJson<T>(url: string): Promise<T | null> {
    // Same SSRF guard as fetchHtml: JSON endpoints must be allowlisted too.
    if (!isSafeFetchUrl(url)) return null;
    try {
        const res = await axios.get<T>(url, {
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/json',
            },
            timeout: 20000,
            maxRedirects: 5,
        });
        if (res.status !== 200) return null;
        return res.data;
    } catch {
        return null;
    }
}

export async function postJson<T>(
    url: string,
    body: unknown
): Promise<T | null> {
    if (!isSafeFetchUrl(url)) return null;
    try {
        const res = await axios.post<T>(
            url,
            body,
            {
                headers: {
                    'User-Agent': USER_AGENT,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
                maxRedirects: 5,
            }
        );
        if (res.status !== 200) return null;
        return res.data;
    } catch {
        return null;
    }
}

export async function followRedirects(
    startUrl: string,
    maxRedirects = 5
): Promise<string | null> {
    let url = startUrl;
    let remaining = maxRedirects;

    try {
        while (remaining-- > 0) {
            // Each hop is validated against the scrape-source allowlist, so a
            // Location: header pointing anywhere off-platform is refused.
            if (!isSafeFetchUrl(url)) return null;
            const res = await axios.get(url, {
                headers: { 'User-Agent': USER_AGENT },
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400,
                timeout: 20000,
            });
            const location = res.headers.location;
            if (!location) return url;
            url = new URL(location, url).toString();
        }
        return url;
    } catch {
        return url !== startUrl ? url : null;
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}