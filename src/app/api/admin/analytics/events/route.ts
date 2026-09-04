/**
 * Analytics Events API Route
 * 
 * GET - List click events with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

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

        return NextResponse.json({
            data: events,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('Error fetching click events:', error);
        return NextResponse.json(
            { message: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}
