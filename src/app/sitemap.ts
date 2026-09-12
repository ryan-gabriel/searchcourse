import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/roadmaps`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/platforms`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

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

    const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    const roadmapPages: MetadataRoute.Sitemap = roadmaps.map((roadmap) => ({
        url: `${baseUrl}/roadmaps/${roadmap.slug}`,
        lastModified: roadmap.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    const platformPages: MetadataRoute.Sitemap = platforms.map((platform) => ({
        url: `${baseUrl}/platforms/${platform.slug}`,
        lastModified: platform.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    return [
        ...staticPages,
        ...coursePages,
        ...roadmapPages,
        ...categoryPages,
        ...platformPages,
    ];
}