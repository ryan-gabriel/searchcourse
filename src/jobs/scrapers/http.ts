import axios from 'axios';

export const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function fetchHtml(url: string): Promise<string | null> {
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

export async function followRedirects(
    startUrl: string,
    maxRedirects = 5
): Promise<string | null> {
    let url = startUrl;
    let remaining = maxRedirects;

    try {
        while (remaining-- > 0) {
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