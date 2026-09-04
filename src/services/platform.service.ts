/**
 * Platform Service
 * 
 * Business logic for platform management.
 */

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type {
    PlatformCreateInput,
    PlatformUpdateInput,
    PlatformSearchParams,
} from '@/validations';

// ============================================
// TYPES
// ============================================

export interface PlatformWithCounts {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    baseUrl: string;
    isActive: boolean;
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
 * Search platforms with pagination
 */
export async function searchPlatforms(params: PlatformSearchParams) {
    const { query, isActive, page, limit } = params;

    const where: Prisma.PlatformWhereInput = {};

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [platforms, total] = await Promise.all([
        prisma.platform.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limit,
            include: {
                _count: { select: { courses: true } },
            },
        }),
        prisma.platform.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: platforms as PlatformWithCounts[],
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
 * Get all active platforms (for dropdowns)
 */
export async function getAllPlatforms() {
    return prisma.platform.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            _count: { select: { courses: { where: { isActive: true } } } },
        },
    });
}

/**
 * Get platform by ID
 */
export async function getPlatformById(id: string) {
    return prisma.platform.findUnique({
        where: { id },
        include: {
            _count: { select: { courses: true } },
        },
    });
}

/**
 * Get platform by slug
 */
export async function getPlatformBySlug(slug: string) {
    return prisma.platform.findUnique({
        where: { slug, isActive: true },
        select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            baseUrl: true,
        },
    });
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function createPlatform(data: PlatformCreateInput) {
    return prisma.platform.create({ data });
}

export async function updatePlatform({ id, ...data }: PlatformUpdateInput) {
    return prisma.platform.update({
        where: { id },
        data,
    });
}

export async function deletePlatform(id: string) {
    return prisma.platform.delete({ where: { id } });
}
