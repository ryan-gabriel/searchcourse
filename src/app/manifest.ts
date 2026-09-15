import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SearchCourse',
        short_name: 'SearchCourse',
        description: 'Discover the best online course deals',
        start_url: '/',
        display: 'standalone',
        background_color: '#f5f2ec',
        theme_color: '#12303f',
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
