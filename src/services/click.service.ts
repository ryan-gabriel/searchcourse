/**
 * Click Service
 *
 * Analytics and tracking for affiliate click events.
 */

import prisma from '@/lib/prisma';
import type { ClickCreateInput, EventsSearchParams } from '@/validations';

/**
 * Record a click event
 */
export async function recordClick(data: ClickCreateInput) {
    return prisma.clickEvent.create({ data });
}

/**
 * List click events with pagination (admin analytics)
 */
export async function listClickEvents({ page, limit }: EventsSearchParams) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        prisma.clickEvent.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        }),
        prisma.clickEvent.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: events,
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