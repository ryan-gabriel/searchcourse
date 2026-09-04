/**
 * Course Service
 * 
 * Business logic for course management and search.
 * All database operations go through this service layer.
 */

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { CourseSearchParams, CourseCreateInput, CourseUpdateInput } from '@/validations';

// ============================================
// TYPES
// ============================================

export interface CourseWithDetails {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    instructorName: string | null;
    thumbnailUrl: string | null;
    originalPrice: number;
    currency: string;
    level: string;
    rating: number | null;
    reviewCount: number;
    studentCount: number;
    duration: string | null;
    lectureCount: number | null;
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

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
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
        level,
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
    if (level) where.level = level;
    if (minRating) where.rating = { gte: minRating };
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isPosted !== undefined) where.isPosted = isPosted;

    // Filter by max price (considering active coupons)
    if (maxPrice !== undefined || hasDiscount) {
        where.coupons = {
            some: {
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
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
                    where: {
                        isActive: true,
                        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                    },
                    orderBy: { discountValue: 'desc' },
                    take: 1,
                },
            },
        }),
        prisma.course.count({ where }),
    ]);

    // Transform response
    const data: CourseWithDetails[] = courses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        instructorName: course.instructorName,
        thumbnailUrl: course.thumbnailUrl,
        originalPrice: Number(course.originalPrice),
        currency: course.currency,
        level: course.level,
        rating: course.rating ? Number(course.rating) : null,
        reviewCount: course.reviewCount,
        studentCount: course.studentCount,
        duration: course.duration,
        lectureCount: course.lectureCount,
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
        activeCoupon: course.coupons[0]
            ? {
                id: course.coupons[0].id,
                code: course.coupons[0].code,
                discountValue: Number(course.coupons[0].discountValue),
                discountType: course.coupons[0].discountType,
                finalPrice: Number(course.coupons[0].finalPrice),
                expiresAt: course.coupons[0].expiresAt,
            }
            : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
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
                where: {
                    isActive: true,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
                orderBy: { discountValue: 'desc' },
                take: 1,
            },
        },
    });

    if (!course) return null;

    return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        instructorName: course.instructorName,
        thumbnailUrl: course.thumbnailUrl,
        originalPrice: Number(course.originalPrice),
        currency: course.currency,
        level: course.level,
        rating: course.rating ? Number(course.rating) : null,
        reviewCount: course.reviewCount,
        studentCount: course.studentCount,
        duration: course.duration,
        lectureCount: course.lectureCount,
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
        activeCoupon: course.coupons[0]
            ? {
                id: course.coupons[0].id,
                code: course.coupons[0].code,
                discountValue: Number(course.coupons[0].discountValue),
                discountType: course.coupons[0].discountType,
                finalPrice: Number(course.coupons[0].finalPrice),
                expiresAt: course.coupons[0].expiresAt,
            }
            : null,
    };
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
                where: {
                    isActive: true,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
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
 * Includes learning outcomes and syllabus sections
 */
export interface CourseLearningOutcomeDTO {
    id: string;
    text: string;
    sortOrder: number;
}

export interface CourseSyllabusSectionDTO {
    id: string;
    title: string;
    duration: string | null;
    sortOrder: number;
    items: { id: string; title: string; sortOrder: number }[];
}

export interface CourseFullDetails extends CourseWithDetails {
    instructorBio: string | null;
    learningOutcomes: CourseLearningOutcomeDTO[];
    syllabusSections: CourseSyllabusSectionDTO[];
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
            where: {
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: { discountValue: 'desc' },
            take: 1,
        },
        learningOutcomes: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, text: true, sortOrder: true },
        },
        syllabusSections: {
            orderBy: { sortOrder: 'asc' },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    select: { id: true, title: true, sortOrder: true },
                },
            },
        },
    } satisfies Prisma.CourseInclude;

    const course = await prisma.course.findUnique({
        where: { slug, isActive: true },
        include: courseInclude,
    });

    if (!course) return null;

    // Type for the extended course with learning outcomes and syllabus
    type CourseWithExtendedDetails = typeof course & {
        instructorBio: string | null;
        learningOutcomes: CourseLearningOutcomeDTO[];
        syllabusSections: ({
            id: string;
            title: string;
            duration: string | null;
            sortOrder: number;
            items: { id: string; title: string; sortOrder: number }[];
        })[];
    };
    const extendedCourse = course as CourseWithExtendedDetails;

    return {
        id: extendedCourse.id,
        title: extendedCourse.title,
        slug: extendedCourse.slug,
        description: extendedCourse.description,
        shortDescription: extendedCourse.shortDescription,
        instructorName: extendedCourse.instructorName,
        instructorBio: extendedCourse.instructorBio,
        thumbnailUrl: extendedCourse.thumbnailUrl,
        originalPrice: Number(extendedCourse.originalPrice),
        currency: extendedCourse.currency,
        level: extendedCourse.level,
        rating: extendedCourse.rating ? Number(extendedCourse.rating) : null,
        reviewCount: extendedCourse.reviewCount,
        studentCount: extendedCourse.studentCount,
        duration: extendedCourse.duration,
        lectureCount: extendedCourse.lectureCount,
        directUrl: extendedCourse.directUrl,
        affiliateUrl: extendedCourse.affiliateUrl,
        isActive: extendedCourse.isActive,
        isFeatured: extendedCourse.isFeatured,
        isPosted: extendedCourse.isPosted,
        externalId: extendedCourse.externalId,
        headline: extendedCourse.headline,
        language: extendedCourse.language,
        lastVerifiedAt: extendedCourse.lastVerifiedAt,
        createdAt: extendedCourse.createdAt,
        platform: extendedCourse.platform,
        category: extendedCourse.category,
        activeCoupon: extendedCourse.coupons[0]
            ? {
                id: extendedCourse.coupons[0].id,
                code: extendedCourse.coupons[0].code,
                discountValue: Number(extendedCourse.coupons[0].discountValue),
                discountType: extendedCourse.coupons[0].discountType,
                finalPrice: Number(extendedCourse.coupons[0].finalPrice),
                expiresAt: extendedCourse.coupons[0].expiresAt,
            }
            : null,
        learningOutcomes: extendedCourse.learningOutcomes,
        syllabusSections: (extendedCourse.syllabusSections || []).map((section) => ({
            id: section.id,
            title: section.title,
            duration: section.duration,
            sortOrder: section.sortOrder,
            items: section.items,
        })),
    };
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function createCourse(data: CourseCreateInput) {
    return prisma.course.create({
        data: {
            ...data,
            originalPrice: new Prisma.Decimal(data.originalPrice),
            rating: data.rating ? new Prisma.Decimal(data.rating) : null,
        },
    });
}

export async function updateCourse({ id, ...data }: CourseUpdateInput) {
    return prisma.course.update({
        where: { id },
        data: {
            ...data,
            ...(data.originalPrice && {
                originalPrice: new Prisma.Decimal(data.originalPrice),
            }),
            ...(data.rating !== undefined && {
                rating: data.rating ? new Prisma.Decimal(data.rating) : null,
            }),
        },
    });
}

/**
 * Delete a course (soft delete preferrable, but hard delete for now)
 */
export async function deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
}

/**
 * Update course learning outcomes (Full Replace)
 */
export async function updateCourseLearningOutcomes(
    courseId: string,
    outcomes: { text: string; sortOrder: number }[]
) {
    return prisma.$transaction(async (tx) => {
        await tx.courseLearningOutcome.deleteMany({
            where: { courseId },
        });

        if (outcomes.length > 0) {
            await tx.courseLearningOutcome.createMany({
                data: outcomes.map((o) => ({
                    courseId,
                    text: o.text,
                    sortOrder: o.sortOrder,
                })),
            });
        }

        return tx.courseLearningOutcome.findMany({ where: { courseId }, orderBy: { sortOrder: 'asc' } });
    });
}

/**
 * Update course syllabus (Full Replace)
 */
export async function updateCourseSyllabus(
    courseId: string,
    sections: {
        title: string;
        duration?: string;
        sortOrder: number;
        items: { title: string; sortOrder: number }[];
    }[]
) {
    return prisma.$transaction(async (tx) => {
        await tx.courseSyllabusSection.deleteMany({
            where: { courseId },
        });

        for (const section of sections) {
            await tx.courseSyllabusSection.create({
                data: {
                    courseId,
                    title: section.title,
                    duration: section.duration,
                    sortOrder: section.sortOrder,
                    items: {
                        createMany: {
                            data: section.items.map((item) => ({
                                title: item.title,
                                sortOrder: item.sortOrder,
                            })),
                        },
                    },
                },
            });
        }

        return tx.courseSyllabusSection.findMany({
            where: { courseId },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' }
        });
    });
}
