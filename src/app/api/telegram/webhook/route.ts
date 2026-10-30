/**
 * Telegram Bot Webhook
 *
 * Receives direct messages sent to the bot and stores them as feedback.
 * Registered with setWebhook (see src/jobs/telegram-setup.ts) using
 * TELEGRAM_WEBHOOK_SECRET, which Telegram echoes in the
 * X-Telegram-Bot-Api-Secret-Token header.
 *
 * Commands:
 *   /start              - usage help
 *   /review <text>      - a review
 *   /suggest <text>     - a suggestion
 *   <plain text>        - treated as a suggestion
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { createFeedback } from '@/services';
import { isTelegramWebhookAuthorized } from '@/lib/telegram-auth';
import { sendTelegramMessage } from '@/lib/telegram-api';
import {
    isTelegramStartCommand,
    parseTelegramFeedback,
    TELEGRAM_FEEDBACK_MAX_LENGTH,
    TELEGRAM_FEEDBACK_MIN_LENGTH,
} from '@/lib/telegram-feedback';
import { rateLimiters } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const USAGE =
    'Send a review with /review <text> or a suggestion with /suggest <text>. ' +
    'You can also send a plain message and we will treat it as a suggestion.';

interface TelegramUser {
    id: number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
}

interface TelegramChat {
    id: number;
    type: string;
}

interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    text?: string;
}

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

function ok() {
    return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
    if (!isTelegramWebhookAuthorized(request.headers.get('x-telegram-bot-api-secret-token'))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update = (await request.json().catch(() => null)) as TelegramUpdate | null;

    if (!update || typeof update.update_id !== 'number') {
        return ok();
    }

    const message = update.message;
    if (!message?.text || !message.from || message.from.is_bot) {
        return ok();
    }

    // Only accept private chats so the bot does not ingest group chatter.
    if (message.chat.type !== 'private') {
        return ok();
    }

    const chatId = String(message.chat.id);

    if (isTelegramStartCommand(message.text)) {
        await sendTelegramMessage(chatId, `Hi! Help us improve SearchCourse.\n\n${USAGE}`);
        return ok();
    }

    const parsed = parseTelegramFeedback(message.text);
    if (!parsed) {
        await sendTelegramMessage(
            chatId,
            `Please send between ${TELEGRAM_FEEDBACK_MIN_LENGTH} and ${TELEGRAM_FEEDBACK_MAX_LENGTH} characters.\n\n${USAGE}`
        );
        return ok();
    }

    const rateLimitResult = rateLimiters.feedback(`tg:${message.from.id}`);
    if (!rateLimitResult.success) {
        await sendTelegramMessage(chatId, 'You are sending messages too quickly. Please try again in a minute.');
        return ok();
    }

    const name =
        [message.from.first_name, message.from.last_name].filter(Boolean).join(' ').trim() || null;

    try {
        await createFeedback({
            type: parsed.type,
            message: parsed.text,
            name,
            email: null,
            pageUrl: null,
            source: 'TELEGRAM',
            telegramUserId: String(message.from.id),
            telegramUsername: message.from.username ?? null,
            telegramChatId: chatId,
            telegramUpdateId: String(update.update_id),
        });
    } catch (error) {
        // Telegram retries webhooks; the unique update id makes replays safe.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return ok();
        }
        console.error('Failed to store Telegram feedback:', error);
        await sendTelegramMessage(chatId, 'Sorry, we could not save that message. Please try again later.');
        return ok();
    }

    await sendTelegramMessage(
        chatId,
        parsed.type === 'REVIEW'
            ? 'Thanks for the review! It helps us keep the deals useful.'
            : 'Thanks for the suggestion! We read every message.'
    );

    return ok();
}
