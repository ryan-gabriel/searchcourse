/**
 * Coupon Service
 * 
 * Business logic for coupon management.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { notExpiredCouponClause } from '@/lib/prisma-helpers';
import { paginate } from '@/lib/pagination';
import type {
    CouponSearchParams,
    CouponCreateInput,
    CouponUpdateInput,
} from '@/validations';

// ============================================
// TYPES
// ============================================

export interface CouponWithCourse {
    id: string;
    code: string | null;
    discountType: string;
    discountValue: number;
    finalPrice: number;
    expiresAt: Date | null;
    isActive: boolean;
    source: string | null;
    verifiedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    course: {
        id: string;
        title: string;
        slug: string;
        originalPrice: number;
    };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Search coupons with pagination
 */
export async function searchCoupons(params: Partial<CouponSearchParams>) {
    const {
        query,
        courseId,
        isActive,
        minDiscount,
        notExpired,
        limit = 20,
        page = 1,
    } = params;

    const where: Prisma.CouponWhereInput = {};

    if (query) {
        where.OR = [
            { code: { contains: query, mode: 'insensitive' } },
            { course: { title: { contains: query, mode: 'insensitive' } } },
        ];
    }

    if (courseId) {
        where.courseId = courseId;
    }

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    if (minDiscount !== undefined) {
        where.discountValue = { gte: minDiscount };
    }

    if (notExpired !== false) {
        where.AND = [{ OR: notExpiredCouponClause() }];
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }],
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        originalPrice: true,
                    },
                },
            },
        }),
        prisma.coupon.count({ where }),
    ]);

    // Transform Decimal to number
    const data = coupons.map((c) => ({
        ...c,
        discountValue: Number(c.discountValue),
        finalPrice: Number(c.finalPrice),
        course: {
            ...c.course,
            originalPrice: Number(c.course.originalPrice),
        },
    })) as CouponWithCourse[];

    return paginate(data, page, limit, total);
}

/**
 * Get coupon by ID
 */
export async function getCouponById(id: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    originalPrice: true,
                },
            },
        },
    });

    if (!coupon) return null;

    return {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        finalPrice: Number(coupon.finalPrice),
        course: {
            ...coupon.course,
            originalPrice: Number(coupon.course.originalPrice),
        },
    } as CouponWithCourse;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function createCoupon(data: CouponCreateInput) {
    return prisma.coupon.create({ data });
}

export async function updateCoupon({ id, ...data }: CouponUpdateInput) {
    return prisma.coupon.update({
        where: { id },
        data,
    });
}

export async function deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
}
