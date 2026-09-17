/**
 * Course Service
 * 
 * Business logic for course management and search.
 * All database operations go through this service layer.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { activeCouponWhere } from '@/lib/prisma-helpers';
import { paginate, type Paginated } from '@/lib/pagination';
import type { CourseSearchParams } from '@/validations';

// ============================================
// TYPES
// ============================================

export interface CourseWithDetails {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    instructorName: string | null;
    thumbnailUrl: string | null;
    originalPrice: number;
    currency: string;
    rating: number | null;
    reviewCount: number;
    studentCount: number;
    duration: string | null;
    directUrl: string;
    affiliateUrl: string | null;
    isActive: boolean;
    isFeatured: boolean;
    isPosted: boolean;
    externalId: string | null;
    headline: string | null;
    language: string | null;
    lastVerifiedAt: Date;
    createdAt: Date;
    platform: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    activeCoupon: {
        id: string;
        code: string | null;
        discountValue: number;
        discountType: string;
        finalPrice: number;
        expiresAt: Date | null;
    } | null;
}

export type PaginatedResult<T> = Paginated<T>;

type CourseRow = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    instructorName: string | null;
    thumbnailUrl: string | null;
    originalPrice: unknown;
    currency: string;
    rating: unknown;
    reviewCount: number;
    studentCount: number;
    duration: string | null;
    directUrl: string;
    affiliateUrl: string | null;
    isActive: boolean;
    isFeatured: boolean;
    isPosted: boolean;
    externalId: string | null;
    headline: string | null;
    language: string | null;
    lastVerifiedAt: Date;
    createdAt: Date;
    platform: CourseWithDetails['platform'];
    category: CourseWithDetails['category'];
    coupons: {
        id: string;
        code: string | null;
        discountValue: unknown;
        discountType: string;
        finalPrice: unknown;
        expiresAt: Date | null;
    }[];
};

/**
 * Map a course row (with platform/category/active coupon included) to the
 * CourseWithDetails DTO. Single source for the Decimal -> number coercion and
 * activeCoupon shaping used by every course read path.
 */
function toCourseWithDetails(course: CourseRow): CourseWithDetails {
    const coupon = course.coupons[0];

    return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        instructorName: course.instructorName,
        thumbnailUrl: course.thumbnailUrl,
        originalPrice: Number(course.originalPrice),
        currency: course.currency,
        rating: course.rating ? Number(course.rating) : null,
        reviewCount: course.reviewCount,
        studentCount: course.studentCount,
        duration: course.duration,
        directUrl: course.directUrl,
        affiliateUrl: course.affiliateUrl,
        isActive: course.isActive,
        isFeatured: course.isFeatured,
        isPosted: course.isPosted,
        externalId: course.externalId,
        headline: course.headline,
        language: course.language,
        lastVerifiedAt: course.lastVerifiedAt,
        createdAt: course.createdAt,
        platform: course.platform,
        category: course.category,
        activeCoupon: coupon
            ? {
                id: coupon.id,
                code: coupon.code,
                discountValue: Number(coupon.discountValue),
                discountType: coupon.discountType,
                finalPrice: Number(coupon.finalPrice),
                expiresAt: coupon.expiresAt,
            }
            : null,
    };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Search courses with filtering, sorting, and pagination
 */
export async function searchCourses(
    params: CourseSearchParams & { isPosted?: boolean }
): Promise<PaginatedResult<CourseWithDetails>> {
    const {
        query,
        platform,   // slug-based for SEO
        category,   // slug-based for SEO
        minRating,
        maxPrice,
        hasDiscount,
        isFeatured,
        isPosted,
        page,
        limit,
        sortBy,
        sortOrder,
    } = params;

    // Build where clause
    const where: Prisma.CourseWhereInput = {
        isActive: true,
    };

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { instructorName: { contains: query, mode: 'insensitive' } },
        ];
    }

    // Use slug-based filtering via relations
    if (platform) where.platform = { slug: platform };
    if (category) where.category = { slug: category };
    if (minRating) where.rating = { gte: minRating };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isPosted !== undefined) where.isPosted = isPosted;

    // Filter by max price (considering active coupons)
    if (maxPrice !== undefined || hasDiscount) {
        where.coupons = {
            some: {
                ...activeCouponWhere(),
                ...(maxPrice !== undefined && { finalPrice: { lte: maxPrice } }),
            },
        };
    }

    // Build order by
    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    switch (sortBy) {
        case 'rating':
            orderBy.rating = sortOrder;
            break;
        case 'price':
            orderBy.originalPrice = sortOrder;
            break;
        case 'popular':
            orderBy.studentCount = sortOrder;
            break;
        case 'discount':
            // Sort by discount requires special handling
            orderBy.createdAt = sortOrder;
            break;
        case 'date':
        default:
            orderBy.createdAt = sortOrder;
    }

    // Execute query
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                platform: {
                    select: { id: true, name: true, slug: true, logoUrl: true },
                },
                category: {
                    select: { id: true, name: true, slug: true },
                },
                coupons: {
                    where: activeCouponWhere(),
                    orderBy: { discountValue: 'desc' },
                    take: 1,
                },
            },
        }),
        prisma.course.count({ where }),
    ]);

    // Transform response
    const data: CourseWithDetails[] = courses.map(toCourseWithDetails);

    return paginate(data, page, limit, total);
}

/**
 * Get a single course by slug
 */
export async function getCourseBySlug(
    slug: string
): Promise<CourseWithDetails | null> {
    const course = await prisma.course.findUnique({
        where: { slug, isActive: true },
        include: {
            platform: {
                select: { id: true, name: true, slug: true, logoUrl: true },
            },
            category: {
                select: { id: true, name: true, slug: true },
            },
            coupons: {
                where: activeCouponWhere(),
                orderBy: { discountValue: 'desc' },
                take: 1,
            },
        },
    });

    if (!course) return null;

    return toCourseWithDetails(course);
}

/**
 * Get a course by ID (for redirect)
 */
export async function getCourseById(id: string) {
    return prisma.course.findUnique({
        where: { id },
        select: {
            id: true,
            directUrl: true,
            affiliateUrl: true,
            externalId: true,
            headline: true,
            language: true,
            isPosted: true,
            coupons: {
                where: activeCouponWhere(),
                orderBy: { discountValue: 'desc' },
                take: 1,
                select: { code: true },
            },
        },
    });
}

/**
 * Get featured courses for homepage
 */
export async function getFeaturedCourses(limit: number = 8) {
    return searchCourses({
        isFeatured: true,
        page: 1,
        limit,
        sortBy: 'rating',
        sortOrder: 'desc',
    });
}

/**
 * Get courses with best discounts
 */
export async function getTopDiscountCourses(limit: number = 8) {
    return searchCourses({
        hasDiscount: true,
        page: 1,
        limit,
        sortBy: 'discount',
        sortOrder: 'desc',
    });
}

/**
 * Get course with full details (for course detail page)
 * Includes learning outcomes
 */
export interface CourseLearningOutcomeDTO {
    id: string;
    text: string;
    sortOrder: number;
}

export interface CourseFullDetails extends CourseWithDetails {
    learningOutcomes: CourseLearningOutcomeDTO[];
}

export async function getCourseWithFullDetails(
    slug: string
): Promise<CourseFullDetails | null> {
    const courseInclude = {
        platform: {
            select: { id: true, name: true, slug: true, logoUrl: true },
        },
        category: {
            select: { id: true, name: true, slug: true },
        },
        coupons: {
            where: activeCouponWhere(),
            orderBy: { discountValue: 'desc' },
            take: 1,
        },
        learningOutcomes: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, text: true, sortOrder: true },
        },
    } satisfies Prisma.CourseInclude;

    const course = await prisma.course.findUnique({
        where: { slug, isActive: true },
        include: courseInclude,
    });

    if (!course) return null;

    // Type for the extended course with learning outcomes
    type CourseWithExtendedDetails = typeof course & {
        learningOutcomes: CourseLearningOutcomeDTO[];
    };
    const extendedCourse = course as CourseWithExtendedDetails;

    return {
        ...toCourseWithDetails(extendedCourse),
        learningOutcomes: extendedCourse.learningOutcomes,
    };
}
