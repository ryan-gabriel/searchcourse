/**
 * Public Feedback API Route
 *
 * POST - Store a website review or suggestion.
 *
 * Anonymous by design: name/email are optional, and the submission is
 * rate limited per IP. A hidden honeypot field silently absorbs bots.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFeedback } from '@/services';
import { FeedbackCreateSchema } from '@/validations';
import { rateLimiters, getRateLimitHeaders, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Honeypot: real users never see or fill this field. Pretend success so
    // bots do not learn the trap exists.
    const honeypot = (body as { website?: unknown }).website;
    if (typeof honeypot === 'string' && honeypot.trim()) {
        return NextResponse.json({ ok: true });
    }

    const parsed = FeedbackCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { message: 'Validation error', errors: parsed.error.issues },
            { status: 400 }
        );
    }

    const ip = getClientIp(request.headers);
    const rateLimitResult = rateLimiters.feedback(`web:${ip}`);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { message: 'Too many submissions. Please try again in a minute.' },
            { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
        );
    }

    try {
        await createFeedback({
            ...parsed.data,
            source: 'WEB',
        });

        return NextResponse.json(
            { ok: true },
            { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
        );
    } catch (error) {
        console.error('Failed to store feedback:', error);
        return NextResponse.json({ message: 'Failed to send feedback' }, { status: 500 });
    }
}
