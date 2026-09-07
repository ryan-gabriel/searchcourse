import { formatPriceSimple } from '@/lib/utils';

const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://searchcourse.vercel.app';

function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function formatDiscount(discountValue: number): string {
    return `${Math.round(discountValue)}% off`;
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
        const original = formatPriceSimple(course.originalPrice);
        const final = formatPriceSimple(coupon.finalPrice);
        lines.push(`💰 ~~${escapeMarkdown(original)}~~ → *${escapeMarkdown(final)}* \\(${escapeMarkdown(formatDiscount(coupon.discountValue))}\\)`);
    }

    // Details
    if (course.instructorName) {
        lines.push(`👨‍🏫 ${escapeMarkdown(course.instructorName)}`);
    }

    if (course.rating) {
        const stars = '⭐'.repeat(Math.round(course.rating));
        lines.push(`${stars} ${escapeMarkdown(course.rating.toFixed(1))} rating`);
    }

    if (course.studentCount > 0) {
        const formatted = course.studentCount.toLocaleString();
        lines.push(`👥 ${escapeMarkdown(formatted)} students`);
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
            lines.push(`⏰ *Expires in ${escapeMarkdown(String(hoursLeft))}h*`);
        }
    }

    lines.push('');
    lines.push(`🔗 [Get this course](${link})`);
    lines.push('');
    lines.push(`_via SearchCourse_`);

    return lines.join('\n');
}

export { escapeMarkdown, formatDiscount, formatCourseMessage };