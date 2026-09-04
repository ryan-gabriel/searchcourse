/**
 * Roadmap Service
 * 
 * Business logic for learning path management.
 */

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type {
    RoadmapSearchParams,
    RoadmapCreateInput,
    RoadmapUpdateInput,
    RoadmapStepCreateInput,
} from '@/validations';

// ============================================
// TYPES
// ============================================

export interface RoadmapWithSteps {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    iconName: string | null;
    estimatedHours: number | null;
    courseCount: number;
    isActive: boolean;
    isFeatured: boolean;
    totalOriginalPrice: number;
    totalDiscountedPrice: number;
    totalSavings: number;
    steps: RoadmapStepWithCourse[];
}

export interface RoadmapStepWithCourse {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl: string | null;
        originalPrice: number;
        instructorName: string | null;
        rating: number | null;
        duration: string | null;
        platform: {
            name: string;
            slug: string;
        };
        activeCoupon: {
            finalPrice: number;
            discountValue: number;
            code: string | null;
        } | null;
    };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Search roadmaps
 */
export async function searchRoadmaps(params: RoadmapSearchParams) {
    const {
        query,
        isActive,
        isFeatured,
        level,
        category,
        page,
        limit
    } = params;

    const where: Prisma.RoadmapWhereInput = {};

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (isActive !== undefined) where.isActive = isActive;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    // New filter fields
    if (level) where.level = level;
    if (category) where.category = { slug: category };

    const skip = (page - 1) * limit;

    const [roadmaps, total] = await Promise.all([
        prisma.roadmap.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            skip,
            take: limit,
            include: {
                _count: { select: { steps: true } },
                // @ts-ignore - Property exists in generated client
                category: { select: { id: true, name: true, slug: true } },
            },
        }),
        prisma.roadmap.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Define type for the roadmap with included relations
    type RoadmapWithCount = Awaited<ReturnType<typeof prisma.roadmap.findMany>>[number] & {
        _count: { steps: number };
        category?: { id: string; name: string; slug: string } | null;
    };

    return {
        data: (roadmaps as RoadmapWithCount[]).map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            subtitle: r.subtitle,
            description: r.description,
            iconName: r.iconName,
            estimatedHours: r.estimatedHours,
            courseCount: r._count.steps,
            level: r.level,
            skillTags: r.skillTags,
            hasJobGuarantee: r.hasJobGuarantee,
            hasCertificate: r.hasCertificate,
            hasFreeResources: r.hasFreeResources,
            isShortPath: r.isShortPath,
            category: r.category,
            isActive: r.isActive,
            isFeatured: r.isFeatured,
        })),
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
 * Get roadmap with all steps and course details
 */
export async function getRoadmapBySlug(
    slug: string
): Promise<RoadmapWithSteps | null> {
    const roadmap = await prisma.roadmap.findUnique({
        where: { slug, isActive: true },
        include: {
            steps: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    course: {
                        include: {
                            platform: {
                                select: { name: true, slug: true },
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
                    },
                },
            },
        },
    });

    if (!roadmap) return null;

    // Calculate totals
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;

    const steps: RoadmapStepWithCourse[] = roadmap.steps.map((step) => {
        const originalPrice = Number(step.course.originalPrice);
        const activeCoupon = step.course.coupons[0];
        const finalPrice = activeCoupon
            ? Number(activeCoupon.finalPrice)
            : originalPrice;

        totalOriginalPrice += originalPrice;
        totalDiscountedPrice += finalPrice;

        return {
            id: step.id,
            title: step.title,
            description: step.description,
            orderIndex: step.orderIndex,
            course: {
                id: step.course.id,
                title: step.course.title,
                slug: step.course.slug,
                thumbnailUrl: step.course.thumbnailUrl,
                originalPrice,
                instructorName: step.course.instructorName,
                rating: step.course.rating ? Number(step.course.rating) : null,
                duration: step.course.duration,
                platform: step.course.platform,
                activeCoupon: activeCoupon
                    ? {
                        finalPrice: Number(activeCoupon.finalPrice),
                        discountValue: Number(activeCoupon.discountValue),
                        code: activeCoupon.code,
                    }
                    : null,
            },
        };
    });

    return {
        id: roadmap.id,
        title: roadmap.title,
        slug: roadmap.slug,
        description: roadmap.description,
        iconName: roadmap.iconName,
        estimatedHours: roadmap.estimatedHours,
        courseCount: roadmap.courseCount,
        isActive: roadmap.isActive,
        isFeatured: roadmap.isFeatured,
        totalOriginalPrice,
        totalDiscountedPrice,
        totalSavings: totalOriginalPrice - totalDiscountedPrice,
        steps,
    };
}

/**
 * Get roadmap by ID with steps (for admin)
 */
export async function getRoadmapById(id: string) {
    const roadmap = await prisma.roadmap.findUnique({
        where: { id },
        include: {
            steps: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            thumbnailUrl: true,
                            originalPrice: true,
                            platform: {
                                select: { name: true },
                            },
                        },
                    },
                },
            },
        },
    });

    return roadmap;
}

/**
 * Get featured roadmaps for homepage
 */
export async function getFeaturedRoadmaps(limit: number = 4) {
    return searchRoadmaps({
        isFeatured: true,
        isActive: true,
        page: 1,
        limit,
    });
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function createRoadmap(data: RoadmapCreateInput) {
    return prisma.roadmap.create({ data });
}

export async function updateRoadmap({ id, ...data }: RoadmapUpdateInput) {
    return prisma.roadmap.update({ where: { id }, data });
}

export async function deleteRoadmap(id: string) {
    return prisma.roadmap.delete({ where: { id } });
}

export async function addRoadmapStep(data: RoadmapStepCreateInput) {
    const step = await prisma.roadmapStep.create({ data });

    // Update course count
    await prisma.roadmap.update({
        where: { id: data.roadmapId },
        data: { courseCount: { increment: 1 } },
    });

    return step;
}

export async function removeRoadmapStep(stepId: string) {
    // First get the step to find the roadmapId
    const step = await prisma.roadmapStep.findUnique({
        where: { id: stepId },
        select: { roadmapId: true },
    });

    if (!step) {
        throw new Error('Step not found');
    }

    await prisma.roadmapStep.delete({ where: { id: stepId } });

    // Update course count
    await prisma.roadmap.update({
        where: { id: step.roadmapId },
        data: { courseCount: { decrement: 1 } },
    });
}

export async function reorderRoadmapSteps(
    roadmapId: string,
    stepOrder: { id: string; orderIndex: number }[]
) {
    await prisma.$transaction(
        stepOrder.map(({ id, orderIndex }) =>
            prisma.roadmapStep.update({
                where: { id },
                data: { orderIndex },
            })
        )
    );
}
