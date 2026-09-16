/**
 * Click Service
 *
 * Analytics and tracking for affiliate click events.
 */

import prisma from '@/lib/prisma';
import type { ClickCreateInput } from '@/validations';

/**
 * Record a click event
 */
export async function recordClick(data: ClickCreateInput) {
    return prisma.clickEvent.create({ data });
}