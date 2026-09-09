import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/services', () => ({
    getCourseBySlug: vi.fn(),
}));

import { getCourseBySlug } from '@/services';
import { GET } from '@/app/go/[slug]/route';

const mockGetCourseBySlug = vi.mocked(getCourseBySlug);

describe('GET /go/[slug]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to the course detail page with src=tg', async () => {
        mockGetCourseBySlug.mockResolvedValue({
            id: 'course-1',
            slug: 'microsoft-excel-basics',
        } as never);

        const req = new NextRequest('https://searchcourse.vercel.app/go/microsoft-excel-basics');
        const ctx = { params: Promise.resolve({ slug: 'microsoft-excel-basics' }) };

        const res = await GET(req, ctx as never);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe(
            'https://searchcourse.vercel.app/courses/microsoft-excel-basics?src=tg'
        );
        expect(mockGetCourseBySlug).toHaveBeenCalledWith('microsoft-excel-basics');
    });

    it('returns 404 when the course is not found', async () => {
        mockGetCourseBySlug.mockResolvedValue(null);

        const req = new NextRequest('https://searchcourse.vercel.app/go/nope');
        const ctx = { params: Promise.resolve({ slug: 'nope' }) };

        const res = await GET(req, ctx as never);

        expect(res.status).toBe(404);
    });
});
