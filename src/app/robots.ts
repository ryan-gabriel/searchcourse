import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/login'],
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'OAI-SearchBot',
                    'PerplexityBot',
                    'ClaudeBot',
                    'anthropic-ai',
                    'Google-Extended',
                    'Bingbot',
                ],
                allow: '/',
                disallow: ['/api/', '/admin/', '/login'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
