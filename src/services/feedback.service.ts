/**
 * Feedback Service
 *
 * Business logic for storing and reading user-submitted reviews/suggestions
 * from the website and the Telegram bot.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { paginate } from '@/lib/pagination';
import type { FeedbackCreateInput, FeedbackSearchParams, FeedbackSource } from '@/validations';

export interface CreateFeedbackData extends FeedbackCreateInput {
    source: FeedbackSource;
    telegramUserId?: string | null;
    telegramUsername?: string | null;
    telegramChatId?: string | null;
    telegramUpdateId?: string | null;
}

/**
 * Store a new feedback submission.
 */
export async function createFeedback(data: CreateFeedbackData) {
    return prisma.feedback.create({ data });
}

/**
 * Search feedback with optional type/source filters and pagination.
 */
export async function searchFeedback(params: FeedbackSearchParams) {
    const { type, source, page, limit } = params;

    const where: Prisma.FeedbackWhereInput = {};
    if (type) where.type = type;
    if (source) where.source = source;

    const skip = (page - 1) * limit;

    const [feedback, total] = await Promise.all([
        prisma.feedback.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.feedback.count({ where }),
    ]);

    return paginate(feedback, page, limit, total);
}
