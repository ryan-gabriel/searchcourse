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
import { prisma } from "@/lib/prisma";

// ============================================
// CONFIG
// ============================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://searchcourse.com';

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required');
    process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatPrice(price: number): string {
    return price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
}

function formatDiscount(discountValue: number): string {
    return `${Math.round(discountValue)}% off`;
}

function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function buildBrandedLink(slug: string): string {
    return `${SITE_BASE_URL}/go/${slug}`;
}

function formatCourseMessage(course: {
    title: string;
    slug: string;
    instructorName: string | null;
    originalPrice: number;
    rating: number | null;
    studentCount: number;
    language: string | null;
    category: { name: string } | null;
    coupons: {
        finalPrice: number;
        discountValue: number;
        expiresAt: Date | null;
        code: string | null;
    }[];
}): string {
    const coupon = course.coupons[0];
    const link = buildBrandedLink(course.slug);

    const lines: string[] = [];

    // Title
    lines.push(`🎓 *${escapeMarkdown(course.title)}*`);
    lines.push('');

    // Price info
    if (coupon) {
        const original = formatPrice(course.originalPrice);
        const final = formatPrice(coupon.finalPrice);
        lines.push(`💰 ~~${escapeMarkdown(original)}~~ → *${escapeMarkdown(final)}* \\(${escapeMarkdown(formatDiscount(coupon.discountValue))}\\)`);
    }

    // Details
    if (course.instructorName) {
        lines.push(`👨‍🏫 ${escapeMarkdown(course.instructorName)}`);
    }

    if (course.rating) {
        const stars = '⭐'.repeat(Math.round(course.rating));
        lines.push(`${stars} ${course.rating.toFixed(1)} rating`);
    }

    if (course.studentCount > 0) {
        const formatted = course.studentCount.toLocaleString();
        lines.push(`👥 ${formatted} students`);
    }

    if (course.category) {
        lines.push(`📂 ${escapeMarkdown(course.category.name)}`);
    }

    if (course.language) {
        lines.push(`🌐 ${escapeMarkdown(course.language)}`);
    }

    // Expiry
    if (coupon?.expiresAt) {
        const expiry = new Date(coupon.expiresAt);
        const hoursLeft = Math.max(0, Math.round((expiry.getTime() - Date.now()) / 3600000));
        if (hoursLeft <= 48) {
            lines.push(`⏰ *Expires in ${hoursLeft}h*`);
        }
    }

    lines.push('');
    lines.push(`🔗 [Get this course](${link})`);
    lines.push('');
    lines.push(`_via SearchCourse_`);

    return lines.join('\n');
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
        const e = error as { response?: { data?: unknown }; message?: string };
        console.error('  ❌ Telegram send failed:', e?.response?.data || e?.message);
        return false;
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('📢 Starting Telegram broadcast...');
    const startTime = Date.now();

    try {
        // Find unposted courses with active coupons
        const courses = await prisma.course.findMany({
            where: {
                isPosted: false,
                isActive: true,
                coupons: {
                    some: {
                        isActive: true,
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } },
                        ],
                    },
                },
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
                    where: {
                        isActive: true,
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } },
                        ],
                    },
                    select: {
                        finalPrice: true,
                        discountValue: true,
                        expiresAt: true,
                        code: true,
                    },
                    orderBy: { discountValue: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 10, // Limit per run to avoid flooding
        });

        if (courses.length === 0) {
            console.log('📭 No unposted courses found.');
            return;
        }

        console.log(`📬 Found ${courses.length} courses to broadcast`);

        let successCount = 0;

        for (const course of courses) {
            const message = formatCourseMessage({
                ...course,
                originalPrice: Number(course.originalPrice),
                rating: course.rating ? Number(course.rating) : null,
                coupons: course.coupons.map((c: { finalPrice: unknown; discountValue: unknown; expiresAt: Date | null; code: string | null }) => ({
                    ...c,
                    finalPrice: Number(c.finalPrice),
                    discountValue: Number(c.discountValue),
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
    } catch (error) {
        console.error('❌ Broadcast failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
