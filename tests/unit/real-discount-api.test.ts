import { describe, expect, it } from 'vitest';
import {
    mapRealDiscountCourse,
    normalizeSaleStart,
    parseRealDiscountFeed,
    stripDescriptionHtml,
} from '@/jobs/lib/real-discount-api';

const udemyRow = {
    id: 31126,
    name: 'Bash Shell Scripting Bootcamp: 10 Project-Based Learning',
    description:
        '<p>Welcome to the <strong>Bash Shell Scripting Bootcamp</strong>!</p><p>More &amp; more.</p>',
    price: 19.99,
    sale_price: 0,
    sale_start: '2026-10-29 06:09:33',
    lectures: 4,
    views: 7632,
    rating: 0,
    image: 'https://img-c.udemycdn.com/course/750x422/5400056_c543_7.jpg',
    url: 'https://www.udemy.com/course/bash-shell-scripting-bootcamp-10-project-based-learning/?couponCode=9D60F6B09816610BB67E',
    store: 'Udemy',
    type: 'external',
    slug: 'bash-shell-scripting-bootcamp-10-project-based-learning-31126',
    category: 'IT & Software',
    subcategory: 'Other IT & Software',
    language: 'English',
};

describe('mapRealDiscountCourse', () => {
    it('maps a Udemy 100%-off row to a feed item', () => {
        const item = mapRealDiscountCourse(udemyRow);
        expect(item).not.toBeNull();
        expect(item?.id).toBe('bash-shell-scripting-bootcamp-10-project-based-learning');
        expect(item?.title).toBe(udemyRow.name);
        expect(item?.coupon).toContain('couponCode=9D60F6B09816610BB67E');
        expect(item?.org_price).toBe('19.99');
        expect(item?.coupon_price).toBe('0');
        expect(item?.discount_percent).toBe(100);
        expect(item?.category).toBe('IT & Software');
        expect(item?.language).toBe('english');
        expect(item?.pic).toBe(udemyRow.image);
        expect(item?.platform).toBe('Udemy');
        expect(item?.source).toBe('scraped:real-discount');
        expect(item?.savedtime).toBe(new Date('2026-10-29T06:09:33Z').toISOString());
        expect(item?.desc_text).toBe(
            'Welcome to the Bash Shell Scripting Bootcamp ! More & more.'
        );
    });

    it('drops sponsored/ad rows', () => {
        expect(mapRealDiscountCourse({ ...udemyRow, type: 'ad' })).toBeNull();
        expect(
            mapRealDiscountCourse({ ...udemyRow, store: 'Sponsored', type: 'ad' })
        ).toBeNull();
    });

    it('drops non-Udemy stores', () => {
        expect(mapRealDiscountCourse({ ...udemyRow, store: 'Coursera' })).toBeNull();
    });

    it('drops rows without a Udemy couponCode URL', () => {
        expect(
            mapRealDiscountCourse({
                ...udemyRow,
                url: 'https://www.udemy.com/course/bash-shell-scripting/',
            })
        ).toBeNull();
        expect(
            mapRealDiscountCourse({
                ...udemyRow,
                url: 'https://example.com/offer?couponCode=ABC',
            })
        ).toBeNull();
        expect(mapRealDiscountCourse({ ...udemyRow, url: 'not a url' })).toBeNull();
    });

    it('drops rows without an advertised sale price', () => {
        expect(mapRealDiscountCourse({ ...udemyRow, sale_price: undefined })).toBeNull();
    });

    it('computes a discount percent for partial discounts', () => {
        const item = mapRealDiscountCourse({ ...udemyRow, price: 20, sale_price: 5 });
        expect(item?.discount_percent).toBe(75);
        expect(item?.coupon_price).toBe('5');
    });

    it('ignores zero ratings', () => {
        const item = mapRealDiscountCourse({ ...udemyRow, rating: 4.6 });
        expect(item?.rating).toBe(4.6);
        expect(mapRealDiscountCourse({ ...udemyRow, rating: 0 })?.rating).toBeUndefined();
    });
});

describe('normalizeSaleStart', () => {
    it('parses the space-separated UTC-ish format into ISO', () => {
        expect(normalizeSaleStart('2026-10-29 06:09:33')).toBe(
            new Date('2026-10-29T06:09:33Z').toISOString()
        );
    });

    it('returns null for missing or invalid input', () => {
        expect(normalizeSaleStart(undefined)).toBeNull();
        expect(normalizeSaleStart('garbage')).toBeNull();
    });
});

describe('stripDescriptionHtml', () => {
    it('removes tags, decodes entities, and collapses whitespace', () => {
        expect(
            stripDescriptionHtml('<p>Hello <strong>world</strong></p>\n<p>A &amp; B</p>')
        ).toBe('Hello world A & B');
    });

    it('returns null when nothing survives', () => {
        expect(stripDescriptionHtml('<p>   </p>')).toBeNull();
        expect(stripDescriptionHtml(undefined)).toBeNull();
    });
});

describe('parseRealDiscountFeed', () => {
    it('maps the items array and dedupes by course slug', () => {
        const payload = { items: [udemyRow, udemyRow, { ...udemyRow, type: 'ad' }] };
        const items = parseRealDiscountFeed(payload);
        expect(items).toHaveLength(1);
    });

    it('tolerates malformed payloads', () => {
        expect(parseRealDiscountFeed(null)).toEqual([]);
        expect(parseRealDiscountFeed({})).toEqual([]);
        expect(parseRealDiscountFeed({ items: 'nope' })).toEqual([]);
    });
});
