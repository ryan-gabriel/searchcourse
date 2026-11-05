import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';

vi.mock('@/services', () => ({
    getCourseBySlug: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
}));

import { getCourseBySlug } from '@/services';
import GoPage from '@/app/go/[slug]/page';

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

        const ctx = { params: Promise.resolve({ slug: 'microsoft-excel-basics' }) };

        await expect(GoPage(ctx as never)).rejects.toThrow(
            'NEXT_REDIRECT:https://searchcourse.vercel.app/courses/microsoft-excel-basics?src=tg'
        );
        expect(mockGetCourseBySlug).toHaveBeenCalledWith('microsoft-excel-basics');
    });

    it('redirects to courses when the course is not found', async () => {
        mockGetCourseBySlug.mockResolvedValue(null);

        const ctx = { params: Promise.resolve({ slug: 'nope' }) };

        await expect(GoPage(ctx as never)).rejects.toThrow('NEXT_REDIRECT:/courses');
    });
});