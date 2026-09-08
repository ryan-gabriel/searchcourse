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
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    const [courses, roadmaps] = await Promise.all([
        prisma.course.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        }),
        prisma.roadmap.findMany({
            where: { isActive: true },
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

    return [...staticPages, ...coursePages, ...roadmapPages];
}
