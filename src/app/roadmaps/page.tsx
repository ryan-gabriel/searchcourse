import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { RoadmapCard } from '@/components/roadmap-card';
import { EmptyState } from '@/components/states';
import { Pagination } from '@/components/pagination';
import { searchRoadmaps } from '@/services';
import { buildItemListSchema } from '@/lib/seo/schema';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Roadmaps',
  description:
    'Curated learning paths for common career goals, with a structured sequence of the best-value courses to get you from beginner to job-ready.',
  alternates: { canonical: siteUrl('/roadmaps') },
};

export const revalidate = 300;

export default async function RoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const awaited = await searchParams;
  const page = Math.max(1, Number(awaited.page) || 1);
  const result = await searchRoadmaps({ page, limit: 20, isActive: true, hasCourses: true });

  const jsonLd = buildItemListSchema(
    result.data.map((roadmap) => ({
      name: roadmap.title,
      url: siteUrl(`/roadmaps/${roadmap.slug}`),
    }))
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Learning roadmaps</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Follow a structured sequence of courses instead of guessing what to learn next. Every path is built around
            current verified deals.
          </p>
        </header>

        {result.data.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((roadmap) => <RoadmapCard key={roadmap.id} roadmap={roadmap} />)}
            </div>
            <Pagination
              page={page}
              totalPages={result.pagination.totalPages}
              buildHref={(next) => (next > 1 ? `/roadmaps?page=${next}` : '/roadmaps')}
            />
          </>
        ) : (
          <EmptyState
            title="No learning paths yet"
            body="Curated roadmaps are being built. Check back soon."
          />
        )}
      </Container>
    </>
  );
}