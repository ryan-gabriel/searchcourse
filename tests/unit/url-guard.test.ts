import { describe, expect, it } from 'vitest';
import { isSafeFetchUrl } from '@/jobs/lib/url-guard';

describe('isSafeFetchUrl', () => {
    it('allows the three scrape-source domains including www subdomains', () => {
        expect(isSafeFetchUrl('https://www.discudemy.com/all')).toBe(true);
        expect(isSafeFetchUrl('https://discudemy.com/all')).toBe(true);
        expect(isSafeFetchUrl('https://www.couponami.com/go/x')).toBe(true);
        expect(isSafeFetchUrl('https://www.tutorialbar.com/course/x')).toBe(true);
    });

    it('allows subdomains of the scrape-source domains', () => {
        expect(isSafeFetchUrl('https://api.couponami.com/v1')).toBe(true);
    });

    it('rejects unrelated hosts', () => {
        expect(isSafeFetchUrl('https://evil.example.com/')).toBe(false);
        expect(isSafeFetchUrl('https://udemy.com/course/x')).toBe(false);
        expect(isSafeFetchUrl('https://www.google.com/')).toBe(false);
    });

    it('rejects hostnames that merely resemble the allowlist', () => {
        expect(isSafeFetchUrl('https://discudemy.com.evil.example/')).toBe(false);
        expect(isSafeFetchUrl('https://notdiscudemy.com/')).toBe(false);
    });

    it('rejects IP literals and private/link-local ranges', () => {
        expect(isSafeFetchUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
        expect(isSafeFetchUrl('https://10.0.0.1/internal')).toBe(false);
        expect(isSafeFetchUrl('https://192.168.1.1/admin')).toBe(false);
        expect(isSafeFetchUrl('https://127.0.0.1/')).toBe(false);
        expect(isSafeFetchUrl('https://172.16.0.1/')).toBe(false);
    });

    it('rejects non-http(s) schemes and malformed URLs', () => {
        expect(isSafeFetchUrl('javascript:alert(1)')).toBe(false);
        expect(isSafeFetchUrl('file:///etc/passwd')).toBe(false);
        expect(isSafeFetchUrl('not-a-url')).toBe(false);
        expect(isSafeFetchUrl('')).toBe(false);
    });
});