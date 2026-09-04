/**
 * Category Service
 * 
 * Business logic for category management.
 */

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type {
    CategoryCreateInput,
    CategoryUpdateInput,
    CategorySearchParams,
} from '@/validations';

// ============================================
// TYPES
// ============================================

export interface CategoryWithCounts {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconName: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        courses: number;
    };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Search categories with pagination
 */
export async function searchCategories(params: CategorySearchParams) {
    const { query, page, limit } = params;

    const where: Prisma.CategoryWhereInput = {};

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
        prisma.category.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            skip,
            take: limit,
            include: {
                _count: { select: { courses: true } },
            },
        }),
        prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: categories as CategoryWithCounts[],
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
 * Get all categories (for dropdowns)
 */
export async function getAllCategories() {
    return prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
            _count: { select: { courses: true } },
        },
    });
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            _count: { select: { courses: true } },
        },
    });
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
        where: { slug },
        include: {
            _count: { select: { courses: true } },
        },
    });
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function createCategory(data: CategoryCreateInput) {
    return prisma.category.create({ data });
}

export async function updateCategory({ id, ...data }: CategoryUpdateInput) {
    return prisma.category.update({
        where: { id },
        data,
    });
}

export async function deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
}

/**
 * Reorder categories
 */
export async function reorderCategories(
    categoryOrder: { id: string; sortOrder: number }[]
) {
    await prisma.$transaction(
        categoryOrder.map(({ id, sortOrder }) =>
            prisma.category.update({
                where: { id },
                data: { sortOrder },
            })
        )
    );
}
