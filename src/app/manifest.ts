import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SearchCourse',
        short_name: 'SearchCourse',
        description: 'Discover the best online course deals',
        start_url: '/',
        display: 'standalone',
        background_color: '#faf9f7',
        theme_color: '#1a1917',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
