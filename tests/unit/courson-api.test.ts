import { describe, expect, it } from 'vitest';
import {
    buildCoursonCouponUrl,
    firstInstructorName,
    mapCoursonCoupon,
    parseCoursonFeed,
    parseCoursonInitialData,
} from '@/jobs/lib/courson-api';

const liveCoupon = {
    id: 6051745,
    id_name: 'ultimate-guide-to-canva-t-shirt-design-mastery-in-t-shirt',
    title: 'Ultimate Guide to Canva T-Shirt Design Mastery',
    headline: 'Effortless Design, Professional Results: T-Shirts Made Easy',
    description: '<p>Master the Art of T-Shirt Design &#8212; no experience!</p>',
    coupon_code: '8A2D8382A054C7DF45A9',
    coupon_discount_percent: 100,
    status_label: 'Live',
    campaign_type: 'instructor_coupon',
    image: 'https://img-c.udemycdn.com/course/480x270/6051745_d095.jpg',
    image_hq: 'https://img-c.udemycdn.com/course/750x422/6051745_d095.jpg',
    primary_category: 'Design',
    language: 'English',
    rating: 4,
    num_reviews: 91,
    num_subscribers: 21627,
    content_info_short: '4 hours',
    instructors: [
        { 'James Joab Soren': 'https://www.udemy.com/user/james-joab-soren/' },
    ],
    objectives: [
        'Design trends and inspiration for t-shirts.',
        'Tips for creating mockups.',
    ],
    created_date: 'Mon, 01 Jul 2024 06:49:54 GMT',
};

describe('mapCoursonCoupon', () => {
    it('maps a Live coupon row to a feed item', () => {
        const item = mapCoursonCoupon(liveCoupon);
        expect(item).not.toBeNull();
        expect(item?.id).toBe(
            'ultimate-guide-to-canva-t-shirt-design-mastery-in-t-shirt'
        );
        expect(item?.coupon).toBe(
            'https://www.udemy.com/course/ultimate-guide-to-canva-t-shirt-design-mastery-in-t-shirt/?couponCode=8A2D8382A054C7DF45A9'
        );
        expect(item?.discount_percent).toBe(100);
        expect(item?.coupon_price).toBe(0);
        expect(item?.pic).toBe(liveCoupon.image_hq);
        expect(item?.category).toBe('Design');
        expect(item?.language).toBe('english');
        expect(item?.headline).toBe(liveCoupon.headline);
        expect(item?.instructor_name).toBe('James Joab Soren');
        expect(item?.duration).toBe('4 hours');
        expect(item?.rating).toBe(4);
        expect(item?.rating_count).toBe(91);
        expect(item?.students_count).toBe(21627);
        expect(item?.objectives).toHaveLength(2);
        expect(item?.source).toBe('scraped:courson');
        expect(item?.savedtime).toBe(new Date(liveCoupon.created_date).toISOString());
        expect(item?.desc_text).toBe(
            'Master the Art of T-Shirt Design — no experience!'
        );
    });

    it('drops expired/non-Live rows', () => {
        expect(
            mapCoursonCoupon({ ...liveCoupon, status_label: 'Expired' })
        ).toBeNull();
        expect(mapCoursonCoupon({ ...liveCoupon, status_label: 'Ended' })).toBeNull();
    });

    it('drops rows missing the slug or coupon code', () => {
        expect(mapCoursonCoupon({ ...liveCoupon, coupon_code: '' })).toBeNull();
        expect(mapCoursonCoupon({ ...liveCoupon, coupon_code: undefined })).toBeNull();
        expect(mapCoursonCoupon({ ...liveCoupon, id_name: undefined })).toBeNull();
        expect(mapCoursonCoupon({ ...liveCoupon, title: '   ' })).toBeNull();
    });

    it('drops partial discounts (feed is 100%-off only)', () => {
        expect(
            mapCoursonCoupon({ ...liveCoupon, coupon_discount_percent: 95 })
        ).toBeNull();
    });

    it('defaults missing discount percent to 100', () => {
        expect(
            mapCoursonCoupon({ ...liveCoupon, coupon_discount_percent: undefined })
                ?.discount_percent
        ).toBe(100);
    });

    it('falls back to the small image when image_hq is missing', () => {
        const item = mapCoursonCoupon({ ...liveCoupon, image_hq: undefined });
        expect(item?.pic).toBe(liveCoupon.image);
    });
});

describe('firstInstructorName', () => {
    it('extracts the first key from single-entry objects', () => {
        expect(
            firstInstructorName([{ 'A B': 'url' }, { 'C D': 'url' }])
        ).toBe('A B');
        expect(firstInstructorName(['Plain Name'])).toBe('Plain Name');
        expect(firstInstructorName([])).toBeNull();
        expect(firstInstructorName('nope')).toBeNull();
        expect(firstInstructorName([{}])).toBeNull();
    });
});

describe('buildCoursonCouponUrl', () => {
    it('builds a Udemy coupon URL and rejects empty slugs', () => {
        expect(buildCoursonCouponUrl('some-course', 'CODE1')).toBe(
            'https://www.udemy.com/course/some-course/?couponCode=CODE1'
        );
        expect(buildCoursonCouponUrl('', 'CODE')).toBeNull();
    });
});

describe('parseCoursonFeed', () => {
    it('maps the coupons array and dedupes', () => {
        const payload = { coupons: [liveCoupon, liveCoupon], total_count: 1 };
        expect(parseCoursonFeed(payload)).toHaveLength(1);
    });

    it('tolerates malformed payloads', () => {
        expect(parseCoursonFeed(null)).toEqual([]);
        expect(parseCoursonFeed({ coupons: 'nope' })).toEqual([]);
    });
});

describe('parseCoursonInitialData', () => {
    it('decodes the embedded [pageOfCoupons, total] blob', () => {
        const html = `<html><script id="initial-coupons-data" type="application/json">${JSON.stringify(
            [[liveCoupon], 411]
        )}</script></html>`;
        const rows = parseCoursonInitialData(html);
        expect(rows).toHaveLength(1);
        expect(rows[0].coupon_code).toBe('8A2D8382A054C7DF45A9');
    });

    it('returns [] when the script blob is absent or broken', () => {
        expect(parseCoursonInitialData('<html></html>')).toEqual([]);
        expect(
            parseCoursonInitialData(
                '<script id="initial-coupons-data" type="application/json">not json</script>'
            )
        ).toEqual([]);
    });
});
