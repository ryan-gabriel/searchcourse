/**
 * Udemy Course Sync Script
 *
 * 1. Fetches coupon list from RapidAPI Udemy Coupons endpoint
 * 2. For each new course, fetches course details
 * 3. Upserts courses into database using externalId for de-duplication
 * 4. Creates associated coupon records
 *
 * Environment Variables Required:
 * - DATABASE_URL
 * - RAPIDAPI_KEY
 * - RAPIDAPI_HOST
 * - IMPACT_AFFILIATE_BASE (optional)
 */

import axios from 'axios';
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug.utils";
import { mapCategory } from './lib/categories';

// ============================================
// TYPES
// ============================================

interface UdemyCouponItem {
    courseId: number;
    title: string;
    image: string;
    url: string;
    couponCode: string;
    discountPercentage: number;
    originalPrice: number;
    discountedPrice: number;
    validUntil: string;
    instructorName?: string;
    rating?: number;
    studentsCount?: number;
    category?: string;
}

interface UdemyCouponResponse {
    results: UdemyCouponItem[];
    totalPages: number;
    currentPage: number;
}

interface UdemyCourseDetail {
    title: string;
    headline?: string;
    description?: string;
    language?: string;
    instructorName?: string;
    instructorBio?: string;
    primaryCategory?: string;
    rating?: number;
    numReviews?: number;
    numStudents?: number;
    numLectures?: number;
    contentLength?: string;
    image?: string;
    url?: string;
}

// ============================================
// CONFIG
// ============================================

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'udemy-coupons1.p.rapidapi.com';
const IMPACT_AFFILIATE_BASE = process.env.IMPACT_AFFILIATE_BASE || '';
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://searchcourse.com';

if (!RAPIDAPI_KEY) {
    console.error('❌ RAPIDAPI_KEY environment variable is required');
    process.exit(1);
}

const apiHeaders = {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
};

// ============================================
// HELPERS
// ============================================

function buildAffiliateUrl(directUrl: string): string | null {
    if (!IMPACT_AFFILIATE_BASE) return null;
    const encodedUrl = encodeURIComponent(directUrl);
    return `${IMPACT_AFFILIATE_BASE}?u=${encodedUrl}`;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchCoupons(page: number = 1): Promise<UdemyCouponResponse> {
    const { data } = await axios.get(
        `https://${RAPIDAPI_HOST}/api/coupons.php`,
        {
            headers: apiHeaders,
            params: { page, store: 'Udemy' },
        }
    );
    return data;
}

async function fetchCourseDetails(courseId: number): Promise<UdemyCourseDetail | null> {
    try {
        const { data } = await axios.get(
            `https://${RAPIDAPI_HOST}/api/course.php`,
            {
                headers: apiHeaders,
                params: { courseId },
            }
        );
        return data;
    } catch (error) {
        console.warn(`⚠️ Failed to fetch details for course ${courseId}`, error);
        return null;
    }
}

// ============================================
// SYNC LOGIC
// ============================================

async function getOrCreateUdemyPlatform(): Promise<string> {
    const existing = await prisma.platform.findFirst({
        where: { slug: 'udemy' },
        select: { id: true },
    });

    if (existing) return existing.id;

    const created = await prisma.platform.create({
        data: {
            name: 'Udemy',
            slug: 'udemy',
            baseUrl: 'https://www.udemy.com',
            isActive: true,
        },
    });

    return created.id;
}

async function syncPage(page: number, platformId: string): Promise<number> {
    console.log(`📄 Fetching coupon page ${page}...`);
    const response = await fetchCoupons(page);

    if (!response.results || response.results.length === 0) {
        console.log('  No results on this page.');
        return 0;
    }

    let syncedCount = 0;

    for (const item of response.results) {
        try {
            const externalId = String(item.courseId);
            const slug = generateSlug(item.title);
            const directUrl = item.url.startsWith('http')
                ? item.url
                : `https://www.udemy.com${item.url}`;

            // Check if course already exists by externalId
            const existing = await prisma.course.findUnique({
                where: { externalId },
                select: { id: true },
            });

            let courseId: string;

            if (existing) {
                // Update existing course
                courseId = existing.id;
                await prisma.course.update({
                    where: { id: courseId },
                    data: {
                        title: item.title,
                        thumbnailUrl: item.image,
                        originalPrice: item.originalPrice,
                        rating: item.rating || undefined,
                        studentCount: item.studentsCount || 0,
                        instructorName: item.instructorName || undefined,
                        directUrl,
                        affiliateUrl: buildAffiliateUrl(directUrl),
                        lastVerifiedAt: new Date(),
                    },
                });
                console.log(`  ♻️ Updated: ${item.title.substring(0, 50)}...`);
            } else {
                // Fetch extended details for new courses
                let details: UdemyCourseDetail | null = null;
                await sleep(300); // Rate limit courtesy
                details = await fetchCourseDetails(item.courseId);

                const categoryId = await mapCategory(
                    details?.primaryCategory || item.category
                );

                // Create new course
                const newCourse = await prisma.course.create({
                    data: {
                        externalId,
                        title: item.title,
                        slug: await ensureUniqueSlug(slug),
                        description: details?.description || null,
                        shortDescription: null,
                        headline: details?.headline || null,
                        instructorName: details?.instructorName || item.instructorName || null,
                        instructorBio: details?.instructorBio || null,
                        thumbnailUrl: details?.image || item.image || null,
                        language: details?.language || null,
                        originalPrice: item.originalPrice,
                        currency: 'USD',
                        level: 'ALL_LEVELS',
                        rating: details?.rating || item.rating || null,
                        reviewCount: details?.numReviews || 0,
                        studentCount: details?.numStudents || item.studentsCount || 0,
                        duration: details?.contentLength || null,
                        lectureCount: details?.numLectures || null,
                        directUrl,
                        affiliateUrl: buildAffiliateUrl(directUrl),
                        isActive: true,
                        isFeatured: false,
                        isPosted: false,
                        platformId,
                        categoryId,
                    },
                });

                courseId = newCourse.id;
                console.log(`  ✅ Created: ${item.title.substring(0, 50)}...`);
            }

            // Upsert coupon if coupon code exists
            if (item.couponCode) {
                const expiresAt = item.validUntil
                    ? new Date(item.validUntil)
                    : null;

                // Delete old expired coupons for this course
                await prisma.coupon.deleteMany({
                    where: {
                        courseId,
                        isActive: true,
                        code: { not: item.couponCode },
                    },
                });

                // Create or update the coupon
                await prisma.coupon.upsert({
                    where: {
                        id: `${courseId}-${item.couponCode}`, // Use composite for upsert
                    },
                    update: {
                        discountValue: item.discountPercentage,
                        finalPrice: item.discountedPrice,
                        expiresAt,
                        isActive: true,
                        verifiedAt: new Date(),
                    },
                    create: {
                        code: item.couponCode,
                        discountType: 'PERCENTAGE',
                        discountValue: item.discountPercentage,
                        finalPrice: item.discountedPrice,
                        expiresAt,
                        isActive: true,
                        source: 'udemy-api-sync',
                        courseId,
                    },
                });
            }

            syncedCount++;
        } catch (error) {
            console.error(`  ❌ Failed to sync: ${item.title?.substring(0, 50)}`, error);
        }
    }

    return syncedCount;
}

async function ensureUniqueSlug(slug: string): Promise<string> {
    let candidate = slug;
    let counter = 0;

    while (true) {
        const existing = await prisma.course.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });

        if (!existing) return candidate;

        counter++;
        candidate = `${slug}-${counter}`;
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('🚀 Starting Udemy course sync...');
    const startTime = Date.now();

    try {
        const platformId = await getOrCreateUdemyPlatform();
        console.log(`📦 Using platform ID: ${platformId}`);

        let totalSynced = 0;
        const maxPages = 5; // Limit pages per run to avoid excessive API calls

        for (let page = 1; page <= maxPages; page++) {
            const synced = await syncPage(page, platformId);
            totalSynced += synced;

            if (synced === 0) break; // No more results

            await sleep(1000); // Rate limit between pages
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Sync complete! ${totalSynced} courses processed in ${elapsed}s`);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
