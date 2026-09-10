import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug.utils";
import { mapCategory } from './categories';
import {
    parsePrice,
    extractCoupon,
    buildAffiliateUrl,
    parseExpiry,
    isCouponValid,
} from './affiliate';
import { deriveCoupon } from './scrape-utils';
import { buildEnrichmentData, normalizeObjectives } from './enrichment';

export interface UdemyFeedItem {
    id: string;
    sku?: string;
    pic?: string;
    title: string;
    coupon: string;
    org_price?: string;
    coupon_price?: string | number;
    discount_percent?: number;
    desc_text?: string;
    category?: string;
    language?: string;
    platform?: string;
    rating?: number;
    rating_count?: number;
    students_count?: number;
    instructor_name?: string;
    headline?: string;
    duration?: number | string;
    objectives?: string[];
    expiry?: string;
    savedtime?: string;
    source?: string;
}

export async function getOrCreateUdemyPlatform(): Promise<string> {
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

export async function ensureUniqueSlug(slug: string): Promise<string> {
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

export async function syncItem(
    item: UdemyFeedItem,
    platformId: string,
    affiliateBase: string = process.env.IMPACT_AFFILIATE_BASE || ''
): Promise<boolean> {
    const externalId = String(item.id).trim();
    const title = item.title?.trim();

    if (!externalId || !title) {
        console.warn('  ⚠️ Skipping item with missing id/title:', JSON.stringify(item));
        return false;
    }

    const slug = generateSlug(title);
    const { directUrl, couponCode } = extractCoupon(item.coupon);

    if (!affiliateBase) {
        console.warn('  ⚠️ IMPACT_AFFILIATE_BASE is not set - courses will NOT be commissionable');
    }
    const affiliateUrl = buildAffiliateUrl(directUrl, couponCode, affiliateBase);

    const originalPrice = parsePrice(item.org_price);
    const couponPrice = parsePrice(
        typeof item.coupon_price === 'number'
            ? String(item.coupon_price)
            : item.coupon_price
    );
    const discountPercent =
        typeof item.discount_percent === 'number' ? item.discount_percent : null;
    const { discountValue, finalPrice } = deriveCoupon({
        originalPrice,
        couponPrice,
        discountPercent,
    });

    const baseData = {
        title,
        thumbnailUrl: item.pic || null,
        originalPrice,
        language: item.language || null,
        directUrl,
        affiliateUrl,
        lastVerifiedAt: new Date(),
        ...buildEnrichmentData(item),
    };

    const existing = await prisma.course.findUnique({
        where: { externalId },
        select: { id: true },
    });

    let courseId: string;

    if (existing) {
        await prisma.course.update({
            where: { id: existing.id },
            data: baseData,
        });
        courseId = existing.id;
        console.log(`  ♻️ Updated: ${title.substring(0, 50)}...`);
    } else {
        const categoryId = await mapCategory(item.category);

        const newCourse = await prisma.course.create({
            data: {
                externalId,
                slug: await ensureUniqueSlug(slug),
                headline: null,
                shortDescription: null,
                instructorBio: null,
                currency: 'USD',
                level: 'ALL_LEVELS',
                reviewCount: 0,
                studentCount: 0,
                lectureCount: null,
                isActive: true,
                isFeatured: false,
                isPosted: false,
                platformId,
                categoryId,
                ...baseData,
            },
        });
        courseId = newCourse.id;
        console.log(`  ✅ Created: ${title.substring(0, 50)}...`);
    }

    if (couponCode) {
        const expiresAt = parseExpiry(item.expiry);

        if (isCouponValid(expiresAt)) {
            await prisma.coupon.deleteMany({
                where: { courseId, isActive: true },
            });

            await prisma.coupon.create({
                data: {
                    code: couponCode,
                    discountType: 'PERCENTAGE',
                    discountValue,
                    finalPrice,
                    expiresAt,
                    isActive: true,
                    verifiedAt: item.savedtime ? new Date(item.savedtime) : new Date(),
                    source: item.source ?? 'udemy-api-sync',
                    courseId,
                },
            });
        } else {
            console.warn(`  ⚠️ Skipped expired/invalid coupon for "${title.substring(0, 50)}..." (expiry: ${item.expiry ?? 'unknown'})`);
        }
    }

    const objectives = normalizeObjectives(item.objectives);
    if (objectives.length > 0) {
        await prisma.courseLearningOutcome.deleteMany({
            where: { courseId },
        });
        await prisma.courseLearningOutcome.createMany({
            data: objectives.map((text, index) => ({
                courseId,
                text,
                sortOrder: index,
            })),
        });
    }

    return true;
}