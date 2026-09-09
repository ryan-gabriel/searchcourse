/**
 * Telegram Broadcast Script
 *
 * Queries for courses with isPosted = false that have active coupons,
 * formats a message for each, and sends to the configured Telegram chat.
 * Marks courses as isPosted = true after successful broadcast.
 *
 * Environment Variables Required:
 * - DATABASE_URL
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 * - SITE_BASE_URL
 */

import axios from 'axios';
import { pathToFileURL } from 'url';
import { BROADCAST } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatCourseMessage } from "@/lib/telegramFormat";
import { shouldBroadcastCoupon } from "@/lib/broadcastGuard";

// ============================================
// CONFIG
// ============================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required');
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Broadcast coupon guard (hours). Skip coupons expiring within
// BROADCAST_MIN_EXPIRY_HOURS, and coupons whose feed snapshot
// (verifiedAt = feed savedtime) is older than BROADCAST_MAX_VERIFIED_AGE_HOURS.
const BROADCAST_MIN_EXPIRY_HOURS = BROADCAST.MIN_EXPIRY_HOURS;
const BROADCAST_MAX_VERIFIED_AGE_HOURS = BROADCAST.MAX_VERIFIED_AGE_HOURS;

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTelegramErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.description || error.message;
    }
    return error instanceof Error ? error.message : 'Unknown error';
}

function toNumber(value: unknown): number {
    return Number(value);
}

// ============================================
// TELEGRAM API
// ============================================

async function sendTelegramMessage(text: string): Promise<boolean> {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: CHAT_ID,
            text,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: false,
        });
        return true;
    } catch (error) {
        console.error('  ❌ Telegram send failed:', getTelegramErrorMessage(error));
        return false;
    }
}

// ============================================
// MAIN
// ============================================

export async function runBroadcast() {
    console.log('📢 Starting Telegram broadcast...');
    const startTime = Date.now();

    const now = new Date();
    const nearExpiryCutoff = new Date(now.getTime() + BROADCAST_MIN_EXPIRY_HOURS * 3600_000);
    const staleCutoff = new Date(now.getTime() - BROADCAST_MAX_VERIFIED_AGE_HOURS * 3600_000);

    const couponGuardWhere = {
        isActive: true,
        verifiedAt: { gte: staleCutoff },
        OR: [
            { expiresAt: null },
            { expiresAt: { gt: nearExpiryCutoff } },
        ],
    };

    // Find unposted courses with broadcastable coupons
    const [screenedOut, courses] = await Promise.all([
        // Courses held back because their coupons are near-expiry or stale
        prisma.course.count({
            where: {
                isPosted: false,
                isActive: true,
                coupons: { some: { isActive: true } },
                NOT: { coupons: { some: couponGuardWhere } },
            },
        }),
        prisma.course.findMany({
            where: {
                isPosted: false,
                isActive: true,
                coupons: { some: couponGuardWhere },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                instructorName: true,
                originalPrice: true,
                rating: true,
                studentCount: true,
                language: true,
                category: {
                    select: { name: true },
                },
                coupons: {
                    where: couponGuardWhere,
                    select: {
                        finalPrice: true,
                        discountValue: true,
                        expiresAt: true,
                        verifiedAt: true,
                        code: true,
                    },
                    orderBy: { discountValue: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 10, // Limit per run to avoid flooding
        }),
    ]);

    if (screenedOut > 0) {
        console.log(`📋 ${screenedOut} course(s) held back (coupon near-expiry or stale)`);
    }

    if (courses.length === 0) {
        console.log('📭 No unposted courses found.');
        return { posted: 0, screenedOut, elapsed: '0.0' };
    }

    console.log(`📬 Found ${courses.length} courses to broadcast`);

    let successCount = 0;

    for (const course of courses) {
        const coupon = course.coupons[0];

        // Re-check before sending: the coupon may have expired or gone
        // stale between the query and the send (races with sync/cleanup).
        if (!coupon || !shouldBroadcastCoupon({
            expiresAt: coupon.expiresAt,
            verifiedAt: coupon.verifiedAt,
            minExpiryHours: BROADCAST_MIN_EXPIRY_HOURS,
            maxVerifiedAgeHours: BROADCAST_MAX_VERIFIED_AGE_HOURS,
        })) {
            console.log(`  ⏭️  Guarded: ${course.title.substring(0, 50)}... (coupon no longer broadcastable)`);
            continue;
        }

        const message = formatCourseMessage({
            ...course,
            originalPrice: toNumber(course.originalPrice),
            rating: course.rating ? toNumber(course.rating) : null,
            coupons: course.coupons.map((c) => ({
                ...c,
                finalPrice: toNumber(c.finalPrice),
                discountValue: toNumber(c.discountValue),
            })),
        });

        const sent = await sendTelegramMessage(message);

        if (sent) {
            await prisma.course.update({
                where: { id: course.id },
                data: { isPosted: true },
            });
            successCount++;
            console.log(`  ✅ Posted: ${course.title.substring(0, 50)}...`);
        } else {
            console.log(`  ⏭️  Skipped: ${course.title.substring(0, 50)}...`);
        }

        // Telegram rate limit: max 30 messages per second to chats
        await sleep(1500);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Broadcast complete! ${successCount}/${courses.length} posted in ${elapsed}s`);
    return { posted: successCount, total: courses.length, screenedOut, elapsed };
}

async function main() {
    try {
        await runBroadcast();
    } catch (error) {
        console.error('❌ Broadcast failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}
