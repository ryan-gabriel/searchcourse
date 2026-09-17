import { prisma } from '@/lib/prisma';

export async function getSitemapEntries() {
    const [courses, roadmaps, categories, platforms] = await Promise.all([
        prisma.course.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        }),
        prisma.roadmap.findMany({
            where: { isActive: true, steps: { some: {} } },
            select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({
            where: { courses: { some: { isActive: true } } },
            select: { slug: true, updatedAt: true },
        }),
        prisma.platform.findMany({
            where: { isActive: true, courses: { some: { isActive: true } } },
            select: { slug: true, updatedAt: true },
        }),
    ]);

    return { courses, roadmaps, categories, platforms };
}